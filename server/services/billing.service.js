import Invoice from '../models/Invoice.js';
import Subscription from '../models/Subscription.js';
import Usage from '../models/Usage.js';
import Customer from '../models/Customer.js';
import Plan from '../models/Plan.js';

/**
 * Generates an invoice based on subscription and usage records
 * Follows the exact formula and flow from PDF Pages 8-9:
 * Final Amount = Base Plan Price + Extra Data Charge + Extra SMS Charge - Discounts + Taxes
 */
export const calculateAndGenerateInvoice = async ({ customerId, billingPeriod, discount = 50 }) => {
  // 1. Find Customer
  const customer = await Customer.findById(customerId).populate('userId');
  if (!customer) {
    throw new Error('Customer not found');
  }

  // 2. Find Active Subscription
  const subscription = await Subscription.findOne({
    customerId,
    status: 'ACTIVE',
  }).populate('planId');

  if (!subscription) {
    throw new Error(`No active subscription found for customer ${customer.customerCode}`);
  }

  const plan = subscription.planId;
  if (!plan) {
    throw new Error('Subscription plan details missing');
  }

  // Check if invoice already exists for this billing period
  const existingInvoice = await Invoice.findOne({
    customerId,
    billingPeriod,
  });

  if (existingInvoice && existingInvoice.status !== 'CANCELLED') {
    return existingInvoice;
  }

  // 3. Get Usage Records for Billing Period
  const usageRecords = await Usage.find({
    customerId,
    billingPeriod,
  });

  // Aggregate Data Usage (GB) and SMS Usage
  let actualDataGB = 0;
  let actualSms = 0;

  for (const record of usageRecords) {
    if (record.type === 'DATA') {
      if (record.unit === 'MB') {
        actualDataGB += record.quantity / 1024;
      } else {
        actualDataGB += record.quantity;
      }
    } else if (record.type === 'SMS') {
      actualSms += record.quantity;
    }
  }

  actualDataGB = Math.round(actualDataGB * 10) / 10; // 1 decimal place

  // 4. Calculate Included vs Extra Usage (Page 8-9)
  const includedDataGB = plan.includedData || 0;
  const extraDataGB = Math.max(0, actualDataGB - includedDataGB);
  const dataRatePerGB = plan.dataOverageRate || 50;
  const dataCharge = Math.round(extraDataGB * dataRatePerGB);

  const includedSms = plan.includedSms || 100;
  const extraSms = Math.max(0, actualSms - includedSms);
  const smsRate = plan.smsOverageRate || 1;
  const smsCharge = Math.round(extraSms * smsRate);

  const usageAmount = dataCharge + smsCharge;
  const baseAmount = plan.monthlyPrice;

  // 5. Apply Discounts & Calculate Taxes (18% GST standard telecom rate)
  const subTotalBeforeTax = Math.max(0, baseAmount + usageAmount - discount);
  const taxRate = 0.18;
  const tax = Math.round(subTotalBeforeTax * taxRate);
  const totalAmount = subTotalBeforeTax + tax;

  // 6. Generate Invoice Number (e.g., INV10001)
  const count = await Invoice.countDocuments();
  const invoiceNumber = `INV${10001 + count}`;

  // Due date = 15 days from now
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 15);

  // 7. Create Invoice
  const invoice = await Invoice.create({
    invoiceNumber,
    customerId,
    billingPeriod,
    baseAmount,
    usageAmount,
    dataCharge,
    smsCharge,
    discount,
    tax,
    totalAmount,
    status: 'PENDING',
    dueDate,
    generatedDate: new Date(),
    details: {
      planName: plan.name,
      includedDataGB,
      actualDataGB,
      extraDataGB,
      dataRatePerGB,
      includedSms,
      actualSms,
      extraSms,
      taxRate,
    },
  });

  // Mark usage records as billed
  await Usage.updateMany(
    { customerId, billingPeriod, isBilled: false },
    { $set: { isBilled: true } }
  );

  return invoice;
};

/**
 * Preview / estimate upcoming bill calculation without saving invoice
 */
export const previewBilling = async ({ customerId, billingPeriod }) => {
  const customer = await Customer.findById(customerId);
  if (!customer) throw new Error('Customer not found');

  const subscription = await Subscription.findOne({ customerId, status: 'ACTIVE' }).populate('planId');
  if (!subscription) throw new Error('No active subscription found');

  const plan = subscription.planId;
  const usageRecords = await Usage.find({ customerId, billingPeriod });

  let actualDataGB = 0;
  let actualSms = 0;
  let actualVoiceMins = 0;

  for (const record of usageRecords) {
    if (record.type === 'DATA') {
      actualDataGB += record.unit === 'MB' ? record.quantity / 1024 : record.quantity;
    } else if (record.type === 'SMS') {
      actualSms += record.quantity;
    } else if (record.type === 'VOICE') {
      actualVoiceMins += record.quantity;
    }
  }

  actualDataGB = Math.round(actualDataGB * 10) / 10;
  const extraDataGB = Math.max(0, actualDataGB - plan.includedData);
  const dataCharge = Math.round(extraDataGB * (plan.dataOverageRate || 50));
  const extraSms = Math.max(0, actualSms - (plan.includedSms || 100));
  const smsCharge = Math.round(extraSms * (plan.smsOverageRate || 1));
  const baseAmount = plan.monthlyPrice;
  const discount = 50;
  const subTotal = Math.max(0, baseAmount + dataCharge + smsCharge - discount);
  const tax = Math.round(subTotal * 0.18);
  const totalAmount = subTotal + tax;

  return {
    plan,
    usage: { actualDataGB, extraDataGB, actualSms, extraSms, actualVoiceMins },
    pricing: {
      baseAmount,
      dataCharge,
      smsCharge,
      usageAmount: dataCharge + smsCharge,
      discount,
      tax,
      totalAmount,
    },
  };
};
