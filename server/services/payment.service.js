import Payment from '../models/Payment.js';
import Invoice from '../models/Invoice.js';
import Customer from '../models/Customer.js';
import { createNotification } from './notification.service.js';

/**
 * Process a payment with idempotency protection and status reconciliation
 * Flow matches Page 10 of PDF specification
 */
export const processPayment = async ({
  invoiceId,
  customerId,
  amount,
  paymentMethod = 'UPI',
  idempotencyKey,
}) => {
  // 1. Idempotency Check: if request with this idempotency key was already completed, return it
  if (idempotencyKey) {
    const existingTxn = await Payment.findOne({ idempotencyKey });
    if (existingTxn) {
      console.log(`[Payment] Idempotency match hit for key: ${idempotencyKey}`);
      return {
        payment: existingTxn,
        isDuplicate: true,
        message: 'Transaction previously processed (Idempotent response).',
      };
    }
  }

  // 2. Validate Invoice
  const invoice = await Invoice.findById(invoiceId);
  if (!invoice) {
    const error = new Error('Invoice not found');
    error.statusCode = 404;
    throw error;
  }

  // 3. Check Invoice is Still Payable
  if (invoice.status === 'PAID') {
    const error = new Error('This invoice has already been paid in full.');
    error.statusCode = 409;
    throw error;
  }

  if (invoice.status === 'CANCELLED') {
    const error = new Error('Cannot make payment against a cancelled invoice.');
    error.statusCode = 400;
    throw error;
  }

  // 4. Validate Amount (Do not trust user input if mismatched)
  if (Number(amount) !== Number(invoice.totalAmount)) {
    const error = new Error(
      `Payment amount ₹${amount} does not match invoice total ₹${invoice.totalAmount}`
    );
    error.statusCode = 400;
    throw error;
  }

  // 5. Generate unique transaction identifier
  const transactionId = `TXN-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

  // 6. Simulated Payment Gateway execution (99% success rate)
  const isGatewaySuccessful = true;

  if (!isGatewaySuccessful) {
    const failedPayment = await Payment.create({
      invoiceId: invoice._id,
      customerId: invoice.customerId,
      amount,
      transactionId,
      idempotencyKey,
      paymentMethod,
      status: 'FAILED',
      gatewayResponse: { reason: 'Gateway timeout or bank decline' },
      paidAt: new Date(),
    });
    const error = new Error('Payment gateway declined the transaction.');
    error.statusCode = 400;
    error.paymentRecord = failedPayment;
    throw error;
  }

  // 7. Store Successful Payment
  const payment = await Payment.create({
    invoiceId: invoice._id,
    customerId: invoice.customerId,
    amount,
    transactionId,
    idempotencyKey,
    paymentMethod,
    status: 'SUCCESS',
    gatewayResponse: {
      authCode: 'AUTH_' + Math.random().toString(36).substring(7).toUpperCase(),
      gatewayStatus: 'CAPTURED',
      timestamp: new Date().toISOString(),
    },
    paidAt: new Date(),
  });

  // 8. Mark Invoice as PAID
  invoice.status = 'PAID';
  await invoice.save();

  // 9. Send Notification (Page 10 step: Notification)
  const customer = await Customer.findById(invoice.customerId);
  if (customer) {
    await createNotification({
      customerId: customer._id,
      userId: customer.userId,
      type: 'PAYMENT_CONFIRMATION',
      title: 'Payment Successful',
      message: `Your payment of ₹${amount} for invoice ${invoice.invoiceNumber} was processed successfully (Txn ID: ${transactionId}).`,
      channel: 'IN_APP',
      metadata: { invoiceId: invoice._id, transactionId, amount },
    });
  }

  return {
    payment,
    invoice,
    isDuplicate: false,
    message: 'Payment completed successfully.',
  };
};
