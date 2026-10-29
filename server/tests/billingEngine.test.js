import assert from 'node:assert';
import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import connectDB from '../config/database.js';
import User from '../models/User.js';
import Customer from '../models/Customer.js';
import Plan from '../models/Plan.js';
import Subscription from '../models/Subscription.js';
import Usage from '../models/Usage.js';
import Invoice from '../models/Invoice.js';
import Payment from '../models/Payment.js';
import { calculateAndGenerateInvoice, previewBilling } from '../services/billing.service.js';
import { processPayment } from '../services/payment.service.js';

const runTests = async () => {
  console.log('========================================================');
  console.log('  RUNNING TELECOM BILLING ENGINE & IDEMPOTENCY TEST SUITE');
  console.log('========================================================\n');

  await connectDB();

  let testCustomerId = null;
  let testInvoiceId = null;

  try {
    // 1. Verify Database has test customer CUST1001
    const customer = await Customer.findOne({ customerCode: 'CUST1001' }).populate('userId');
    assert(customer, 'Test customer CUST1001 must exist in database');
    testCustomerId = customer._id;
    console.log(`[PASS] Test customer found: ${customer.customerCode} (${customer.userId?.name})`);

    // 2. Test Preview Billing Calculation Formula (PDF Pages 8-9)
    const preview = await previewBilling({
      customerId: testCustomerId,
      billingPeriod: '2026-10',
    });

    console.log('[INFO] Calculated Billing Breakdown:');
    console.log(`       Base Plan Rental:    ₹${preview.pricing.baseAmount}`);
    console.log(`       Excess Data Charge:  ₹${preview.pricing.dataCharge} (${preview.usage.extraDataGB} GB excess @ ₹${preview.plan.dataOverageRate}/GB)`);
    console.log(`       Excess SMS Charge:   ₹${preview.pricing.smsCharge}`);
    console.log(`       Discount Applied:   -₹${preview.pricing.discount}`);
    console.log(`       Taxes (GST 18%):     ₹${preview.pricing.tax}`);
    console.log(`       Final Total Amount:  ₹${preview.pricing.totalAmount}`);

    // Verify exact values matching PDF Pages 8-9
    assert.strictEqual(preview.pricing.baseAmount, 499, 'Base plan must be ₹499');
    assert.strictEqual(preview.pricing.dataCharge, 100, 'Data charge for 2GB overage must be ₹100');
    assert.strictEqual(preview.pricing.smsCharge, 20, 'SMS charge for 20 excess SMS must be ₹20');
    assert.strictEqual(preview.pricing.discount, 50, 'Promotional discount must be ₹50');
    assert.strictEqual(preview.pricing.tax, 102, 'Taxes (18%) must be ₹102');
    assert.strictEqual(preview.pricing.totalAmount, 671, 'Final Total must exactly equal ₹671 as in PDF Page 8-9');
    console.log('[PASS] Formula Verification: 499 + 100 + 20 - 50 + 102 = ₹671 (Exact Match!)');

    // 3. Test Invoice Retrieval via Number or Customer Code (PDF Page 10 Section 22)
    const existingInvoice = await Invoice.findOne({ customerId: testCustomerId, billingPeriod: '2026-10' });
    assert(existingInvoice, 'Invoice INV10001 must exist for 2026-10');
    assert.strictEqual(existingInvoice.totalAmount, 671, 'Stored invoice amount must equal 671');
    testInvoiceId = existingInvoice._id;
    console.log(`[PASS] Stored Invoice #${existingInvoice.invoiceNumber} verified with status: ${existingInvoice.status}`);

    // 4. Test Payment Idempotency (PDF Page 10)
    const idempotencyKey = `TEST-IDEMP-${Date.now()}`;
    
    // Simulate first payment attempt
    // Note: If invoice was already marked PAID, let's create a temporary test invoice to verify fresh checkout
    const tempInv = await Invoice.create({
      invoiceNumber: `TEST-${Date.now()}`,
      customerId: testCustomerId,
      billingPeriod: '2026-12',
      baseAmount: 499,
      usageAmount: 100,
      dataCharge: 100,
      smsCharge: 0,
      discount: 0,
      tax: 108,
      totalAmount: 707,
      status: 'PENDING',
      dueDate: new Date(),
    });

    const payment1 = await processPayment({
      invoiceId: tempInv._id,
      customerId: testCustomerId,
      amount: 707,
      paymentMethod: 'UPI',
      idempotencyKey,
    });

    assert.strictEqual(payment1.isDuplicate, false, 'First payment must be fresh transaction');
    assert.strictEqual(payment1.invoice.status, 'PAID', 'Invoice must be updated to PAID status');
    console.log(`[PASS] First payment attempt succeeded: Txn ID ${payment1.payment.transactionId}`);

    // Immediate retry with the EXACT same idempotency key (Page 10 duplicate test)
    const payment2 = await processPayment({
      invoiceId: tempInv._id,
      customerId: testCustomerId,
      amount: 707,
      paymentMethod: 'UPI',
      idempotencyKey,
    });

    assert.strictEqual(payment2.isDuplicate, true, 'Second payment with same idempotency key must return isDuplicate: true');
    assert.strictEqual(payment2.payment.transactionId, payment1.payment.transactionId, 'Transaction ID must match original');
    console.log('[PASS] Idempotency Shield Active: Duplicate retry safely returned original transaction without double-charging!');

    // Cleanup temp test invoice and payment
    await Promise.all([
      Invoice.findByIdAndDelete(tempInv._id),
      Payment.findByIdAndDelete(payment1.payment._id),
    ]);

    console.log('\n========================================================');
    console.log('  ALL 4 TEST SCENARIOS PASSED WITH ZERO FAILURES!        ');
    console.log('========================================================\n');
    process.exit(0);
  } catch (err) {
    console.error('\n[FAIL] Test assertion error:', err.message);
    if (err.stack) console.error(err.stack);
    process.exit(1);
  }
};

runTests();
