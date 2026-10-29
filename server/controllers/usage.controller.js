import { recordUsage, getUsageWithPagination } from '../services/usage.service.js';
import Customer from '../models/Customer.js';
import Usage from '../models/Usage.js';

export const logUsage = async (req, res, next) => {
  try {
    const { customerId, customerCode, type, quantity, unit, usageDate, billingPeriod } = req.body;

    const identifier = customerId || customerCode;
    if (!identifier || !type || quantity === undefined || !unit) {
      return res.status(400).json({
        success: false,
        message: 'Missing required CDR fields: customerId or customerCode, type (DATA|VOICE|SMS), quantity, unit.',
      });
    }

    const usageRecord = await recordUsage({
      customerIdentifier: identifier,
      type,
      quantity,
      unit,
      usageDate,
      billingPeriod,
    });

    res.status(201).json({
      success: true,
      message: 'Usage record logged successfully.',
      data: usageRecord,
    });
  } catch (error) {
    next(error);
  }
};

export const getUsage = async (req, res, next) => {
  try {
    const { customerId, type, startDate, endDate, billingPeriod, page, limit } = req.query;

    let targetCustomerId = customerId;
    // If authenticated as CUSTOMER, lock to their customer ID
    if (req.user && req.user.role === 'CUSTOMER') {
      const ownCustomer = await Customer.findOne({ userId: req.user._id });
      if (!ownCustomer) {
        return res.status(404).json({ success: false, message: 'Customer record not found.' });
      }
      targetCustomerId = ownCustomer._id;
    }

    const result = await getUsageWithPagination({
      customerId: targetCustomerId,
      type,
      startDate,
      endDate,
      billingPeriod,
      page,
      limit,
    });

    res.status(200).json({
      success: true,
      data: result.records,
      pagination: result.pagination,
      summary: result.summary,
    });
  } catch (error) {
    next(error);
  }
};

export const getUsageStats = async (req, res, next) => {
  try {
    let customerId = req.query.customerId;
    if (req.user && req.user.role === 'CUSTOMER') {
      const own = await Customer.findOne({ userId: req.user._id });
      if (own) customerId = own._id;
    }

    const matchQuery = customerId ? { customerId: customerId } : {};

    const stats = await Usage.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: { type: '$type', period: '$billingPeriod' },
          total: { $sum: '$quantity' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.period': -1 } },
    ]);

    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
};

export const simulateTraffic = async (req, res, next) => {
  try {
    const { customerId, customerCode } = req.body;
    let customer;
    if (customerId) {
      customer = await Customer.findById(customerId);
    } else if (customerCode) {
      customer = await Customer.findOne({ customerCode: customerCode.toUpperCase() });
    } else if (req.user && req.user.role === 'CUSTOMER') {
      customer = await Customer.findOne({ userId: req.user._id });
    } else {
      customer = await Customer.findOne({ customerCode: 'CUST1001' });
    }

    if (!customer) {
      return res.status(404).json({ success: false, message: 'Subscriber not found.' });
    }

    const currentPeriod = '2026-10';

    const sampleEvents = [
      { type: 'DATA', quantity: Number((Math.random() * 1.8 + 0.4).toFixed(1)), unit: 'GB' },
      { type: 'VOICE', quantity: Math.floor(Math.random() * 35 + 5), unit: 'MINS' },
      { type: 'SMS', quantity: Math.floor(Math.random() * 10 + 2), unit: 'SMS' },
    ];

    const inserted = [];
    for (const ev of sampleEvents) {
      const rec = await Usage.create({
        customerId: customer._id,
        type: ev.type,
        quantity: ev.quantity,
        unit: ev.unit,
        usageDate: new Date(),
        billingPeriod: currentPeriod,
        charge: 0,
        isBilled: false,
      });
      inserted.push(rec);
    }

    res.status(201).json({
      success: true,
      message: `Simulated ${inserted.length} real-time telecom network events for ${customer.customerCode}.`,
      data: inserted,
    });
  } catch (error) {
    next(error);
  }
};
