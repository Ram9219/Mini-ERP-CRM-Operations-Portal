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

const buildProductFilters = (query) => {
  const filters = [];
  const values = [];

  if (query.search) {
    const searchTerm = `%${query.search.trim()}%`;
    values.push(searchTerm, searchTerm, searchTerm, searchTerm);
    filters.push(
      `(name ILIKE $${values.length - 3} OR sku ILIKE $${values.length - 2} OR category ILIKE $${values.length - 1} OR warehouse_location ILIKE $${values.length})`
    );
  }

  if (query.category) {
    values.push(query.category);
    filters.push(`category = $${values.length}`);
  }

  if (query.lowStock === 'true' || query.lowStock === '1') {
    filters.push('current_stock <= minimum_stock');
  }

  const whereClause = filters.length > 0 ? `WHERE ${filters.join(' AND ')}` : '';
  return { whereClause, values };
};

const validateProductPayload = ({ name, sku, category, unit_price, current_stock, minimum_stock, warehouse_location }) => {
  if (!name) {
    return 'name is required';
  }
  if (!sku) {
    return 'sku is required';
  }
  if (!category) {
    return 'category is required';
  }
  if (unit_price === undefined || unit_price === null || Number(unit_price) < 0) {
    return 'unit_price must be a non-negative number';
  }
  if (current_stock === undefined || current_stock === null || Number(current_stock) < 0) {
    return 'current_stock must be a non-negative number';
  }
  if (minimum_stock === undefined || minimum_stock === null || Number(minimum_stock) < 0) {
    return 'minimum_stock must be a non-negative number';
  }
  if (!warehouse_location) {
    return 'warehouse_location is required';
  }
  return null;
};

