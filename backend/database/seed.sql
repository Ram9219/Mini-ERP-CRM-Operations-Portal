-- -- backend/database/seed.sql

-- -- Development-only users (plain passwords for phase 2 seed data)
-- INSERT INTO users (name, email, password, role)
-- VALUES
--   ('Admin User', 'admin@example.com', 'Admin123!', 'Admin'),
--   ('Sales User', 'sales@example.com', 'Sales123!', 'Sales'),
--   ('Warehouse User', 'warehouse@example.com', 'Warehouse123!', 'Warehouse'),
--   ('Accounts User', 'accounts@example.com', 'Accounts123!', 'Accounts')
-- ON CONFLICT (email) DO NOTHING;

-- -- Customers
-- INSERT INTO customers (name, mobile, email, business_name, gst_number, customer_type, address, status, follow_up_date, notes, created_by)
-- VALUES
--   ('Riya Sharma', '9876543210', 'riya.sharma@example.com', 'Riya Retail', 'GSTIN1234A1Z5', 'Retail', '123 Main Street, Mumbai', 'Lead', CURRENT_DATE + INTERVAL '5 day', 'Initial enquiry for POS devices', 1),
--   ('Naveen Kumar', '9123456780', 'naveen.kumar@example.com', 'Naveen Enterprises', 'GSTIN1234B2Y6', 'Wholesale', '45 Industrial Area, Pune', 'Active', NULL, 'Regular monthly orders', 2),
--   ('Sonal Patel', '9988776655', 'sonal.patel@example.com', 'Sonal Supermart', 'GSTIN1234C3X7', 'Distributor', '78 Market Road, Surat', 'Active', NULL, 'Distributor for western region', 2),
--   ('Amit Joshi', '9012345678', 'amit.joshi@example.com', 'Amit Electronics', 'GSTIN1234D4W8', 'Retail', '22 Tech Park, Bangalore', 'Inactive', CURRENT_DATE + INTERVAL '14 day', 'Follow up after product demo', 1),
--   ('Neha Singh', '9098765432', 'neha.singh@example.com', 'Neha Stores', 'GSTIN1234E5V9', 'Wholesale', '12 Shopping Lane, Delhi', 'Lead', CURRENT_DATE + INTERVAL '2 day', 'Interested in bulk ordering', 3)
-- ON CONFLICT (mobile) DO NOTHING;

-- -- Products
-- INSERT INTO products (name, sku, category, unit_price, current_stock, minimum_stock, warehouse_location)
-- VALUES
--   ('A4 Paper Pack', 'SKU-A4PAPER-01', 'Stationery', 250.00, 120, 20, 'WH-01'),
--   ('Ink Cartridge Black', 'SKU-INKBLK-02', 'Electronics', 850.00, 75, 10, 'WH-02'),
--   ('LED Monitor 24 inch', 'SKU-MON24-03', 'Electronics', 8900.00, 18, 5, 'WH-03'),
--   ('Office Chair Basic', 'SKU-CHRBSC-04', 'Furniture', 3200.00, 50, 10, 'WH-04'),
--   ('Keyboard Wired', 'SKU-KYBDWD-05', 'Electronics', 450.00, 200, 25, 'WH-02'),
--   ('Mouse Optical', 'SKU-MOUSE-06', 'Electronics', 260.00, 180, 25, 'WH-02'),
--   ('Stapler Heavy Duty', 'SKU-STRHDY-07', 'Stationery', 320.00, 80, 15, 'WH-01'),
--   ('USB Cable 1m', 'SKU-USBCAB-08', 'Accessories', 150.00, 260, 40, 'WH-02'),
--   ('Notebook A5', 'SKU-NBKA5-09', 'Stationery', 120.00, 140, 30, 'WH-01'),
--   ('Packing Tape', 'SKU-TAPE-10', 'Logistics', 95.00, 500, 100, 'WH-05')
-- ON CONFLICT (sku) DO NOTHING;

