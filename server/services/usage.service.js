import Usage from '../models/Usage.js';
import Customer from '../models/Customer.js';
import Subscription from '../models/Subscription.js';

export const recordUsage = async ({
  customerIdentifier, // either ObjectId or customerCode (e.g., CUST1001)
  type,
  quantity,
  unit,
  usageDate = new Date(),
  billingPeriod,
}) => {
  // Find customer by ObjectId or customerCode
  let customer;
  if (customerIdentifier.match(/^[0-9a-fA-F]{24}$/)) {
    customer = await Customer.findById(customerIdentifier);
  } else {
    customer = await Customer.findOne({ customerCode: customerIdentifier.toUpperCase() });
  }

  if (!customer) {
    const error = new Error(`Customer '${customerIdentifier}' not found.`);
    error.statusCode = 404;
    throw error;
  }

  // Derive billing period if not provided (Format: YYYY-MM)
  const dateObj = new Date(usageDate);
  const derivedPeriod = billingPeriod || `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}`;

  // Fetch active subscription & plan to estimate potential immediate charges if any
  const subscription = await Subscription.findOne({
    customerId: customer._id,
    status: 'ACTIVE',
  }).populate('planId');

  let charge = 0;
  // If the record itself has immediate rated charging (e.g. roaming/special rates)
  // For standard usage, charge is aggregated during invoice generation

  const usageRecord = await Usage.create({
    customerId: customer._id,
    type,
    quantity: Number(quantity),
    unit,
    usageDate: dateObj,
    billingPeriod: derivedPeriod,
    charge,
    isBilled: false,
  });

  return usageRecord;
};

export const getUsageWithPagination = async ({
  customerId,
  type,
  startDate,
  endDate,
  billingPeriod,
  page = 1,
  limit = 10,
}) => {
  const query = {};
  if (customerId) query.customerId = customerId;
  if (type) query.type = type;
  if (billingPeriod) query.billingPeriod = billingPeriod;

  if (startDate || endDate) {
    query.usageDate = {};
    if (startDate) query.usageDate.$gte = new Date(startDate);
    if (endDate) query.usageDate.$lte = new Date(endDate);
  }

  const skip = (page - 1) * limit;

  const [records, total] = await Promise.all([
    Usage.find(query)
      .sort({ usageDate: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate({ path: 'customerId', select: 'customerCode phone userId', populate: { path: 'userId', select: 'name email' } }),
    Usage.countDocuments(query),
  ]);

  // Aggregation summary for efficient metrics
  const summary = await Usage.aggregate([
    { $match: query },
    {
      $group: {
        _id: '$type',
        totalQuantity: { $sum: '$quantity' },
        recordsCount: { $sum: 1 },
      },
    },
  ]);

  return {
    records,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit) || 1,
    },
    summary,
  };
};
