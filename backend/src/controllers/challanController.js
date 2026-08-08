const { pool } = require('../config/db');

const getPagination = (query) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  return {
    page: page < 1 ? 1 : page,
    limit: limit < 1 ? 10 : limit,
    offset: (page - 1) * limit,
  };
};

const mergeDuplicateItems = (items) => {
  const merged = new Map();
  items.forEach((item) => {
    const productId = Number(item.productId);
    const quantity = Number(item.quantity);
    if (!merged.has(productId)) {
      merged.set(productId, { productId, quantity });
    } else {
      const existing = merged.get(productId);
      existing.quantity += quantity;
    }
  });
  return Array.from(merged.values());
};

const buildChallanFilters = (query) => {
  const filters = [];
  const values = [];

  if (query.search) {
    values.push(`%${query.search.trim()}%`);
    filters.push(`challan_number ILIKE $${values.length}`);
  }

  if (query.status) {
    values.push(query.status);
    filters.push(`status = $${values.length}`);
  }

  if (query.customerId) {
    values.push(Number(query.customerId));
    filters.push(`customer_id = $${values.length}`);
  }

  const whereClause = filters.length > 0 ? `WHERE ${filters.join(' AND ')}` : '';
  return { whereClause, values };
};

const generateChallanNumber = async (client) => {
  const year = new Date().getFullYear();
  const lockKey = year;
  await client.query('SELECT pg_advisory_xact_lock($1)', [lockKey]);

  const result = await client.query(
    `SELECT MAX((regexp_replace(challan_number, '^CH-\\d+-', '')::int)) AS max_sequence
     FROM challans
     WHERE challan_number LIKE $1`,
    [`CH-${year}-%`]
  );

  let nextSequence = 1;
  if (result.rowCount > 0 && result.rows[0].max_sequence !== null) {
    nextSequence = Number(result.rows[0].max_sequence) + 1;
  }

  return `CH-${year}-${String(nextSequence).padStart(4, '0')}`;
};

