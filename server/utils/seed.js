import mongoose from 'mongoose';
import User from '../models/User.js';
import Customer from '../models/Customer.js';
import Plan from '../models/Plan.js';
import Subscription from '../models/Subscription.js';
import Usage from '../models/Usage.js';
import Invoice from '../models/Invoice.js';
import Payment from '../models/Payment.js';
import Notification from '../models/Notification.js';

export const autoSeedIfEmpty = async () => {
  const usersCount = await User.countDocuments();
  if (usersCount === 0) {
    console.log('[Seed] Database is empty. Running initial seeder...');
    await runSeed();
  }
};

export const runSeed = async () => {
  try {
    console.log('[Seed] Starting database cleanup and seeding...');

    // Clear existing collections
    await Promise.all([
      User.deleteMany({}),
      Customer.deleteMany({}),
      Plan.deleteMany({}),
      Subscription.deleteMany({}),
      Usage.deleteMany({}),
      Invoice.deleteMany({}),
      Payment.deleteMany({}),
      Notification.deleteMany({}),
    ]);

    const defaultPassword = 'Password@123';
    const passwordHash = await User.hashPassword(defaultPassword);

    // 1. Create Users (Page 6 & 14: ADMIN, SUPPORT, CUSTOMER)
    const adminUser = await User.create({
      name: 'Super Admin',
      email: 'admin@telecom.com',
      passwordHash,
      role: 'ADMIN',
      status: 'ACTIVE',
    });

    const supportUser = await User.create({
      name: 'Support Representative',
      email: 'support@telecom.com',
      passwordHash,
      role: 'SUPPORT',
      status: 'ACTIVE',
    });

    const customerUser1 = await User.create({
      name: 'Aarav Sharma',
      email: 'customer@telecom.com',
      passwordHash,
      role: 'CUSTOMER',
      status: 'ACTIVE',
    });

    const customerUser2 = await User.create({
      name: 'Riya Patel',
      email: 'riya@telecom.com',
      passwordHash,
      role: 'CUSTOMER',
      status: 'ACTIVE',
    });

    const customerUser3 = await User.create({
      name: 'Vikram Malhotra',
      email: 'vikram@telecom.com',
      passwordHash,
      role: 'CUSTOMER',
      status: 'ACTIVE',
    });

    // 2. Create Customers
    const cust1 = await Customer.create({
      userId: customerUser1._id,
      customerCode: 'CUST1001',
      phone: '+91 98765 43210',
      address: {
        street: '42 MG Road, Indiranagar',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560038',
      },
      accountStatus: 'ACTIVE',
    });

    const cust2 = await Customer.create({
      userId: customerUser2._id,
      customerCode: 'CUST1002',
      phone: '+91 91234 56789',
      address: {
        street: '15 Bandra Kurla Complex',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400051',
      },
      accountStatus: 'ACTIVE',
    });

    const cust3 = await Customer.create({
      userId: customerUser3._id,
      customerCode: 'CUST1003',
      phone: '+91 99887 76655',
      address: {
        street: '88 Cyber City, DLF Phase 2',
        city: 'Gurugram',
        state: 'Haryana',
        pincode: '122002',
      },
      accountStatus: 'ACTIVE',
    });

    // 3. Create Plans (Page 8: Plan Price ₹499, Included Data 5GB, Extra rate ₹50/GB)
    const planSaver = await Plan.create({
      name: 'Standard Saver 499',
      planCode: 'PLAN_SAVER_499',
      monthlyPrice: 499,
      includedData: 5,
      includedSms: 100,
      callPolicy: 'Unlimited Local + STD Calls',
      dataOverageRate: 50,
      smsOverageRate: 1,
      speed: '4G/5G 100 Mbps',
      description: 'Ideal for basic browsing and regular communication with crystal-clear voice calling.',
      status: 'ACTIVE',
    });

    const planPro = await Plan.create({
      name: 'Unlimited Pro 799',
      planCode: 'PLAN_PRO_799',
      monthlyPrice: 799,
      includedData: 25,
      includedSms: 300,
      callPolicy: 'Unlimited Calls + Free Roaming',
      dataOverageRate: 40,
      smsOverageRate: 1,
      speed: '5G Ultra Speed (Up to 500 Mbps)',
      description: 'High-speed 5G streaming, gaming, and remote work connectivity with generous quotas.',
      status: 'ACTIVE',
    });

    const planMax = await Plan.create({
      name: 'Infinity Max 1299',
      planCode: 'PLAN_MAX_1299',
      monthlyPrice: 1299,
      includedData: 75,
      includedSms: 1000,
      callPolicy: 'Unlimited Calls + Free Roaming + 100 Int Mins',
      dataOverageRate: 30,
      smsOverageRate: 0.5,
      speed: '5G Gigabit Priority Speed',
      description: 'Top-tier plan designed for power users, creators, and international travelers.',
      status: 'ACTIVE',
    });

    const planEnterprise = await Plan.create({
      name: 'Enterprise Ultra 2499',
      planCode: 'PLAN_ENT_2499',
      monthlyPrice: 2499,
      includedData: 250,
      includedSms: 5000,
      callPolicy: 'Dedicated VoLTE Line + Unlimited Int Mins',
      dataOverageRate: 20,
      smsOverageRate: 0.25,
      speed: 'Dedicated 5G mmWave 2 Gbps',
      description: 'Enterprise grade connectivity with dedicated SLA, static IP support and priority routing.',
      status: 'ACTIVE',
    });

    // 4. Create Active Subscriptions
    const sub1 = await Subscription.create({
      customerId: cust1._id,
      planId: planSaver._id,
      startDate: new Date('2026-09-01'),
      status: 'ACTIVE',
      billingCycleDay: 1,
    });

    const sub2 = await Subscription.create({
      customerId: cust2._id,
      planId: planPro._id,
      startDate: new Date('2026-09-15'),
      status: 'ACTIVE',
      billingCycleDay: 1,
    });

    const sub3 = await Subscription.create({
      customerId: cust3._id,
      planId: planMax._id,
      startDate: new Date('2026-08-01'),
      status: 'ACTIVE',
      billingCycleDay: 1,
    });

    // 5. Create Usage Records (Matching Page 8 & 10 example for CUST1001)
    // CUST1001: Included Data: 5GB, Actual Data: 7GB -> 2GB Extra
    // SMS: Included 100, Actual 120 -> 20 Extra
    await Usage.create([
      {
        customerId: cust1._id,
        type: 'DATA',
        quantity: 3.5,
        unit: 'GB',
        usageDate: new Date('2026-10-02'),
        billingPeriod: '2026-10',
        isBilled: true,
      },
      {
        customerId: cust1._id,
        type: 'DATA',
        quantity: 3.5,
        unit: 'GB',
        usageDate: new Date('2026-10-04'),
        billingPeriod: '2026-10',
        isBilled: true,
      },
      {
        customerId: cust1._id,
        type: 'SMS',
        quantity: 120,
        unit: 'SMS',
        usageDate: new Date('2026-10-03'),
        billingPeriod: '2026-10',
        isBilled: true,
      },
      {
        customerId: cust1._id,
        type: 'VOICE',
        quantity: 420,
        unit: 'MINS',
        usageDate: new Date('2026-10-05'),
        billingPeriod: '2026-10',
        isBilled: true,
      },
      // CUST2 usage
      {
        customerId: cust2._id,
        type: 'DATA',
        quantity: 18.2,
        unit: 'GB',
        usageDate: new Date('2026-10-03'),
        billingPeriod: '2026-10',
        isBilled: false,
      },
      {
        customerId: cust2._id,
        type: 'VOICE',
        quantity: 215,
        unit: 'MINS',
        usageDate: new Date('2026-10-04'),
        billingPeriod: '2026-10',
        isBilled: false,
      },
      // CUST3 usage
      {
        customerId: cust3._id,
        type: 'DATA',
        quantity: 42.8,
        unit: 'GB',
        usageDate: new Date('2026-10-05'),
        billingPeriod: '2026-10',
        isBilled: false,
      },
    ]);

    // 6. Create Invoices (Page 8-11: INV10001 matching specification)
    // Plan 499 + Data charge (2 x 50) 100 + SMS 20 - Discount 50 + Tax 102 = Total 671
    const inv1 = await Invoice.create({
      invoiceNumber: 'INV10001',
      customerId: cust1._id,
      billingPeriod: '2026-10',
      baseAmount: 499,
      usageAmount: 120,
      dataCharge: 100,
      smsCharge: 20,
      discount: 50,
      tax: 102,
      totalAmount: 671,
      status: 'PENDING',
      dueDate: new Date('2026-10-25'),
      generatedDate: new Date('2026-10-07'),
      details: {
        planName: planSaver.name,
        includedDataGB: 5,
        actualDataGB: 7,
        extraDataGB: 2,
        dataRatePerGB: 50,
        includedSms: 100,
        actualSms: 120,
        extraSms: 20,
        taxRate: 0.18,
      },
    });

    // Previous month paid invoice for CUST1
    const inv0 = await Invoice.create({
      invoiceNumber: 'INV10000',
      customerId: cust1._id,
      billingPeriod: '2026-09',
      baseAmount: 499,
      usageAmount: 0,
      dataCharge: 0,
      smsCharge: 0,
      discount: 0,
      tax: 90,
      totalAmount: 589,
      status: 'PAID',
      dueDate: new Date('2026-09-25'),
      generatedDate: new Date('2026-09-05'),
      details: {
        planName: planSaver.name,
        includedDataGB: 5,
        actualDataGB: 4.8,
        extraDataGB: 0,
        dataRatePerGB: 50,
        includedSms: 100,
        actualSms: 75,
        extraSms: 0,
        taxRate: 0.18,
      },
    });

    // Invoice for CUST2
    const inv2 = await Invoice.create({
      invoiceNumber: 'INV10002',
      customerId: cust2._id,
      billingPeriod: '2026-09',
      baseAmount: 799,
      usageAmount: 0,
      dataCharge: 0,
      smsCharge: 0,
      discount: 100,
      tax: 126,
      totalAmount: 825,
      status: 'PAID',
      dueDate: new Date('2026-09-28'),
      generatedDate: new Date('2026-09-08'),
      details: {
        planName: planPro.name,
        includedDataGB: 25,
        actualDataGB: 22,
        extraDataGB: 0,
        dataRatePerGB: 40,
        includedSms: 300,
        actualSms: 150,
        extraSms: 0,
        taxRate: 0.18,
      },
    });

    // 7. Create Payment records
    await Payment.create({
      invoiceId: inv0._id,
      customerId: cust1._id,
      amount: 589,
      transactionId: 'TXN-20260920-8812',
      idempotencyKey: 'IDEMP-INV10000-001',
      paymentMethod: 'UPI',
      status: 'SUCCESS',
      paidAt: new Date('2026-09-20'),
      gatewayResponse: { authCode: 'AUTH_SEPT_OK', status: 'SUCCESS' },
    });

    await Payment.create({
      invoiceId: inv2._id,
      customerId: cust2._id,
      amount: 825,
      transactionId: 'TXN-20260925-9923',
      idempotencyKey: 'IDEMP-INV10002-001',
      paymentMethod: 'CREDIT_CARD',
      status: 'SUCCESS',
      paidAt: new Date('2026-09-25'),
      gatewayResponse: { authCode: 'AUTH_CARD_OK', status: 'SUCCESS' },
    });

    // 8. Create Notifications
    await Notification.create([
      {
        customerId: cust1._id,
        userId: customerUser1._id,
        type: 'BILLING_REMINDER',
        title: 'New Invoice Generated (INV10001)',
        message: 'Your bill for period 2026-10 of ₹671 is due on 25 Oct 2026. Click to review and pay.',
        channel: 'IN_APP',
        read: false,
        metadata: { invoiceId: inv1._id },
      },
      {
        customerId: cust1._id,
        userId: customerUser1._id,
        type: 'PAYMENT_CONFIRMATION',
        title: 'Payment Received for INV10000',
        message: 'Thank you! Your payment of ₹589 via UPI has been confirmed. Transaction ID: TXN-20260920-8812.',
        channel: 'EMAIL',
        read: true,
      },
      {
        customerId: cust2._id,
        userId: customerUser2._id,
        type: 'USAGE_ALERT',
        title: 'High 5G Data Usage Notice',
        message: 'You have consumed 18.2 GB of your 25 GB monthly quota.',
        channel: 'SMS',
        read: false,
      },
    ]);

    console.log('[Seed] Seeding completed successfully!');
    console.log('[Seed] Demo Credentials:');
    console.log('       Admin:    admin@telecom.com / Password@123');
    console.log('       Support:  support@telecom.com / Password@123');
    console.log('       Customer: customer@telecom.com / Password@123 (CUST1001)');
  } catch (error) {
    console.error('[Seed] Error seeding database:', error);
  }
};

// If run directly from CLI
if (process.argv[1]?.endsWith('seed.js')) {
  import('dotenv').then((dotenv) => {
    dotenv.config();
    const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/telecom_billing';
    mongoose.connect(uri).then(async () => {
      await runSeed();
      process.exit(0);
    });
  });
}
