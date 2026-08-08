-- backend/database/schema.sql

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('Admin', 'Sales', 'Warehouse', 'Accounts')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  mobile VARCHAR(30),
  email VARCHAR(255),
  business_name VARCHAR(255),
  gst_number VARCHAR(50),
  customer_type VARCHAR(20) NOT NULL CHECK (customer_type IN ('Retail', 'Wholesale', 'Distributor')),
  address TEXT,
  status VARCHAR(20) NOT NULL CHECK (status IN ('Lead', 'Active', 'Inactive')),
  follow_up_date DATE,
  notes TEXT,
  created_by INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_customers_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT
);

-- Customer follow-ups table
CREATE TABLE IF NOT EXISTS customer_followups (
  id SERIAL PRIMARY KEY,
  customer_id INTEGER NOT NULL,
  note TEXT NOT NULL,
  follow_up_date DATE NOT NULL,
  created_by INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_followups_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
  CONSTRAINT fk_followups_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  sku VARCHAR(100) NOT NULL UNIQUE,
  category VARCHAR(100),
  unit_price NUMERIC(12, 2) NOT NULL CHECK (unit_price >= 0),
  current_stock INTEGER NOT NULL DEFAULT 0 CHECK (current_stock >= 0),
  minimum_stock INTEGER NOT NULL DEFAULT 0 CHECK (minimum_stock >= 0),
  warehouse_location VARCHAR(255),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Stock movements table
CREATE TABLE IF NOT EXISTS stock_movements (
  id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity >= 0),
  movement_type VARCHAR(10) NOT NULL CHECK (movement_type IN ('IN', 'OUT')),
  reason TEXT,
  created_by INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_stock_movements_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT,
  CONSTRAINT fk_stock_movements_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT
);

-- Challans table
CREATE TABLE IF NOT EXISTS challans (
  id SERIAL PRIMARY KEY,
  challan_number VARCHAR(100) NOT NULL UNIQUE,
  customer_id INTEGER NOT NULL,
  total_quantity INTEGER NOT NULL DEFAULT 0 CHECK (total_quantity >= 0),
  status VARCHAR(20) NOT NULL CHECK (status IN ('Draft', 'Confirmed', 'Cancelled')),
  created_by INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_challans_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE RESTRICT,
  CONSTRAINT fk_challans_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT
);

-- Challan items table
CREATE TABLE IF NOT EXISTS challan_items (
  id SERIAL PRIMARY KEY,
  challan_id INTEGER NOT NULL,
  product_id INTEGER NOT NULL,
  product_name_snapshot VARCHAR(255) NOT NULL,
  sku_snapshot VARCHAR(100) NOT NULL,
  unit_price_snapshot NUMERIC(12, 2) NOT NULL CHECK (unit_price_snapshot >= 0),
  quantity INTEGER NOT NULL CHECK (quantity >= 0),
  CONSTRAINT fk_challan_items_challan FOREIGN KEY (challan_id) REFERENCES challans(id) ON DELETE CASCADE,
  CONSTRAINT fk_challan_items_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
);
