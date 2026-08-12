import { prisma } from './prisma';
import { Role, CustomerType, CustomerStatus, MovementType, ChallanStatus } from '../types/enums';
import * as bcrypt from 'bcryptjs';

export async function seedDatabaseIfNeeded() {
  try {
    const userCount = await prisma.user.count();
    if (userCount > 0) {
      console.log('✅ Database already contains data. Skipping seed.');
      return;
    }

    console.log('🌱 Empty database detected. Auto-seeding initial NEXORA ERP data...');

    const adminPasswordHash = await bcrypt.hash('Admin@123', 10);
    const salesPasswordHash = await bcrypt.hash('Sales@123', 10);
    const warehousePasswordHash = await bcrypt.hash('Warehouse@123', 10);
    const accountsPasswordHash = await bcrypt.hash('Accounts@123', 10);

    // 1. Create Users
    const adminUser = await prisma.user.create({
      data: {
        name: 'Rajesh Sharma (Admin)',
        email: 'admin@nexora.com',
        passwordHash: adminPasswordHash,
        role: Role.ADMIN,
      },
    });

    const salesUser = await prisma.user.create({
      data: {
        name: 'Priya Verma (Sales Exec)',
        email: 'sales@nexora.com',
        passwordHash: salesPasswordHash,
        role: Role.SALES,
      },
    });

    const warehouseUser = await prisma.user.create({
      data: {
        name: 'Vikram Singh (Warehouse Mgr)',
        email: 'warehouse@nexora.com',
        passwordHash: warehousePasswordHash,
        role: Role.WAREHOUSE,
      },
    });

    await prisma.user.create({
      data: {
        name: 'Sanjay Mehta (Accounts)',
        email: 'accounts@nexora.com',
        passwordHash: accountsPasswordHash,
        role: Role.ACCOUNTS,
      },
    });

    // 2. Create Customers
    const customerData = [
      {
        customerName: 'Anil Sharma',
        mobile: '+919876543210',
        email: 'anil@sharmadist.com',
        businessName: 'Sharma Distributors',
        gstNumber: '07AAAAA0000A1Z5',
        customerType: CustomerType.DISTRIBUTOR,
        address: 'Plot 45, Okhla Industrial Area Phase 3, New Delhi, Delhi 110020',
        status: CustomerStatus.ACTIVE,
        followUpDate: new Date('2026-08-15'),
        notes: 'Key distributor for North Region. Requesting extended 30-day credit terms.',
      },
      {
        customerName: 'Suresh Patel',
        mobile: '+919823456789',
        email: 'suresh@apexretail.in',
        businessName: 'Apex Retail Mart',
        gstNumber: '24BBBBA1111B2Z3',
        customerType: CustomerType.RETAIL,
        address: 'Shop 12-14, Commercial Center, CG Road, Ahmedabad, Gujarat 380009',
        status: CustomerStatus.ACTIVE,
        followUpDate: new Date('2026-08-20'),
        notes: 'Chain of 5 retail stores. High volume orders in groceries and electronics.',
      },
      {
        customerName: 'Gurpreet Singh',
        mobile: '+919811122233',
        email: 'gurpreet@singhwholesale.com',
        businessName: 'Singh Wholesale Enterprises',
        gstNumber: '03CCCCS2222C1Z9',
        customerType: CustomerType.WHOLESALE,
        address: 'Grain Market Road, GT Road, Ludhiana, Punjab 141008',
        status: CustomerStatus.ACTIVE,
        notes: 'Prompt payment history. Interested in seasonal discounts.',
      },
      {
        customerName: 'Ramesh Gupta',
        mobile: '+919988776655',
        email: 'info@metrogeneral.com',
        businessName: 'Metro General Store',
        gstNumber: '27DDDDF3333D1Z1',
        customerType: CustomerType.RETAIL,
        address: '22 Station Road, Dadar West, Mumbai, Maharashtra 400028',
        status: CustomerStatus.ACTIVE,
        notes: 'Regular buyer of hardware supplies and cables.',
      },
      {
        customerName: 'Kiran Patel',
        mobile: '+919765432109',
        email: 'kiran@pateltrade.org',
        businessName: 'Patel Trade Agency',
        gstNumber: '24EEEEK4444E1Z4',
        customerType: CustomerType.DISTRIBUTOR,
        address: 'GIDC Industrial Estate, Makarpura, Vadodara, Gujarat 390010',
        status: CustomerStatus.ACTIVE,
        followUpDate: new Date('2026-08-12'),
        notes: 'Expanding to South Gujarat markets.',
      },
      {
        customerName: 'Narayanan Iyer',
        mobile: '+919444012345',
        email: 'purchasing@lakshmisuper.com',
        businessName: 'Lakshmi Supermarket Pvt Ltd',
        gstNumber: '33FFFKL5555F1Z2',
        customerType: CustomerType.RETAIL,
        address: '108 T Nagar Main Road, Chennai, Tamil Nadu 600017',
        status: CustomerStatus.ACTIVE,
        notes: 'Weekly recurring purchase order for staples & FMCG.',
      },
      {
        customerName: 'Deepak Roy',
        mobile: '+919830098765',
        email: 'deepak@horizontraders.co.in',
        businessName: 'Horizon Traders',
        gstNumber: '19GGGGH6666G1Z7',
        customerType: CustomerType.WHOLESALE,
        address: 'Burrabazar Textile Market, Kolkata, West Bengal 700007',
        status: CustomerStatus.LEAD,
        followUpDate: new Date('2026-08-10'),
        notes: 'New lead from Trade Expo. Requested sample challan quote.',
      },
    ];

    const createdCustomers = [];
    for (const c of customerData) {
      const customer = await prisma.customer.create({ data: c });
      createdCustomers.push(customer);
    }

    // 3. Create Products
    const productData = [
      {
        name: 'Smart LED TV 43" Ultra HD',
        sku: 'ELE-TV-43UHD',
        category: 'Electronics',
        unitPrice: 24500.0,
        currentStock: 45,
        minimumStock: 10,
        warehouseLocation: 'Rack A-12',
      },
      {
        name: 'Wireless Barcode Scanner 2.4G',
        sku: 'ELE-SCN-WIFI',
        category: 'Electronics',
        unitPrice: 3200.0,
        currentStock: 80,
        minimumStock: 15,
        warehouseLocation: 'Rack A-04',
      },
      {
        name: 'Thermal Receipt Printer 80mm',
        sku: 'ELE-PRN-TH80',
        category: 'Electronics',
        unitPrice: 4800.0,
        currentStock: 6,
        minimumStock: 10,
        warehouseLocation: 'Rack A-08',
      },
      {
        name: 'Premium Basmati Rice 25kg Bag',
        sku: 'GRO-RCE-BAS25',
        category: 'Grocery',
        unitPrice: 2200.0,
        currentStock: 250,
        minimumStock: 50,
        warehouseLocation: 'Bay G-01',
      },
      {
        name: 'Kachi Ghani Mustard Oil 5L Tin',
        sku: 'GRO-OIL-MUST5',
        category: 'Grocery',
        unitPrice: 850.0,
        currentStock: 140,
        minimumStock: 30,
        warehouseLocation: 'Bay G-03',
      },
      {
        name: 'Heavy Duty Rotary Power Drill 750W',
        sku: 'HRD-DRL-750W',
        category: 'Hardware',
        unitPrice: 3450.0,
        currentStock: 28,
        minimumStock: 10,
        warehouseLocation: 'Shelf H-02',
      },
    ];

    const createdProducts = [];
    for (const p of productData) {
      const product = await prisma.product.create({ data: p });
      createdProducts.push(product);

      await prisma.stockMovement.create({
        data: {
          productId: product.id,
          quantity: product.currentStock,
          movementType: MovementType.IN,
          reason: 'Initial warehouse stock onboarding',
          createdById: warehouseUser.id,
        },
      });
    }

    // 4. Challan Sequence
    await prisma.challanSequence.create({
      data: {
        id: 'CHALLAN_SEQ',
        year: 2026,
        lastValue: 1,
      },
    });

    // 5. Seed 1 Sample Challan
    const challan1 = await prisma.challan.create({
      data: {
        challanNumber: 'CH-2026-00001',
        customerId: createdCustomers[0].id,
        totalQuantity: 5,
        totalAmount: 5 * 24500.0,
        status: ChallanStatus.CONFIRMED,
        createdById: salesUser.id,
        items: {
          create: [
            {
              productId: createdProducts[0].id,
              productNameSnapshot: createdProducts[0].name,
              skuSnapshot: createdProducts[0].sku,
              unitPriceSnapshot: createdProducts[0].unitPrice,
              quantity: 5,
              totalPrice: 5 * 24500.0,
            },
          ],
        },
      },
    });

    await prisma.stockMovement.create({
      data: {
        productId: createdProducts[0].id,
        quantity: 5,
        movementType: MovementType.OUT,
        reason: `Challan confirmation: ${challan1.challanNumber}`,
        createdById: salesUser.id,
      },
    });

    console.log('✅ Auto-seeding complete!');
  } catch (error) {
    console.error('⚠️ Auto-seeding warning:', error);
  }
}
