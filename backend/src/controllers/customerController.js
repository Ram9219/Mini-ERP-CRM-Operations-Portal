const { pool } = require('../config/db');

const CUSTOMER_TYPES = ['Retail', 'Wholesale', 'Distributor'];
const CUSTOMER_STATUSES = ['Lead', 'Active', 'Inactive'];

const isValidEmail = (email) => {
  if (!email) return true;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isValidDate = (value) => {
  if (!value) return true;
  const date = new Date(value);
  return !Number.isNaN(date.getTime());
};

const parsePagination = (query) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  return {
    page: page < 1 ? 1 : page,
    limit: limit < 1 ? 10 : limit,
  };
};

const buildCustomerFilters = (query) => {
  const filters = [];
  const values = [];

  if (query.search) {
    values.push(`%${query.search.trim()}%`);
    values.push(`%${query.search.trim()}%`);
    values.push(`%${query.search.trim()}%`);
    values.push(`%${query.search.trim()}%`);
    filters.push(
      `(name ILIKE $${values.length - 3} OR mobile ILIKE $${values.length - 2} OR email ILIKE $${values.length - 1} OR business_name ILIKE $${values.length})`
    );
  }

  if (query.status) {
    values.push(query.status);
    filters.push(`status = $${values.length}`);
  }

  if (query.customer_type) {
    values.push(query.customer_type);
    filters.push(`customer_type = $${values.length}`);
  }

  const whereClause = filters.length > 0 ? `WHERE ${filters.join(' AND ')}` : '';
  return { whereClause, values };
};