const getProducts = async (req, res, next) => {
  try {
    const { page, limit, offset } = getPagination(req.query);
    const { whereClause, values } = buildProductFilters(req.query);

    const countQuery = `SELECT COUNT(*) AS total FROM products ${whereClause}`;
    const countResult = await pool.query(countQuery, values);
    const total = Number(countResult.rows[0].total);

    const dataQuery = `
      SELECT id, name, sku, category, unit_price, current_stock, minimum_stock, warehouse_location, created_at, updated_at
      FROM products
      ${whereClause}
      ORDER BY id DESC
      LIMIT $${values.length + 1}
      OFFSET $${values.length + 2}
    `;
    const dataResult = await pool.query(dataQuery, [...values, limit, offset]);

    return res.json({
      success: true,
      data: dataResult.rows,
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

const createProduct = async (req, res, next) => {
  const {
    name,
    sku,
    category,
    unit_price,
    current_stock,
    minimum_stock,
    warehouse_location,
  } = req.body;

  const validationError = validateProductPayload({
    name,
    sku,
    category,
    unit_price,
    current_stock,
    minimum_stock,
    warehouse_location,
  });

  if (validationError) {
    return res.status(400).json({ success: false, message: validationError });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const insertProductQuery = `
      INSERT INTO products (name, sku, category, unit_price, current_stock, minimum_stock, warehouse_location)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, name, sku, category, unit_price, current_stock, minimum_stock, warehouse_location, created_at, updated_at
    `;

    const productResult = await client.query(insertProductQuery, [
      name,
      sku,
      category,
      unit_price,
      current_stock,
      minimum_stock,
      warehouse_location,
    ]);

    const product = productResult.rows[0];

    if (Number(current_stock) > 0) {
      await client.query(
        `INSERT INTO stock_movements (product_id, quantity, movement_type, reason, created_by)
         VALUES ($1, $2, 'IN', $3, $4)`,
        [product.id, current_stock, 'Initial stock', req.session.user.id]
      );
    }

    await client.query('COMMIT');
    return res.status(201).json({ success: true, data: product });
  } catch (error) {
    await client.query('ROLLBACK');
    if (error.code === '23505' && error.constraint && error.constraint.includes('sku')) {
      return res.status(409).json({ success: false, message: 'SKU already exists' });
    }
    next(error);
  } finally {
    client.release();
  }
};

const getProductById = async (req, res, next) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT id, name, sku, category, unit_price, current_stock, minimum_stock, warehouse_location, created_at, updated_at
       FROM products
       WHERE id = $1`,
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const product = result.rows[0];
    product.isLowStock = product.current_stock <= product.minimum_stock;

    return res.json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

const updateProduct = async (req, res, next) => {
  const { id } = req.params;
  const {
    name,
    sku,
    category,
    unit_price,
    minimum_stock,
    warehouse_location,
    current_stock,
    id: bodyId,
    created_at,
  } = req.body;

  if (bodyId !== undefined || created_at !== undefined || current_stock !== undefined) {
    return res.status(400).json({
      success: false,
      message: 'Cannot update id, current_stock, or created_at through this endpoint',
    });
  }

  if (unit_price !== undefined && Number(unit_price) < 0) {
    return res.status(400).json({ success: false, message: 'unit_price must be a non-negative number' });
  }

  if (minimum_stock !== undefined && Number(minimum_stock) < 0) {
    return res.status(400).json({ success: false, message: 'minimum_stock must be a non-negative number' });
  }

  const fields = [];
  const values = [];

  const addField = (fieldName, value) => {
    if (value !== undefined) {
      fields.push(`${fieldName} = $${values.length + 1}`);
      values.push(value);
    }
  };

  addField('name', name);
  addField('sku', sku);
  addField('category', category);
  addField('unit_price', unit_price);
  addField('minimum_stock', minimum_stock);
  addField('warehouse_location', warehouse_location);
  if (fields.length === 0) {
    return res.status(400).json({ success: false, message: 'No valid fields provided for update' });
  }

  fields.push('updated_at = NOW()');
  values.push(id);

  try {
    const result = await pool.query(
      `UPDATE products SET ${fields.join(', ')} WHERE id = $${values.length} RETURNING id, name, sku, category, unit_price, current_stock, minimum_stock, warehouse_location, created_at, updated_at`,
      values
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    return res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    if (error.code === '23505' && error.constraint && error.constraint.includes('sku')) {
      return res.status(409).json({ success: false, message: 'SKU already exists' });
    }
    next(error);
  }
};

const deleteProduct = async (req, res, next) => {
  const { id } = req.params;

  try {
    const stockMovementCheck = await pool.query(
      'SELECT 1 FROM stock_movements WHERE product_id = $1 LIMIT 1',
      [id]
    );

    if (stockMovementCheck.rowCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Product cannot be deleted because stock movements exist',
      });
    }

    const challanItemCheck = await pool.query(
      'SELECT 1 FROM challan_items WHERE product_id = $1 LIMIT 1',
      [id]
    );

    if (challanItemCheck.rowCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Product cannot be deleted because historical challan items exist',
      });
    }

    const result = await pool.query('DELETE FROM products WHERE id = $1 RETURNING id', [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    return res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    next(error);
  }
};

const addStock = async (req, res, next) => {
  const { id } = req.params;
  const { quantity, reason } = req.body;

  if (quantity === undefined || quantity === null || Number(quantity) <= 0) {
    return res.status(400).json({ success: false, message: 'quantity must be a positive number' });
  }

  if (!reason) {
    return res.status(400).json({ success: false, message: 'reason is required' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const productResult = await client.query(
      'SELECT current_stock FROM products WHERE id = $1 FOR UPDATE',
      [id]
    );

    if (productResult.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const currentStock = Number(productResult.rows[0].current_stock);
    const newStock = currentStock + Number(quantity);

    await client.query('UPDATE products SET current_stock = $1, updated_at = NOW() WHERE id = $2', [newStock, id]);

    await client.query(
      `INSERT INTO stock_movements (product_id, quantity, movement_type, reason, created_by)
       VALUES ($1, $2, 'IN', $3, $4)`,
      [id, quantity, reason, req.session.user.id]
    );

    await client.query('COMMIT');

    return res.json({
      success: true,
      message: 'Stock added successfully',
      data: {
        productId: Number(id),
        quantityAdded: Number(quantity),
        currentStock: newStock,
      },
    });
  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
};

const getStockMovements = async (req, res, next) => {
  const { id } = req.params;
  const { page, limit, offset } = getPagination(req.query);

  try {
    const productResult = await pool.query('SELECT id FROM products WHERE id = $1', [id]);
    if (productResult.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const countResult = await pool.query(
      'SELECT COUNT(*) AS total FROM stock_movements WHERE product_id = $1',
      [id]
    );
    const total = Number(countResult.rows[0].total);

    const movementsResult = await pool.query(
      `SELECT id, quantity, movement_type, reason, created_by, created_at
       FROM stock_movements
       WHERE product_id = $1
       ORDER BY created_at DESC
       LIMIT $2
       OFFSET $3`,
      [id, limit, offset]
    );

    return res.json({
      success: true,
      data: movementsResult.rows,
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

module.exports = {
  getProducts,
  createProduct,
  getProductById,
  updateProduct,
  deleteProduct,
  addStock,
  getStockMovements,
};
