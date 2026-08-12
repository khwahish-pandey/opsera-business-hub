import request from 'supertest';
import app from '../src/app';
import { prisma } from '../src/utils/prisma';
import bcrypt from 'bcryptjs';
import { Role, ChallanStatus, MovementType } from '../src/types/enums';

describe('NEXORA ERP Business Logic & API Tests', () => {
  let adminToken: string;
  let salesToken: string;
  let warehouseToken: string;
  let accountsToken: string;

  let testCustomerId: string;
  let testProductId: string;
  let lowStockProductId: string;

  beforeAll(async () => {
    // Clean database before test suite run
    await prisma.challanItem.deleteMany();
    await prisma.challan.deleteMany();
    await prisma.stockMovement.deleteMany();
    await prisma.followUp.deleteMany();
    await prisma.product.deleteMany();
    await prisma.customer.deleteMany();
    await prisma.user.deleteMany();
    await prisma.challanSequence.deleteMany();

    // Create test users for all 4 roles
    const passwordHash = await bcrypt.hash('TestPass123', 10);

    const adminUser = await prisma.user.create({
      data: { name: 'Admin Tester', email: 'admin.test@nexora.com', passwordHash, role: Role.ADMIN },
    });
    const salesUser = await prisma.user.create({
      data: { name: 'Sales Tester', email: 'sales.test@nexora.com', passwordHash, role: Role.SALES },
    });
    const warehouseUser = await prisma.user.create({
      data: { name: 'Warehouse Tester', email: 'warehouse.test@nexora.com', passwordHash, role: Role.WAREHOUSE },
    });
    const accountsUser = await prisma.user.create({
      data: { name: 'Accounts Tester', email: 'accounts.test@nexora.com', passwordHash, role: Role.ACCOUNTS },
    });

    // Obtain JWT tokens via login endpoint
    const adminRes = await request(app).post('/api/auth/login').send({ email: 'admin.test@nexora.com', password: 'TestPass123' });
    adminToken = adminRes.body.data.token;

    const salesRes = await request(app).post('/api/auth/login').send({ email: 'sales.test@nexora.com', password: 'TestPass123' });
    salesToken = salesRes.body.data.token;

    const whRes = await request(app).post('/api/auth/login').send({ email: 'warehouse.test@nexora.com', password: 'TestPass123' });
    warehouseToken = whRes.body.data.token;

    const accRes = await request(app).post('/api/auth/login').send({ email: 'accounts.test@nexora.com', password: 'TestPass123' });
    accountsToken = accRes.body.data.token;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('1. Authentication & RBAC Tests', () => {
    it('should authenticate valid user and return JWT token', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'admin.test@nexora.com', password: 'TestPass123' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.role).toBe('ADMIN');
    });

    it('should reject invalid credentials with 401', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'admin.test@nexora.com', password: 'WrongPassword' });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should enforce RBAC: prevent WAREHOUSE user from creating customer', async () => {
      const res = await request(app)
        .post('/api/customers')
        .set('Authorization', `Bearer ${warehouseToken}`)
        .send({
          customerName: 'Unauthorized Customer',
          mobile: '+919999988888',
          email: 'unauth@test.com',
          businessName: 'Unauth Corp',
          address: '123 Fake Street',
        });

      expect(res.status).toBe(403); // 403 Forbidden
      expect(res.body.success).toBe(false);
    });
  });

  describe('2. Customer & Product Creation Tests', () => {
    it('should allow SALES user to create a Customer', async () => {
      const res = await request(app)
        .post('/api/customers')
        .set('Authorization', `Bearer ${salesToken}`)
        .send({
          customerName: 'Harish Chandra',
          mobile: '+919876500011',
          email: 'harish@chandra-traders.in',
          businessName: 'Chandra Traders',
          gstNumber: '07AAAAA1111A1Z5',
          customerType: 'WHOLESALE',
          address: '45 Grain Market, Delhi',
          status: 'ACTIVE',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBeDefined();
      testCustomerId = res.body.data.id;
    });

    it('should allow ADMIN to create Products', async () => {
      // Product 1: Stock 50
      const res1 = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Heavy Duty Power Cable 50m',
          sku: 'TST-CBL-50M',
          category: 'Hardware',
          unitPrice: 1500,
          currentStock: 50,
          minimumStock: 10,
          warehouseLocation: 'Shelf T-1',
        });

      expect(res1.status).toBe(201);
      testProductId = res1.body.data.id;

      // Product 2: Low Stock (Stock: 5, Min: 10)
      const res2 = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Micro Thermal Printer 58mm',
          sku: 'TST-PRN-58',
          category: 'Electronics',
          unitPrice: 2800,
          currentStock: 5,
          minimumStock: 10,
          warehouseLocation: 'Shelf E-2',
        });

      expect(res2.status).toBe(201);
      lowStockProductId = res2.body.data.id;
    });
  });

  describe('3. Challan & Critical Stock Business Logic Tests', () => {
    let draftChallanId: string;

    it('should allow SALES to create a Draft Challan with sequential number', async () => {
      const res = await request(app)
        .post('/api/challans')
        .set('Authorization', `Bearer ${salesToken}`)
        .send({
          customerId: testCustomerId,
          items: [
            { productId: testProductId, quantity: 10, unitPrice: 1500 },
          ],
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('DRAFT');
      expect(res.body.data.challanNumber).toMatch(/^CH-\d{4}-\d{5}$/);
      draftChallanId = res.body.data.id;

      // Verify draft challan does NOT reduce stock yet
      const product = await prisma.product.findUnique({ where: { id: testProductId } });
      expect(product?.currentStock).toBe(50);
    });

    it('CRITICAL TEST: should REJECT confirmation when stock is INSUFFICIENT and preserve stock', async () => {
      // Create a draft challan requesting 10 units of lowStockProduct (only 5 in stock)
      const draftRes = await request(app)
        .post('/api/challans')
        .set('Authorization', `Bearer ${salesToken}`)
        .send({
          customerId: testCustomerId,
          items: [{ productId: lowStockProductId, quantity: 10 }],
        });

      const insufficientChallanId = draftRes.body.data.id;

      // Attempt to confirm
      const confirmRes = await request(app)
        .post(`/api/challans/${insufficientChallanId}/confirm`)
        .set('Authorization', `Bearer ${salesToken}`);

      expect(confirmRes.status).toBe(400);
      expect(confirmRes.body.success).toBe(false);
      expect(confirmRes.body.message).toContain('Insufficient stock');

      // Verify stock was unchanged (still 5)
      const product = await prisma.product.findUnique({ where: { id: lowStockProductId } });
      expect(product?.currentStock).toBe(5);

      // Verify challan status remains DRAFT
      const challan = await prisma.challan.findUnique({ where: { id: insufficientChallanId } });
      expect(challan?.status).toBe('DRAFT');
    });

    it('CRITICAL TEST: should CONFIRM draft challan with SUFFICIENT stock, reduce stock, and log OUT movement', async () => {
      const confirmRes = await request(app)
        .post(`/api/challans/${draftChallanId}/confirm`)
        .set('Authorization', `Bearer ${salesToken}`);

      expect(confirmRes.status).toBe(200);
      expect(confirmRes.body.success).toBe(true);
      expect(confirmRes.body.data.status).toBe('CONFIRMED');

      // Verify product stock reduced from 50 to 40
      const product = await prisma.product.findUnique({ where: { id: testProductId } });
      expect(product?.currentStock).toBe(40);

      // Verify OUT stock movement audit log created
      const movement = await prisma.stockMovement.findFirst({
        where: { productId: testProductId, movementType: MovementType.OUT },
      });
      expect(movement).toBeDefined();
      expect(movement?.quantity).toBe(10);
    });

    it('CRITICAL TEST: should CANCEL a confirmed challan, restore inventory stock, and log IN movement', async () => {
      const cancelRes = await request(app)
        .post(`/api/challans/${draftChallanId}/cancel`)
        .set('Authorization', `Bearer ${salesToken}`);

      expect(cancelRes.status).toBe(200);
      expect(cancelRes.body.success).toBe(true);
      expect(cancelRes.body.data.status).toBe('CANCELLED');

      // Verify stock restored back to 50 (40 + 10)
      const product = await prisma.product.findUnique({ where: { id: testProductId } });
      expect(product?.currentStock).toBe(50);

      // Verify IN stock movement audit log created with cancellation reason
      const movement = await prisma.stockMovement.findFirst({
        where: { productId: testProductId, movementType: MovementType.IN, reason: { contains: 'cancellation' } },
      });
      expect(movement).toBeDefined();
      expect(movement?.quantity).toBe(10);
    });
  });
});
