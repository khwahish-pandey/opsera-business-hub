import { PrismaClient } from '@prisma/client';
import { Role, CustomerType, CustomerStatus, MovementType, ChallanStatus } from '../src/types/enums';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting NEXORA ERP database seed...');

  // Clean existing data
  await prisma.challanItem.deleteMany();
  await prisma.challan.deleteMany();
  await prisma.stockMovement.deleteMany();
  await prisma.followUp.deleteMany();
  await prisma.product.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.user.deleteMany();
  await prisma.challanSequence.deleteMany();

  console.log('🧹 Cleaned existing data');

  // Hash passwords
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

  const accountsUser = await prisma.user.create({
    data: {
      name: 'Sanjay Mehta (Accounts)',
      email: 'accounts@nexora.com',
      passwordHash: accountsPasswordHash,
      role: Role.ACCOUNTS,
    },
  });

  console.log('👥 Seeded 4 system users with hashed credentials');

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
      followUpDate: null,
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
    {
      customerName: 'Vikramaditya Rao',
      mobile: '+919849011223',
      email: 'admin@royalenterprise.net',
      businessName: 'Royal Enterprise',
      gstNumber: '36HHHHR7777H1Z8',
      customerType: CustomerType.WHOLESALE,
      address: 'Balanagar Industrial Area, Hyderabad, Telangana 500037',
      status: CustomerStatus.ACTIVE,
      notes: 'Electrical & Industrial goods wholesale dealer.',
    },
    {
      customerName: 'Manish Agarwal',
      mobile: '+919414033445',
      email: 'manish@primewholesalers.com',
      businessName: 'Prime Wholesalers Jaipur',
      gstNumber: '08IIIII8888I1Z0',
      customerType: CustomerType.WHOLESALE,
      address: 'MI Road Industrial Zone, Jaipur, Rajasthan 302001',
      status: CustomerStatus.INACTIVE,
      notes: 'Account placed on hold due to pending audit verification.',
    },
    {
      customerName: 'Sunil Deshmukh',
      mobile: '+919822055667',
      email: 'sunil@bharatgoods.com',
      businessName: 'Bharat Goods Hub',
      gstNumber: '27JJJJB9999J1Z6',
      customerType: CustomerType.DISTRIBUTOR,
      address: 'Market Yard Phase 2, Pune, Maharashtra 411037',
      status: CustomerStatus.ACTIVE,
      followUpDate: new Date('2026-08-25'),
      notes: 'Major distributor for West India hardware tools.',
    },
    {
      customerName: 'Pankaj Bansal',
      mobile: '+919810088990',
      email: 'pankaj@citycommercials.in',
      businessName: 'City Commercials',
      gstNumber: null,
      customerType: CustomerType.RETAIL,
      address: 'Mall Road Marketplace, Kanpur, Uttar Pradesh 208001',
      status: CustomerStatus.LEAD,
      notes: 'Lead interested in thermal receipt printers.',
    },
  ];

  const createdCustomers = [];
  for (const c of customerData) {
    const customer = await prisma.customer.create({ data: c });
    createdCustomers.push(customer);
  }
  console.log(`🏢 Seeded ${createdCustomers.length} realistic wholesale customers`);

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
      currentStock: 6, // LOW STOCK test condition!
      minimumStock: 10,
      warehouseLocation: 'Rack A-08',
    },
    {
      name: 'Digital Heavy Duty Scale 100kg',
      sku: 'ELE-SCL-100K',
      category: 'Electronics',
      unitPrice: 7500.0,
      currentStock: 18,
      minimumStock: 5,
      warehouseLocation: 'Rack A-15',
    },
    {
      name: 'Solar Hybrid Inverter 1.5kVA',
      sku: 'ELE-INV-1.5K',
      category: 'Electronics',
      unitPrice: 18900.0,
      currentStock: 4, // LOW STOCK!
      minimumStock: 8,
      warehouseLocation: 'Rack B-01',
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
      name: 'Chakki Fresh Wheat Flour 10kg',
      sku: 'GRO-FLR-WHT10',
      category: 'Grocery',
      unitPrice: 420.0,
      currentStock: 300,
      minimumStock: 60,
      warehouseLocation: 'Bay G-05',
    },
    {
      name: 'Stainless Steel Door Hinge 4"',
      sku: 'HRD-HNG-SS4',
      category: 'Hardware',
      unitPrice: 140.0,
      currentStock: 500,
      minimumStock: 100,
      warehouseLocation: 'Shelf H-10',
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
    {
      name: 'Industrial Brass Door Handle Set',
      sku: 'HRD-HDL-BRS',
      category: 'Hardware',
      unitPrice: 680.0,
      currentStock: 3, // LOW STOCK!
      minimumStock: 15,
      warehouseLocation: 'Shelf H-06',
    },
    {
      name: 'Armoured Copper Power Cable 100m Roll',
      sku: 'HRD-CBL-CU100',
      category: 'Hardware',
      unitPrice: 12500.0,
      currentStock: 22,
      minimumStock: 5,
      warehouseLocation: 'Yard H-99',
    },
    {
      name: 'Egyptian Cotton King Bedsheet Set',
      sku: 'TEX-BED-KING',
      category: 'Textiles',
      unitPrice: 1850.0,
      currentStock: 90,
      minimumStock: 20,
      warehouseLocation: 'Aisle T-02',
    },
    {
      name: 'Heavyweight Denim Fabric Roll 50m',
      sku: 'TEX-DNM-50M',
      category: 'Textiles',
      unitPrice: 6200.0,
      currentStock: 35,
      minimumStock: 10,
      warehouseLocation: 'Aisle T-05',
    },
    {
      name: 'Commercial Citrus Juicer Machine',
      sku: 'APP-JCR-COMM',
      category: 'Appliances',
      unitPrice: 9800.0,
      currentStock: 12,
      minimumStock: 4,
      warehouseLocation: 'Rack C-03',
    },
  ];

  const createdProducts = [];
  for (const p of productData) {
    const product = await prisma.product.create({ data: p });
    createdProducts.push(product);

    // Initial stock IN movement record
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
  console.log(`📦 Seeded ${createdProducts.length} products and initial stock movement audit logs`);

  // 4. Create Follow-up Notes for Customers
  const followUpNotes = [
    { customerIdx: 0, note: 'Called Anil Sharma regarding Q3 bulk order discount schedule.', date: new Date('2026-08-01') },
    { customerIdx: 0, note: 'Received inquiry for 50 units of LED TVs.', date: new Date('2026-08-04') },
    { customerIdx: 1, note: 'Apex Retail requested delivery updates for Challan #1.', date: new Date('2026-08-02') },
    { customerIdx: 2, note: 'Discussed Ludhiana grain market price adjustments.', date: new Date('2026-08-03') },
    { customerIdx: 4, note: 'Patel Trade Agency confirmed agreement for Vadodara expansion.', date: new Date('2026-08-05') },
    { customerIdx: 6, note: 'Sent quotation and product catalog to Horizon Traders.', date: new Date('2026-08-06') },
  ];

  for (const f of followUpNotes) {
    await prisma.followUp.create({
      data: {
        customerId: createdCustomers[f.customerIdx].id,
        note: f.note,
        followUpDate: f.date,
        createdById: salesUser.id,
      },
    });
  }
  console.log('📝 Seeded customer CRM follow-up records');

  // 5. Initialize Challan Sequence
  await prisma.challanSequence.create({
    data: {
      id: 'CHALLAN_SEQ',
      year: 2026,
      lastValue: 5,
    },
  });

  // 6. Seed Sample Challans (Confirmed, Draft, Cancelled)
  // Challan 1: CONFIRMED
  const challan1 = await prisma.challan.create({
    data: {
      challanNumber: 'CH-2026-00001',
      customerId: createdCustomers[0].id, // Sharma Distributors
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

  // Challan 2: CONFIRMED
  const challan2 = await prisma.challan.create({
    data: {
      challanNumber: 'CH-2026-00002',
      customerId: createdCustomers[1].id, // Apex Retail
      totalQuantity: 20,
      totalAmount: 10 * 2200.0 + 10 * 850.0,
      status: ChallanStatus.CONFIRMED,
      createdById: salesUser.id,
      items: {
        create: [
          {
            productId: createdProducts[5].id, // Rice
            productNameSnapshot: createdProducts[5].name,
            skuSnapshot: createdProducts[5].sku,
            unitPriceSnapshot: createdProducts[5].unitPrice,
            quantity: 10,
            totalPrice: 10 * 2200.0,
          },
          {
            productId: createdProducts[6].id, // Oil
            productNameSnapshot: createdProducts[6].name,
            skuSnapshot: createdProducts[6].sku,
            unitPriceSnapshot: createdProducts[6].unitPrice,
            quantity: 10,
            totalPrice: 10 * 850.0,
          },
        ],
      },
    },
  });

  await prisma.stockMovement.createMany({
    data: [
      {
        productId: createdProducts[5].id,
        quantity: 10,
        movementType: MovementType.OUT,
        reason: `Challan confirmation: ${challan2.challanNumber}`,
        createdById: salesUser.id,
      },
      {
        productId: createdProducts[6].id,
        quantity: 10,
        movementType: MovementType.OUT,
        reason: `Challan confirmation: ${challan2.challanNumber}`,
        createdById: salesUser.id,
      },
    ],
  });

  // Challan 3: DRAFT
  await prisma.challan.create({
    data: {
      challanNumber: 'CH-2026-00003',
      customerId: createdCustomers[2].id, // Singh Wholesale
      totalQuantity: 15,
      totalAmount: 15 * 140.0,
      status: ChallanStatus.DRAFT,
      createdById: salesUser.id,
      items: {
        create: [
          {
            productId: createdProducts[8].id, // Hinges
            productNameSnapshot: createdProducts[8].name,
            skuSnapshot: createdProducts[8].sku,
            unitPriceSnapshot: createdProducts[8].unitPrice,
            quantity: 15,
            totalPrice: 15 * 140.0,
          },
        ],
      },
    },
  });

  // Challan 4: CANCELLED (Restored Stock)
  const challan4 = await prisma.challan.create({
    data: {
      challanNumber: 'CH-2026-00004',
      customerId: createdCustomers[3].id, // Metro General Store
      totalQuantity: 2,
      totalAmount: 2 * 3450.0,
      status: ChallanStatus.CANCELLED,
      createdById: salesUser.id,
      items: {
        create: [
          {
            productId: createdProducts[9].id, // Power Drill
            productNameSnapshot: createdProducts[9].name,
            skuSnapshot: createdProducts[9].sku,
            unitPriceSnapshot: createdProducts[9].unitPrice,
            quantity: 2,
            totalPrice: 2 * 3450.0,
          },
        ],
      },
    },
  });

  await prisma.stockMovement.create({
    data: {
      productId: createdProducts[9].id,
      quantity: 2,
      movementType: MovementType.IN,
      reason: `Challan cancellation: ${challan4.challanNumber}`,
      createdById: salesUser.id,
    },
  });

  // Challan 5: DRAFT
  await prisma.challan.create({
    data: {
      challanNumber: 'CH-2026-00005',
      customerId: createdCustomers[5].id, // Lakshmi Supermarket
      totalQuantity: 50,
      totalAmount: 50 * 420.0,
      status: ChallanStatus.DRAFT,
      createdById: adminUser.id,
      items: {
        create: [
          {
            productId: createdProducts[7].id, // Wheat Flour
            productNameSnapshot: createdProducts[7].name,
            skuSnapshot: createdProducts[7].sku,
            unitPriceSnapshot: createdProducts[7].unitPrice,
            quantity: 50,
            totalPrice: 50 * 420.0,
          },
        ],
      },
    },
  });

  console.log('📜 Seeded 5 sales challans across DRAFT, CONFIRMED, and CANCELLED states');
  console.log('✅ NEXORA ERP seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