-- -- Stock movements
-- INSERT INTO stock_movements (product_id, quantity, movement_type, reason, created_by)
-- VALUES
--   (1, 100, 'IN', 'Initial stock arrival', 3),
--   (2, 50, 'IN', 'Initial stock arrival', 3),
--   (3, 20, 'IN', 'Initial stock arrival', 3),
--   (4, 50, 'IN', 'Initial stock arrival', 3),
--   (5, 200, 'IN', 'Initial stock arrival', 3),
--   (6, 180, 'IN', 'Initial stock arrival', 3),
--   (7, 80, 'IN', 'Initial stock arrival', 3),
--   (8, 260, 'IN', 'Initial stock arrival', 3),
--   (9, 140, 'IN', 'Initial stock arrival', 3),
--   (10, 500, 'IN', 'Initial stock arrival', 3),
--   (1, 20, 'OUT', 'Retail order shipped', 4),
--   (5, 40, 'OUT', 'Office supply dispatch', 4),
--   (8, 30, 'OUT', 'Online order shipped', 4);

-- -- Challans and challan items
-- INSERT INTO challans (challan_number, customer_id, total_quantity, status, created_by)
-- VALUES
--   ('CH-2026-001', 2, 8, 'Confirmed', 2),
--   ('CH-2026-002', 3, 5, 'Draft', 2),
--   ('CH-2026-003', 5, 12, 'Confirmed', 2)
-- ON CONFLICT (challan_number) DO NOTHING;

-- INSERT INTO challan_items (challan_id, product_id, product_name_snapshot, sku_snapshot, unit_price_snapshot, quantity)
-- VALUES
--   ((SELECT id FROM challans WHERE challan_number = 'CH-2026-001'), 3, 'LED Monitor 24 inch', 'SKU-MON24-03', 8900.00, 2),
--   ((SELECT id FROM challans WHERE challan_number = 'CH-2026-001'), 5, 'Keyboard Wired', 'SKU-KYBDWD-05', 450.00, 6),
--   ((SELECT id FROM challans WHERE challan_number = 'CH-2026-002'), 7, 'Stapler Heavy Duty', 'SKU-STRHDY-07', 320.00, 3),
--   ((SELECT id FROM challans WHERE challan_number = 'CH-2026-002'), 9, 'Notebook A5', 'SKU-NBKA5-09', 120.00, 2),
--   ((SELECT id FROM challans WHERE challan_number = 'CH-2026-003'), 1, 'A4 Paper Pack', 'SKU-A4PAPER-01', 250.00, 10),
--   ((SELECT id FROM challans WHERE challan_number = 'CH-2026-003'), 8, 'USB Cable 1m', 'SKU-USBCAB-08', 150.00, 2)
-- ON CONFLICT DO NOTHING;








-- backend/database/seed.sql
-- Development-only seed data

-- =========================================
-- USERS
-- =========================================
-- Development login credentials (do not use in production):
-- admin@example.com / Admin123!
-- sales@example.com / Sales123!
-- warehouse@example.com / Warehouse123!
-- accounts@example.com / Accounts123!

INSERT INTO users (name, email, password, role)
VALUES
('Admin User', 'admin@example.com', '$2b$10$wQLTs1uBKB/jDhYCJTzWKe60t4bM1a0TJSfcjI/rSLRcPfTO9FrgS', 'Admin'),
('Sales User', 'sales@example.com', '$2b$10$5ep3n./9DHcJlHshZ8zL.eHPTOFR7MLNSKuqhi.dxbJ7AcFjzaiKC', 'Sales'),
('Warehouse User', 'warehouse@example.com', '$2b$10$FuuLDMC7EndhjwU86QdzQuq4W0WZ974VGnUHLA4HMVDRvjGrFpuR.', 'Warehouse'),
('Accounts User', 'accounts@example.com', '$2b$10$5ZrxyS2r89C78YKZjJ6BY.blA83L9vkYwi3NPAjhUqA7kNoJF9hOK', 'Accounts')
ON CONFLICT (email) DO NOTHING;


-- =========================================
-- CUSTOMERS
-- =========================================

INSERT INTO customers
(name, mobile, email, business_name, gst_number, customer_type,
 address, status, follow_up_date, notes, created_by)
