import { processPayment } from '../services/payment.service.js';
import Payment from '../models/Payment.js';
import Customer from '../models/Customer.js';

export const makePayment = async (req, res, next) => {
  try {
    const { invoiceId, customerId, amount, paymentMethod, idempotencyKey } = req.body;

    if (!invoiceId || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Please provide invoiceId and payment amount.',
      });
    }

    let targetCustomerId = customerId;
    if (req.user && req.user.role === 'CUSTOMER') {
      const ownCustomer = await Customer.findOne({ userId: req.user._id });
      if (!ownCustomer) {
        return res.status(404).json({ success: false, message: 'Customer record not found.' });
      }
      targetCustomerId = ownCustomer._id;
    }

    const result = await processPayment({
      invoiceId,
      customerId: targetCustomerId,
      amount: Number(amount),
      paymentMethod: paymentMethod || 'UPI',
      idempotencyKey: idempotencyKey || req.headers['idempotency-key'],
    });

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

export const getPayments = async (req, res, next) => {
  try {
    const { customerId, status, page = 1, limit = 10 } = req.query;

    const query = {};
    if (status) query.status = status;

    if (req.user && req.user.role === 'CUSTOMER') {
      const ownCustomer = await Customer.findOne({ userId: req.user._id });
      if (!ownCustomer) {
        return res.status(404).json({ success: false, message: 'Customer record not found.' });
      }
      query.customerId = ownCustomer._id;
    } else if (customerId) {
      query.customerId = customerId;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [payments, total] = await Promise.all([
      Payment.find(query)
        .populate('invoiceId', 'invoiceNumber billingPeriod totalAmount dueDate')
        .populate({
          path: 'customerId',
          select: 'customerCode phone userId',
          populate: { path: 'userId', select: 'name email' },
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Payment.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: payments,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)) || 1,
      },
    });
  } catch (error) {
    next(error);
  }
};