const getCustomers = async (req, res, next) => {
  try {
    const { page, limit } = parsePagination(req.query);
    const offset = (page - 1) * limit;
    const { whereClause, values } = buildCustomerFilters(req.query);

    const countQuery = `SELECT COUNT(*) AS total FROM customers ${whereClause}`;
    const countResult = await pool.query(countQuery, values);
    const total = Number(countResult.rows[0].total);

    const dataQuery = `
      SELECT id, name, mobile, email, business_name, gst_number, customer_type, address, status, follow_up_date, notes, created_by, created_at, updated_at
      FROM customers
      ${whereClause}
      ORDER BY id DESC
      LIMIT $${values.length + 1}
      OFFSET $${values.length + 2}
    `;

    const dataValues = [...values, limit, offset];
    const dataResult = await pool.query(dataQuery, dataValues);

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

const createCustomer = async (req, res, next) => {
  const {
    name,
    mobile,
    email,
    business_name,
    gst_number,
    customer_type,
    address,
    status,
    follow_up_date,
    notes,
  } = req.body;

  if (!name || !mobile) {
    return res.status(400).json({
      success: false,
      message: 'Name and mobile are required',
    });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({
      success: false,
      message: 'Email is invalid',
    });
  }

  if (!CUSTOMER_TYPES.includes(customer_type)) {
    return res.status(400).json({
      success: false,
      message: `customer_type must be one of: ${CUSTOMER_TYPES.join(', ')}`,
    });
  }

  if (!CUSTOMER_STATUSES.includes(status)) {
    return res.status(400).json({
      success: false,
      message: `status must be one of: ${CUSTOMER_STATUSES.join(', ')}`,
    });
  }

  if (!isValidDate(follow_up_date)) {
    return res.status(400).json({
      success: false,
      message: 'follow_up_date must be a valid date',
    });
  }

  try {
    const result = await pool.query(
      `INSERT INTO customers
        (name, mobile, email, business_name, gst_number, customer_type, address, status, follow_up_date, notes, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING id, name, mobile, email, business_name, gst_number, customer_type, address, status, follow_up_date, notes, created_by, created_at, updated_at`,
      [
        name,
        mobile,
        email || null,
        business_name || null,
        gst_number || null,
        customer_type,
        address || null,
        status,
        follow_up_date || null,
        notes || null,
        req.session.user.id,
      ]
    );

    return res.status(201).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

const getCustomerById = async (req, res, next) => {
  const { id } = req.params;

  try {
    const customerResult = await pool.query(
      `SELECT id, name, mobile, email, business_name, gst_number, customer_type, address, status, follow_up_date, notes, created_by, created_at, updated_at
       FROM customers
       WHERE id = $1`,
      [id]
    );

    if (customerResult.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found',
      });
    }

    const followupsResult = await pool.query(
      `SELECT id, note, follow_up_date, created_by, created_at
       FROM customer_followups
       WHERE customer_id = $1
       ORDER BY created_at DESC`,
      [id]
    );

    const customer = customerResult.rows[0];
    customer.followups = followupsResult.rows;

    return res.json({
      success: true,
      data: customer,
    });
  } catch (error) {
    next(error);
  }
};

const updateCustomer = async (req, res, next) => {
  const { id } = req.params;
  const {
    name,
    mobile,
    email,
    business_name,
    gst_number,
    customer_type,
    address,
    status,
    follow_up_date,
    notes,
  } = req.body;

  if (email && !isValidEmail(email)) {
    return res.status(400).json({
      success: false,
      message: 'Email is invalid',
    });
  }

  if (customer_type && !CUSTOMER_TYPES.includes(customer_type)) {
    return res.status(400).json({
      success: false,
      message: `customer_type must be one of: ${CUSTOMER_TYPES.join(', ')}`,
    });
  }

  if (status && !CUSTOMER_STATUSES.includes(status)) {
    return res.status(400).json({
      success: false,
      message: `status must be one of: ${CUSTOMER_STATUSES.join(', ')}`,
    });
  }

  if (follow_up_date && !isValidDate(follow_up_date)) {
    return res.status(400).json({
      success: false,
      message: 'follow_up_date must be a valid date',
    });
  }

  const fields = [];
  const values = [];

  const addField = (fieldName, value) => {
    if (value !== undefined) {
      values.push(value);
      fields.push(`${fieldName} = $${values.length}`);
    }
  };

  addField('name', name);
  addField('mobile', mobile);
  addField('email', email || null);
  addField('business_name', business_name || null);
  addField('gst_number', gst_number || null);
  addField('customer_type', customer_type);
  addField('address', address || null);
  addField('status', status);
  addField('follow_up_date', follow_up_date || null);
  addField('notes', notes || null);
  fields.push(`updated_at = NOW()`);

  if (fields.length === 1) {
    return res.status(400).json({
      success: false,
      message: 'No valid fields provided for update',
    });
  }

  values.push(id);

  try {
    const result = await pool.query(
      `UPDATE customers SET ${fields.join(', ')} WHERE id = $${values.length} RETURNING id, name, mobile, email, business_name, gst_number, customer_type, address, status, follow_up_date, notes, created_by, created_at, updated_at`,
      values
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found',
      });
    }

    return res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

const deleteCustomer = async (req, res, next) => {
  const { id } = req.params;

  try {
    const challanCheck = await pool.query(
      'SELECT 1 FROM challans WHERE customer_id = $1 LIMIT 1',
      [id]
    );

    if (challanCheck.rowCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Customer cannot be deleted because historical challans exist',
      });
    }

    const followupCheck = await pool.query(
      'SELECT 1 FROM customer_followups WHERE customer_id = $1 LIMIT 1',
      [id]
    );

    if (followupCheck.rowCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Customer cannot be deleted because follow-up history exists',
      });
    }

    const result = await pool.query('DELETE FROM customers WHERE id = $1 RETURNING id', [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found',
      });
    }

    return res.json({
      success: true,
      message: 'Customer deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

const createFollowup = async (req, res, next) => {
  const { id } = req.params;
  const { note, follow_up_date } = req.body;

  if (!note) {
    return res.status(400).json({
      success: false,
      message: 'Note is required',
    });
  }

  if (follow_up_date && !isValidDate(follow_up_date)) {
    return res.status(400).json({
      success: false,
      message: 'follow_up_date must be a valid date',
    });
  }

  try {
    const customerResult = await pool.query('SELECT id FROM customers WHERE id = $1', [id]);
    if (customerResult.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found',
      });
    }

    const result = await pool.query(
      `INSERT INTO customer_followups (customer_id, note, follow_up_date, created_by)
       VALUES ($1, $2, $3, $4)
       RETURNING id, customer_id, note, follow_up_date, created_by, created_at`,
      [id, note, follow_up_date || null, req.session.user.id]
    );

    return res.status(201).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

const getFollowups = async (req, res, next) => {
  const { id } = req.params;

  try {
    const customerResult = await pool.query('SELECT id FROM customers WHERE id = $1', [id]);
    if (customerResult.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found',
      });
    }

    const result = await pool.query(
      `SELECT id, note, follow_up_date, created_by, created_at
       FROM customer_followups
       WHERE customer_id = $1
       ORDER BY created_at DESC`,
      [id]
    );

    return res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCustomers,
  createCustomer,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
  createFollowup,
  getFollowups,
};