VALUES
(
    'Riya Sharma',
    '9876543210',
    'riya.sharma@example.com',
    'Riya Retail',
    'GSTIN1234A1Z5',
    'Retail',
    '123 Main Street, Mumbai',
    'Lead',
    CURRENT_DATE + INTERVAL '5 day',
    'Initial enquiry for POS devices',
    (SELECT id FROM users WHERE email = 'admin@example.com')
),
(
    'Naveen Kumar',
    '9123456780',
    'naveen.kumar@example.com',
    'Naveen Enterprises',
    'GSTIN1234B2Y6',
    'Wholesale',
    '45 Industrial Area, Pune',
    'Active',
    NULL,
    'Regular monthly orders',
    (SELECT id FROM users WHERE email = 'sales@example.com')
),
(
    'Sonal Patel',
    '9988776655',
    'sonal.patel@example.com',
    'Sonal Supermart',
    'GSTIN1234C3X7',
    'Distributor',
    '78 Market Road, Surat',
    'Active',
    NULL,
    'Distributor for western region',
    (SELECT id FROM users WHERE email = 'sales@example.com')
),
(
    'Amit Joshi',
    '9012345678',
    'amit.joshi@example.com',
    'Amit Electronics',
    'GSTIN1234D4W8',
    'Retail',
    '22 Tech Park, Bangalore',
    'Inactive',
    CURRENT_DATE + INTERVAL '14 day',
    'Follow up after product demo',
    (SELECT id FROM users WHERE email = 'admin@example.com')
),
(
    'Neha Singh',
    '9098765432',
    'neha.singh@example.com',
    'Neha Stores',
    'GSTIN1234E5V9',
    'Wholesale',
    '12 Shopping Lane, Delhi',
    'Lead',
    CURRENT_DATE + INTERVAL '2 day',
    'Interested in bulk ordering',
    (SELECT id FROM users WHERE email = 'warehouse@example.com')
)
ON CONFLICT (mobile) DO NOTHING;


-- =========================================
-- PRODUCTS
-- =========================================

INSERT INTO products
(name, sku, category, unit_price, current_stock, minimum_stock, warehouse_location)
VALUES
('A4 Paper Pack', 'SKU-A4PAPER-01', 'Stationery', 250.00, 120, 20, 'WH-01'),
('Ink Cartridge Black', 'SKU-INKBLK-02', 'Electronics', 850.00, 75, 10, 'WH-02'),
('LED Monitor 24 inch', 'SKU-MON24-03', 'Electronics', 8900.00, 18, 5, 'WH-03'),
('Office Chair Basic', 'SKU-CHRBSC-04', 'Furniture', 3200.00, 50, 10, 'WH-04'),
('Keyboard Wired', 'SKU-KYBDWD-05', 'Electronics', 450.00, 200, 25, 'WH-02'),
('Mouse Optical', 'SKU-MOUSE-06', 'Electronics', 260.00, 180, 25, 'WH-02'),
('Stapler Heavy Duty', 'SKU-STRHDY-07', 'Stationery', 320.00, 80, 15, 'WH-01'),
('USB Cable 1m', 'SKU-USBCAB-08', 'Accessories', 150.00, 260, 40, 'WH-02'),
('Notebook A5', 'SKU-NBKA5-09', 'Stationery', 120.00, 140, 30, 'WH-01'),
('Packing Tape', 'SKU-TAPE-10', 'Logistics', 95.00, 500, 100, 'WH-05')
ON CONFLICT (sku) DO NOTHING;


-- =========================================
-- STOCK MOVEMENTS
-- =========================================