const getChallans = async (req, res, next) => {
  try {
    const { page, limit, offset } = getPagination(req.query);
    const { whereClause, values } = buildChallanFilters(req.query);

    const countResult = await pool.query(`SELECT COUNT(*) AS total FROM challans ${whereClause}`, values);
    const total = Number(countResult.rows[0].total);

    const dataQuery = `
      SELECT
        challans.id,
        challans.challan_number,
        challans.customer_id,
        challans.total_quantity,
        challans.status,
        challans.created_by,
        challans.created_at,
        challans.updated_at,
        customers.name AS customer_name,
        customers.business_name AS customer_business_name
      FROM challans
      LEFT JOIN customers ON customers.id = challans.customer_id
      ${whereClause}
      ORDER BY challans.id DESC
      LIMIT $${values.length + 1}
      OFFSET $${values.length + 2}
    `;

    const dataResult = await pool.query(dataQuery, [...values, limit, offset]);

    const dataWithCustomer = dataResult.rows.map((row) => ({
      id: row.id,
      challan_number: row.challan_number,
      customer_id: row.customer_id,
      total_quantity: row.total_quantity,
      status: row.status,
      created_by: row.created_by,
      created_at: row.created_at,
      updated_at: row.updated_at,
      customer: row.customer_id
        ? {
            id: row.customer_id,
            name: row.customer_name,
            business_name: row.customer_business_name,
          }
        : null,
    }));

    return res.json({
      success: true,
      data: dataWithCustomer,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

const createChallan = async (req, res, next) => {
  const { customerId, items } = req.body;

  if (!customerId) {
    return res.status(400).json({ success: false, message: 'customerId is required' });
  }

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ success: false, message: 'items must be a non-empty array' });
  }

  const validatedItems = items.map((item) => ({
    productId: Number(item.productId),
    quantity: Number(item.quantity),
  }));

  for (const item of validatedItems) {
    if (!item.productId || Number.isNaN(item.productId)) {
      return res.status(400).json({ success: false, message: 'Each item must have a valid productId' });
    }
    if (!item.quantity || Number.isNaN(item.quantity) || item.quantity <= 0) {
      return res.status(400).json({ success: false, message: 'Each item quantity must be a positive number' });
    }
  }

  const itemsToInsert = mergeDuplicateItems(validatedItems);

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const customerResult = await client.query('SELECT id, name, business_name FROM customers WHERE id = $1', [customerId]);
    if (customerResult.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    const productIds = itemsToInsert.map((item) => item.productId);
    const productsResult = await client.query(
      `SELECT id, name, sku, unit_price FROM products WHERE id = ANY($1)`,
      [productIds]
    );

    if (productsResult.rowCount !== productIds.length) {
      const foundIds = productsResult.rows.map((row) => row.id);
      const missing = productIds.filter((id) => !foundIds.includes(id));
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: `Product not found: ${missing.join(', ')}` });
    }

    const challanNumber = await generateChallanNumber(client);
    const totalQuantity = itemsToInsert.reduce((sum, item) => sum + item.quantity, 0);

    const challanResult = await client.query(
      `INSERT INTO challans (challan_number, customer_id, total_quantity, status, created_by)
       VALUES ($1, $2, $3, 'Draft', $4)
       RETURNING id, challan_number, customer_id, total_quantity, status, created_by, created_at, updated_at`,
      [challanNumber, customerId, totalQuantity, req.session.user.id]
    );

    const productMap = new Map(productsResult.rows.map((row) => [row.id, row]));

    for (const item of itemsToInsert) {
      const product = productMap.get(item.productId);
      await client.query(
        `INSERT INTO challan_items (challan_id, product_id, product_name_snapshot, sku_snapshot, unit_price_snapshot, quantity)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          challanResult.rows[0].id,
          product.id,
          product.name,
          product.sku,
          product.unit_price,
          item.quantity,
        ]
      );
    }

    await client.query('COMMIT');

    return res.status(201).json({ success: true, data: challanResult.rows[0] });
  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
};

const getChallanById = async (req, res, next) => {
  const { id } = req.params;

  try {
    const challanResult = await pool.query(
      `SELECT id, challan_number, customer_id, total_quantity, status, created_by, created_at, updated_at
       FROM challans
       WHERE id = $1`,
      [id]
    );

    if (challanResult.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Challan not found' });
    }

    const challan = challanResult.rows[0];
    const customerResult = await pool.query(
      `SELECT id, name, business_name FROM customers WHERE id = $1`,
      [challan.customer_id]
    );

    const itemResult = await pool.query(
      `SELECT product_id, product_name_snapshot AS product_name, sku_snapshot AS sku, unit_price_snapshot AS unit_price, quantity
       FROM challan_items
       WHERE challan_id = $1`,
      [id]
    );

    if (customerResult.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Customer not found for challan' });
    }

    return res.json({
      success: true,
      data: {
        id: challan.id,
        challan_number: challan.challan_number,
        customer: customerResult.rows[0],
        status: challan.status,
        total_quantity: challan.total_quantity,
        created_by: challan.created_by,
        created_at: challan.created_at,
        items: itemResult.rows,
      },
    });
  } catch (error) {
    next(error);
  }
};

const confirmChallan = async (req, res, next) => {
  const { id } = req.params;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const challanResult = await client.query(
      `SELECT id, challan_number, status FROM challans WHERE id = $1 FOR UPDATE`,
      [id]
    );

    if (challanResult.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'Challan not found' });
    }

    const challan = challanResult.rows[0];
    if (challan.status === 'Confirmed') {
      await client.query('ROLLBACK');
      return res.status(400).json({ success: false, message: 'Challan is already confirmed' });
    }
    if (challan.status === 'Cancelled') {
      await client.query('ROLLBACK');
      return res.status(400).json({ success: false, message: 'Cancelled challan cannot be confirmed' });
    }

    const itemResult = await client.query(
      `SELECT id, product_id, quantity FROM challan_items WHERE challan_id = $1`,
      [id]
    );

    const items = itemResult.rows;
    if (items.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ success: false, message: 'Challan has no items' });
    }

    const productLockResults = [];
    for (const item of items) {
      const productResult = await client.query(
        `SELECT id, name, current_stock FROM products WHERE id = $1 FOR UPDATE`,
        [item.product_id]
      );

      if (productResult.rowCount === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ success: false, message: `Product not found: ${item.product_id}` });
      }

      const product = productResult.rows[0];
      if (product.current_stock < item.quantity) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          success: false,
          message: 'Insufficient stock',
          product: {
            id: product.id,
            name: product.name,
            available: product.current_stock,
            requested: item.quantity,
          },
        });
      }

      productLockResults.push({ product, item });
    }

    for (const { product, item } of productLockResults) {
      const newStock = product.current_stock - item.quantity;
      await client.query(
        'UPDATE products SET current_stock = $1, updated_at = NOW() WHERE id = $2',
        [newStock, product.id]
      );
      await client.query(
        `INSERT INTO stock_movements (product_id, quantity, movement_type, reason, created_by)
         VALUES ($1, $2, 'OUT', $3, $4)`,
        [
          product.id,
          item.quantity,
          `Sales Challan ${challan.challan_number}`,
          req.session.user.id,
        ]
      );
    }

    await client.query('UPDATE challans SET status = $1, updated_at = NOW() WHERE id = $2', ['Confirmed', id]);
    await client.query('COMMIT');

    return res.json({
      success: true,
      message: 'Challan confirmed successfully',
      data: {
        challanId: Number(id),
        challanNumber: challan.challan_number,
        status: 'Confirmed',
      },
    });
  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
};

const cancelChallan = async (req, res, next) => {
  const { id } = req.params;

  try {
    const challanResult = await pool.query('SELECT id, status FROM challans WHERE id = $1', [id]);

    if (challanResult.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Challan not found' });
    }

    const challan = challanResult.rows[0];
    if (challan.status === 'Confirmed') {
      return res.status(400).json({ success: false, message: 'Confirmed challan cannot be cancelled' });
    }
    if (challan.status === 'Cancelled') {
      return res.status(400).json({ success: false, message: 'Challan is already cancelled' });
    }

    await pool.query('UPDATE challans SET status = $1, updated_at = NOW() WHERE id = $2', ['Cancelled', id]);

    return res.json({ success: true, message: 'Challan cancelled successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getChallans,
  createChallan,
  getChallanById,
  confirmChallan,
  cancelChallan,
};
