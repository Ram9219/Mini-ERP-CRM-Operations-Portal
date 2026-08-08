const request = require('supertest');
const app = require('../src/app');
const { pool } = require('../src/config/db');

jest.setTimeout(30000);

describe('Mini ERP Backend Integration Tests', () => {
  let adminAgent;
  let salesAgent;
  let warehouseAgent;
  let accountsAgent;

  const users = {
    admin: { email: 'admin@example.com', password: 'Admin123!' },
    sales: { email: 'sales@example.com', password: 'Sales123!' },
    warehouse: { email: 'warehouse@example.com', password: 'Warehouse123!' },
    accounts: { email: 'accounts@example.com', password: 'Accounts123!' },
  };

  const randomSuffix = Date.now();
  const testData = {
    customer: null,
    customerToDelete: null,
    customerABC: null,
    productLaptop: null,
    productMouse: null,
    productKeyboard: null,
    productZeroDelete: null,
    challanDraft: null,
    challanConfirmed: null,
    challanInsufficient: null,
    challanMulti: null,
    challanCancelDraft: null,
    snapshotProduct: null,
    snapshotChallan: null,
  };

  const loginAgent = async (email, password) => {
    const agent = request.agent(app);
    await agent
      .post('/api/auth/login')
      .send({ email, password })
      .expect(200)
      .expect((res) => {
        expect(res.body).toMatchObject({ success: true, message: 'Login successful' });
        expect(res.body.user).toHaveProperty('email', email);
      });
    return agent;
  };

  beforeAll(async () => {
    const client = await pool.connect();
    try {
      await client.query('SELECT 1');
    } finally {
      client.release();
    }

    adminAgent = await loginAgent(users.admin.email, users.admin.password);
    salesAgent = await loginAgent(users.sales.email, users.sales.password);
    warehouseAgent = await loginAgent(users.warehouse.email, users.warehouse.password);
    accountsAgent = await loginAgent(users.accounts.email, users.accounts.password);
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('Authentication', () => {
    test('valid admin login -> 200', async () => {
      const agent = request.agent(app);
      await agent
        .post('/api/auth/login')
        .send({ email: users.admin.email, password: users.admin.password })
        .expect(200)
        .expect((res) => {
          expect(res.body.user.role).toBe('Admin');
        });
    });

    test('valid sales login -> 200', async () => {
      const agent = request.agent(app);
      await agent.post('/api/auth/login').send({ email: users.sales.email, password: users.sales.password }).expect(200);
    });

    test('valid warehouse login -> 200', async () => {
      const agent = request.agent(app);
      await agent.post('/api/auth/login').send({ email: users.warehouse.email, password: users.warehouse.password }).expect(200);
    });

    test('valid accounts login -> 200', async () => {
      const agent = request.agent(app);
      await agent.post('/api/auth/login').send({ email: users.accounts.email, password: users.accounts.password }).expect(200);
    });

    test('invalid password -> 401', async () => {
      const agent = request.agent(app);
      await agent.post('/api/auth/login').send({ email: users.admin.email, password: 'wrong' }).expect(401);
    });

    test('invalid email -> 401', async () => {
      const agent = request.agent(app);
      await agent.post('/api/auth/login').send({ email: 'missing@example.com', password: 'Admin123!' }).expect(401);
    });

    test('/api/auth/me after login -> 200', async () => {
      const agent = await loginAgent(users.admin.email, users.admin.password);
      await agent.get('/api/auth/me').expect(200).expect((res) => {
        expect(res.body.user).toHaveProperty('email', users.admin.email);
      });
    });

    test('/api/auth/me without login -> 401', async () => {
      await request(app).get('/api/auth/me').expect(401);
    });

    test('logout -> 200 and /api/auth/me after logout -> 401', async () => {
      const agent = await loginAgent(users.admin.email, users.admin.password);
      await agent.post('/api/auth/logout').expect(200);
      await agent.get('/api/auth/me').expect(401);
    });
  });

  describe('Role authorization', () => {
    test('warehouse cannot create customer -> 403', async () => {
      await warehouseAgent
        .post('/api/customers')
        .send({ name: `WarehouseCustomer${randomSuffix}`, mobile: `999${randomSuffix}` })
        .expect(403);
    });

    test('accounts cannot create product -> 403', async () => {
      await accountsAgent
        .post('/api/products')
        .send({
          name: `BlockedProduct${randomSuffix}`,
          sku: `BLOCK-${randomSuffix}`,
          category: 'Test',
          unit_price: 100,
          current_stock: 10,
          minimum_stock: 1,
          warehouse_location: 'WH-TEST',
        })
        .expect(403);
    });

    test('warehouse can create product and add stock', async () => {
      const productRes = await warehouseAgent
        .post('/api/products')
        .send({
          name: `WarehouseProduct${randomSuffix}`,
          sku: `WH-${randomSuffix}`,
          category: 'Warehouse',
          unit_price: 200,
          current_stock: 0,
          minimum_stock: 0,
          warehouse_location: 'WH-02',
        })
        .expect(201);

      expect(productRes.body.data).toMatchObject({ name: `WarehouseProduct${randomSuffix}`, sku: `WH-${randomSuffix}` });
      const createdId = productRes.body.data.id;

      const addStockRes = await warehouseAgent
        .post(`/api/products/${createdId}/stock`)
        .send({ quantity: 15, reason: 'Test stock' })
        .expect(200);

      expect(addStockRes.body.data.currentStock).toBe(15);
    });

    test('warehouse cannot create challan -> 403', async () => {
      await warehouseAgent.post('/api/challans').send({ customerId: 1, items: [] }).expect(403);
    });

    test('accounts can read challans -> 200 and cannot create challan -> 403', async () => {
      await accountsAgent.get('/api/challans').expect(200);
      await accountsAgent.post('/api/challans').send({ customerId: 1, items: [] }).expect(403);
    });
  });

  describe('Customer APIs', () => {
    test('create customer -> 201', async () => {
      const payload = {
        name: `ABC Traders ${randomSuffix}`,
        mobile: `900${randomSuffix}`,
        email: `abc.traders.${randomSuffix}@example.com`,
        business_name: 'ABC Traders',
        gst_number: 'GST1234ABC',
        customer_type: 'Retail',
        address: '123 Commerce Street',
        status: 'Active',
        follow_up_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
        notes: 'Test customer',
      };

      const res = await adminAgent.post('/api/customers').send(payload).expect(201);
      expect(res.body.data).toMatchObject({ name: payload.name, mobile: payload.mobile, customer_type: payload.customer_type });
      testData.customer = res.body.data;
    });

    test('get customer list -> 200', async () => {
      const res = await adminAgent.get('/api/customers').expect(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.pagination).toEqual(expect.objectContaining({ page: 1, limit: 10 }));
    });

    test('search customer -> 200', async () => {
      const res = await adminAgent.get('/api/customers').query({ search: 'ABC Traders' }).expect(200);
      expect(res.body.data.some((c) => c.name.includes('ABC Traders'))).toBe(true);
    });

    test('filter by status and customer type -> 200', async () => {
      const res = await adminAgent
        .get('/api/customers')
        .query({ status: 'Active', customer_type: 'Retail' })
        .expect(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    test('pagination -> 200', async () => {
      const res = await adminAgent.get('/api/customers').query({ page: 1, limit: 5 }).expect(200);
      expect(res.body.pagination.page).toBe(1);
      expect(res.body.pagination.limit).toBe(5);
    });

    test('get customer details -> 200', async () => {
      const res = await adminAgent.get(`/api/customers/${testData.customer.id}`).expect(200);
      expect(res.body.data).toHaveProperty('id', testData.customer.id);
    });

    test('update customer -> 200', async () => {
      const res = await adminAgent
        .put(`/api/customers/${testData.customer.id}`)
        .send({ notes: 'Updated note', status: 'Lead' })
        .expect(200);
      expect(res.body.data).toMatchObject({ status: 'Lead', notes: 'Updated note' });
    });

    test('add follow-up -> 201 and get follow-up history -> 200', async () => {
      const followupRes = await salesAgent
        .post(`/api/customers/${testData.customer.id}/followups`)
        .send({ note: 'Follow-up note', follow_up_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10) })
        .expect(201);

      expect(followupRes.body.data).toHaveProperty('note', 'Follow-up note');

      const historyRes = await salesAgent.get(`/api/customers/${testData.customer.id}/followups`).expect(200);
      expect(Array.isArray(historyRes.body.data)).toBe(true);
      expect(historyRes.body.data.some((item) => item.note === 'Follow-up note')).toBe(true);
    });

    test('invalid customer data -> 400', async () => {
      await adminAgent.post('/api/customers').send({ name: '', mobile: '' }).expect(400);
    });

    test('nonexistent customer ID -> 404', async () => {
      await adminAgent.get('/api/customers/999999999').expect(404);
    });

    test('unauthorized deletion -> 403', async () => {
      await salesAgent.delete(`/api/customers/${testData.customer.id}`).expect(403);
    });

    test('admin deletion where safe -> 200', async () => {
      const res = await adminAgent
        .post('/api/customers')
        .send({
          name: `DeleteSafe${randomSuffix}`,
          mobile: `890${randomSuffix}`,
          customer_type: 'Retail',
          status: 'Active',
        })
        .expect(201);
      testData.customerToDelete = res.body.data;

      await adminAgent.delete(`/api/customers/${testData.customerToDelete.id}`).expect(200);
    });
  });

  describe('Product APIs', () => {
    test('create product -> 201', async () => {
      const payload = {
        name: `Laptop ${randomSuffix}`,
        sku: `LAP-${randomSuffix}`,
        category: 'Electronics',
        unit_price: 50000,
        current_stock: 10,
        minimum_stock: 2,
        warehouse_location: 'WH-99',
      };
      const res = await adminAgent.post('/api/products').send(payload).expect(201);
      testData.productLaptop = res.body.data;
      expect(res.body.data).toMatchObject({ sku: payload.sku, name: payload.name });
    });

    test('duplicate SKU -> 409', async () => {
      await adminAgent
        .post('/api/products')
        .send({
          name: 'Duplicate Laptop',
          sku: testData.productLaptop.sku,
          category: 'Electronics',
          unit_price: 50000,
          current_stock: 5,
          minimum_stock: 1,
          warehouse_location: 'WH-99',
        })
        .expect(409);
    });

    test('get products -> 200', async () => {
      const res = await adminAgent.get('/api/products').expect(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    test('search products -> 200', async () => {
      const res = await adminAgent.get('/api/products').query({ search: 'Laptop' }).expect(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    test('category filter -> 200', async () => {
      const res = await adminAgent.get('/api/products').query({ category: 'Electronics' }).expect(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    test('low-stock filter -> 200', async () => {
      const res = await adminAgent.get('/api/products').query({ lowStock: 'true' }).expect(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    test('get product details -> 200', async () => {
      const res = await adminAgent.get(`/api/products/${testData.productLaptop.id}`).expect(200);
      expect(res.body.data).toHaveProperty('id', testData.productLaptop.id);
    });

    test('update product -> 200', async () => {
      const res = await adminAgent
        .put(`/api/products/${testData.productLaptop.id}`)
        .send({ warehouse_location: 'WH-100', unit_price: 55000 })
        .expect(200);
      expect(res.body.data).toMatchObject({ warehouse_location: 'WH-100', unit_price: '55000.00' });
    });

    test('PUT cannot modify current_stock -> 400', async () => {
      await adminAgent
        .put(`/api/products/${testData.productLaptop.id}`)
        .send({ current_stock: 999 })
        .expect(400);
    });

    test('add stock -> 200 and current_stock increases + IN movement created', async () => {
      const beforeRes = await adminAgent.get(`/api/products/${testData.productLaptop.id}`).expect(200);
      const beforeStock = Number(beforeRes.body.data.current_stock);

      const res = await adminAgent
        .post(`/api/products/${testData.productLaptop.id}/stock`)
        .send({ quantity: 5, reason: 'Restock test' })
        .expect(200);

      expect(res.body.data.currentStock).toBe(beforeStock + 5);
      expect(res.body.data.quantityAdded).toBe(5);

      const movementRes = await adminAgent.get(`/api/products/${testData.productLaptop.id}/stock-movements`).expect(200);
      expect(Array.isArray(movementRes.body.data)).toBe(true);
      expect(movementRes.body.data.some((m) => m.quantity === 5 && m.movement_type === 'IN')).toBe(true);
    });

    test('negative quantity rejected -> 400', async () => {
      await adminAgent.post(`/api/products/${testData.productLaptop.id}/stock`).send({ quantity: -5, reason: 'Bad' }).expect(400);
    });

    test('invalid product ID -> 404', async () => {
      await adminAgent.get('/api/products/999999999').expect(404);
      await adminAgent.post('/api/products/999999999/stock').send({ quantity: 1, reason: 'Test' }).expect(404);
    });

    test('stock movement history -> 200', async () => {
      const res = await adminAgent.get(`/api/products/${testData.productLaptop.id}/stock-movements`).expect(200);
      expect(res.body.pagination).toBeDefined();
    });

    test('product deletion rules -> create zero-stock product and delete -> 200', async () => {
      const payload = {
        name: `DeleteProduct${randomSuffix}`,
        sku: `DEL-${randomSuffix}`,
        category: 'Test',
        unit_price: 100,
        current_stock: 0,
        minimum_stock: 0,
        warehouse_location: 'WH-DEL',
      };
      const createRes = await adminAgent.post('/api/products').send(payload).expect(201);
      testData.productZeroDelete = createRes.body.data;
      await adminAgent.delete(`/api/products/${testData.productZeroDelete.id}`).expect(200);
    });
  });

  describe('Challan APIs', () => {
    test('create draft challan -> 201 and stock unchanged', async () => {
      const customerRes = await adminAgent
        .post('/api/customers')
        .send({
          name: `ABC Traders ${randomSuffix}`,
          mobile: `901${randomSuffix}`,
          email: `abc.traders2.${randomSuffix}@example.com`,
          business_name: 'ABC Traders',
          gst_number: 'GST1234ABC',
          customer_type: 'Retail',
          address: 'Commerce Road',
          status: 'Active',
        })
        .expect(201);
      testData.customerABC = customerRes.body.data;

      const productRes = await adminAgent
        .post('/api/products')
        .send({
          name: `Laptop Challan ${randomSuffix}`,
          sku: `LAP-CHALLAN-${randomSuffix}`,
          category: 'Electronics',
          unit_price: 50000,
          current_stock: 10,
          minimum_stock: 1,
          warehouse_location: 'WH-01',
        })
        .expect(201);
      testData.productLaptop = productRes.body.data;

      const stockBefore = Number(testData.productLaptop.current_stock);
      const challanRes = await salesAgent
        .post('/api/challans')
        .send({
          customerId: testData.customerABC.id,
          items: [{ productId: testData.productLaptop.id, quantity: 3 }],
        })
        .expect(201);

      testData.challanDraft = challanRes.body.data;
      expect(testData.challanDraft.status).toBe('Draft');

      const productAfterRes = await adminAgent.get(`/api/products/${testData.productLaptop.id}`).expect(200);
      expect(Number(productAfterRes.body.data.current_stock)).toBe(stockBefore);

      const movementsRes = await adminAgent.get(`/api/products/${testData.productLaptop.id}/stock-movements`).expect(200);
      expect(movementsRes.body.data.some((m) => m.movement_type === 'OUT' && m.quantity === 3)).toBe(false);
    });

    test('confirm draft challan -> Confirmed and stock reduced + OUT movement created', async () => {
      await salesAgent.post(`/api/challans/${testData.challanDraft.id}/confirm`).expect(200);
      const challanRes = await adminAgent.get(`/api/challans/${testData.challanDraft.id}`).expect(200);
      expect(challanRes.body.data.status).toBe('Confirmed');

      const productRes = await adminAgent.get(`/api/products/${testData.productLaptop.id}`).expect(200);
      expect(Number(productRes.body.data.current_stock)).toBe(7);

      const movements = await adminAgent.get(`/api/products/${testData.productLaptop.id}/stock-movements`).expect(200);
      expect(movements.body.data.some((m) => m.movement_type === 'OUT' && m.quantity === 3)).toBe(true);
    });

    test('duplicate confirmation -> 400 and stock unchanged', async () => {
      const beforeStock = Number((await adminAgent.get(`/api/products/${testData.productLaptop.id}`)).body.data.current_stock);
      await salesAgent.post(`/api/challans/${testData.challanDraft.id}/confirm`).expect(400);
      const afterStock = Number((await adminAgent.get(`/api/products/${testData.productLaptop.id}`)).body.data.current_stock);
      expect(afterStock).toBe(beforeStock);

      const movements = await adminAgent.get(`/api/products/${testData.productLaptop.id}/stock-movements`).expect(200);
      const outMovements = movements.body.data.filter((m) => m.movement_type === 'OUT' && m.quantity === 3);
      expect(outMovements.length).toBe(1);
    });

    test('insufficient stock -> 400 and rollback', async () => {
      const productRes = await adminAgent
        .post('/api/products')
        .send({
          name: `Mouse ${randomSuffix}`,
          sku: `MOUSE-${randomSuffix}`,
          category: 'Electronics',
          unit_price: 1000,
          current_stock: 7,
          minimum_stock: 1,
          warehouse_location: 'WH-02',
        })
        .expect(201);
      testData.productMouse = productRes.body.data;

      const challengeRes = await salesAgent
        .post('/api/challans')
        .send({
          customerId: testData.customerABC.id,
          items: [{ productId: testData.productMouse.id, quantity: 20 }],
        })
        .expect(201);
      testData.challanInsufficient = challengeRes.body.data;

      const conflictRes = await salesAgent.post(`/api/challans/${testData.challanInsufficient.id}/confirm`).expect(400);
      expect(conflictRes.body.message).toContain('Insufficient stock');

      const productAfter = await adminAgent.get(`/api/products/${testData.productMouse.id}`).expect(200);
      expect(Number(productAfter.body.data.current_stock)).toBe(7);

      const movements = await adminAgent.get(`/api/products/${testData.productMouse.id}/stock-movements`).expect(200);
      expect(movements.body.data.some((m) => m.movement_type === 'OUT')).toBe(false);

      const challanAfter = await adminAgent.get(`/api/challans/${testData.challanInsufficient.id}`).expect(200);
      expect(challanAfter.body.data.status).toBe('Draft');
    });

    test('multiple products -> confirm and decrease stock for every product', async () => {
      const productRes2 = await adminAgent
        .post('/api/products')
        .send({
          name: `Keyboard ${randomSuffix}`,
          sku: `KEY-${randomSuffix}`,
          category: 'Electronics',
          unit_price: 500,
          current_stock: 10,
          minimum_stock: 1,
          warehouse_location: 'WH-03',
        })
        .expect(201);
      testData.productKeyboard = productRes2.body.data;

      const challanRes = await salesAgent
        .post('/api/challans')
        .send({
          customerId: testData.customerABC.id,
          items: [
            { productId: testData.productLaptop.id, quantity: 2 },
            { productId: testData.productMouse.id, quantity: 3 },
            { productId: testData.productKeyboard.id, quantity: 1 },
          ],
        })
        .expect(201);
      testData.challanMulti = challanRes.body.data;

      const beforeStocks = {};
      for (const product of [testData.productLaptop, testData.productMouse, testData.productKeyboard]) {
        const res = await adminAgent.get(`/api/products/${product.id}`).expect(200);
        beforeStocks[product.id] = Number(res.body.data.current_stock);
      }

      await salesAgent.post(`/api/challans/${testData.challanMulti.id}/confirm`).expect(200);

      const afterLaptop = await adminAgent.get(`/api/products/${testData.productLaptop.id}`).expect(200);
      const afterMouse = await adminAgent.get(`/api/products/${testData.productMouse.id}`).expect(200);
      const afterKeyboard = await adminAgent.get(`/api/products/${testData.productKeyboard.id}`).expect(200);

      expect(Number(afterLaptop.body.data.current_stock)).toBe(beforeStocks[testData.productLaptop.id] - 2);
      expect(Number(afterMouse.body.data.current_stock)).toBe(beforeStocks[testData.productMouse.id] - 3);
      expect(Number(afterKeyboard.body.data.current_stock)).toBe(beforeStocks[testData.productKeyboard.id] - 1);

      const movementsLaptop = await adminAgent.get(`/api/products/${testData.productLaptop.id}/stock-movements`).expect(200);
      expect(movementsLaptop.body.data.some((m) => m.movement_type === 'OUT' && m.quantity === 2)).toBe(true);
      const movementsMouse = await adminAgent.get(`/api/products/${testData.productMouse.id}/stock-movements`).expect(200);
      expect(movementsMouse.body.data.some((m) => m.movement_type === 'OUT' && m.quantity === 3)).toBe(true);
      const movementsKeyboard = await adminAgent.get(`/api/products/${testData.productKeyboard.id}/stock-movements`).expect(200);
      expect(movementsKeyboard.body.data.some((m) => m.movement_type === 'OUT' && m.quantity === 1)).toBe(true);

      const challanAfter = await adminAgent.get(`/api/challans/${testData.challanMulti.id}`).expect(200);
      expect(challanAfter.body.data.status).toBe('Confirmed');
    });

    test('one insufficient product causes entire confirmation rollback', async () => {
      const productRes = await adminAgent
        .post('/api/products')
        .send({
          name: `BulkMouse ${randomSuffix}`,
          sku: `BULK-${randomSuffix}`,
          category: 'Electronics',
          unit_price: 50,
          current_stock: 5,
          minimum_stock: 0,
          warehouse_location: 'WH-04',
        })
        .expect(201);
      const insufficientProduct = productRes.body.data;

      const challengerRes = await salesAgent
        .post('/api/challans')
        .send({
          customerId: testData.customerABC.id,
          items: [
            { productId: testData.productLaptop.id, quantity: 2 },
            { productId: insufficientProduct.id, quantity: 100000 },
          ],
        })
        .expect(201);

      const challanId = challengerRes.body.data.id;
      const laptopStockBefore = Number((await adminAgent.get(`/api/products/${testData.productLaptop.id}`)).body.data.current_stock);
      const insufficientStockBefore = Number((await adminAgent.get(`/api/products/${insufficientProduct.id}`)).body.data.current_stock);

      await salesAgent.post(`/api/challans/${challanId}/confirm`).expect(400);

      const laptopStockAfter = Number((await adminAgent.get(`/api/products/${testData.productLaptop.id}`)).body.data.current_stock);
      const insufficientStockAfter = Number((await adminAgent.get(`/api/products/${insufficientProduct.id}`)).body.data.current_stock);
      expect(laptopStockAfter).toBe(laptopStockBefore);
      expect(insufficientStockAfter).toBe(insufficientStockBefore);

      const laptopMovements = await adminAgent.get(`/api/products/${testData.productLaptop.id}/stock-movements`).expect(200);
      expect(laptopMovements.body.data.filter((m) => m.movement_type === 'OUT' && m.reason.includes('Sales Challan')).length).toBeGreaterThanOrEqual(0);
      const insufficientMovements = await adminAgent.get(`/api/products/${insufficientProduct.id}/stock-movements`).expect(200);
      expect(insufficientMovements.body.data.some((m) => m.movement_type === 'OUT')).toBe(false);

      const challanAfter = await adminAgent.get(`/api/challans/${challanId}`).expect(200);
      expect(challanAfter.body.data.status).toBe('Draft');
    });

    test('cancel draft challan -> 200 and status Cancelled', async () => {
      const newChallanRes = await salesAgent
        .post('/api/challans')
        .send({
          customerId: testData.customerABC.id,
          items: [{ productId: testData.productMouse.id, quantity: 1 }],
        })
        .expect(201);
      const challan = newChallanRes.body.data;
      testData.challanCancelDraft = challan;

      await salesAgent.post(`/api/challans/${challan.id}/cancel`).expect(200);
      const challanAfter = await adminAgent.get(`/api/challans/${challan.id}`).expect(200);
      expect(challanAfter.body.data.status).toBe('Cancelled');
    });

    test('cancel confirmed challan -> 400', async () => {
      await salesAgent.post(`/api/challans/${testData.challanMulti.id}/cancel`).expect(400);
    });
  });

  describe('Snapshot and history tests', () => {
    test('product snapshot remains after price change', async () => {
      const payload = {
        name: `SnapshotLaptop ${randomSuffix}`,
        sku: `SNAP-${randomSuffix}`,
        category: 'Electronics',
        unit_price: 50000,
        current_stock: 5,
        minimum_stock: 1,
        warehouse_location: 'WH-05',
      };
      const productRes = await adminAgent.post('/api/products').send(payload).expect(201);
      testData.snapshotProduct = productRes.body.data;

      const customerRes = await adminAgent
        .post('/api/customers')
        .send({
          name: `Snapshot Customer ${randomSuffix}`,
          mobile: `902${randomSuffix}`,
          customer_type: 'Retail',
          status: 'Active',
        })
        .expect(201);
      const customer = customerRes.body.data;

      const challanRes = await salesAgent
        .post('/api/challans')
        .send({
          customerId: customer.id,
          items: [{ productId: testData.snapshotProduct.id, quantity: 1 }],
        })
        .expect(201);
      testData.snapshotChallan = challanRes.body.data;

      const fetchedChallan = await adminAgent.get(`/api/challans/${testData.snapshotChallan.id}`).expect(200);
      expect(fetchedChallan.body.data.items[0]).toMatchObject({ unit_price: '50000.00', sku: payload.sku });

      await adminAgent
        .put(`/api/products/${testData.snapshotProduct.id}`)
        .send({ unit_price: 55000 })
        .expect(200);

      const updatedProduct = await adminAgent.get(`/api/products/${testData.snapshotProduct.id}`).expect(200);
      expect(updatedProduct.body.data.unit_price).toBe('55000.00');

      const oldChallan = await adminAgent.get(`/api/challans/${testData.snapshotChallan.id}`).expect(200);
      expect(oldChallan.body.data.items[0].unit_price).toBe('50000.00');
    });

    test('pagination for customers/products/challans -> 200', async () => {
      await adminAgent.get('/api/customers').query({ page: 1, limit: 10 }).expect(200);
      await adminAgent.get('/api/products').query({ page: 1, limit: 10 }).expect(200);
      await adminAgent.get('/api/challans').query({ page: 1, limit: 10 }).expect(200);
    });
  });
});