INSERT INTO stock_movements
(product_id, quantity, movement_type, reason, created_by)
VALUES
(
    (SELECT id FROM products WHERE sku = 'SKU-A4PAPER-01'),
    100,
    'IN',
    'Initial stock arrival',
    (SELECT id FROM users WHERE email = 'warehouse@example.com')
),
(
    (SELECT id FROM products WHERE sku = 'SKU-INKBLK-02'),
    50,
    'IN',
    'Initial stock arrival',
    (SELECT id FROM users WHERE email = 'warehouse@example.com')
),
(
    (SELECT id FROM products WHERE sku = 'SKU-MON24-03'),
    20,
    'IN',
    'Initial stock arrival',
    (SELECT id FROM users WHERE email = 'warehouse@example.com')
),
(
    (SELECT id FROM products WHERE sku = 'SKU-CHRBSC-04'),
    50,
    'IN',
    'Initial stock arrival',
    (SELECT id FROM users WHERE email = 'warehouse@example.com')
),
(
    (SELECT id FROM products WHERE sku = 'SKU-KYBDWD-05'),
    200,
    'IN',
    'Initial stock arrival',
    (SELECT id FROM users WHERE email = 'warehouse@example.com')
),
(
    (SELECT id FROM products WHERE sku = 'SKU-MOUSE-06'),
    180,
    'IN',
    'Initial stock arrival',
    (SELECT id FROM users WHERE email = 'warehouse@example.com')
),
(
    (SELECT id FROM products WHERE sku = 'SKU-STRHDY-07'),
    80,
    'IN',
    'Initial stock arrival',
    (SELECT id FROM users WHERE email = 'warehouse@example.com')
),
(
    (SELECT id FROM products WHERE sku = 'SKU-USBCAB-08'),
    260,
    'IN',
    'Initial stock arrival',
    (SELECT id FROM users WHERE email = 'warehouse@example.com')
),
(
    (SELECT id FROM products WHERE sku = 'SKU-NBKA5-09'),
    140,
    'IN',
    'Initial stock arrival',
    (SELECT id FROM users WHERE email = 'warehouse@example.com')
),
(
    (SELECT id FROM products WHERE sku = 'SKU-TAPE-10'),
    500,
    'IN',
    'Initial stock arrival',
    (SELECT id FROM users WHERE email = 'warehouse@example.com')
),
(
    (SELECT id FROM products WHERE sku = 'SKU-A4PAPER-01'),
    20,
    'OUT',
    'Retail order shipped',
    (SELECT id FROM users WHERE email = 'accounts@example.com')
),
(
    (SELECT id FROM products WHERE sku = 'SKU-KYBDWD-05'),
    40,
    'OUT',
    'Office supply dispatch',
    (SELECT id FROM users WHERE email = 'accounts@example.com')
),
(
    (SELECT id FROM products WHERE sku = 'SKU-USBCAB-08'),
    30,
    'OUT',
    'Online order shipped',
    (SELECT id FROM users WHERE email = 'accounts@example.com')
);


-- =========================================
-- CHALLANS
-- =========================================

INSERT INTO challans
(challan_number, customer_id, total_quantity, status, created_by)
VALUES
(
    'CH-2026-001',
    (SELECT id FROM customers WHERE mobile = '9123456780'),
    8,
    'Confirmed',
    (SELECT id FROM users WHERE email = 'sales@example.com')
),
(
    'CH-2026-002',
    (SELECT id FROM customers WHERE mobile = '9988776655'),
    5,
    'Draft',
    (SELECT id FROM users WHERE email = 'sales@example.com')
),
(
    'CH-2026-003',
    (SELECT id FROM customers WHERE mobile = '9098765432'),
    12,
    'Confirmed',
    (SELECT id FROM users WHERE email = 'sales@example.com')
)
ON CONFLICT (challan_number) DO NOTHING;


-- =========================================
-- CHALLAN ITEMS
-- =========================================

INSERT INTO challan_items
(
    challan_id,
    product_id,
    product_name_snapshot,
    sku_snapshot,
    unit_price_snapshot,
    quantity
)
VALUES
(
    (SELECT id FROM challans WHERE challan_number = 'CH-2026-001'),
    (SELECT id FROM products WHERE sku = 'SKU-MON24-03'),
    'LED Monitor 24 inch',
    'SKU-MON24-03',
    8900.00,
    2
),
(
    (SELECT id FROM challans WHERE challan_number = 'CH-2026-001'),
    (SELECT id FROM products WHERE sku = 'SKU-KYBDWD-05'),
    'Keyboard Wired',
    'SKU-KYBDWD-05',
    450.00,
    6
),
(
    (SELECT id FROM challans WHERE challan_number = 'CH-2026-002'),
    (SELECT id FROM products WHERE sku = 'SKU-STRHDY-07'),
    'Stapler Heavy Duty',
    'SKU-STRHDY-07',
    320.00,
    3
),
(
    (SELECT id FROM challans WHERE challan_number = 'CH-2026-002'),
    (SELECT id FROM products WHERE sku = 'SKU-NBKA5-09'),
    'Notebook A5',
    'SKU-NBKA5-09',
    120.00,
    2
),
(
    (SELECT id FROM challans WHERE challan_number = 'CH-2026-003'),
    (SELECT id FROM products WHERE sku = 'SKU-A4PAPER-01'),
    'A4 Paper Pack',
    'SKU-A4PAPER-01',
    250.00,
    10
),
(
    (SELECT id FROM challans WHERE challan_number = 'CH-2026-003'),
    (SELECT id FROM products WHERE sku = 'SKU-USBCAB-08'),
    'USB Cable 1m',
    'SKU-USBCAB-08',
    150.00,
    2
)
ON CONFLICT DO NOTHING;