import Customer from '../models/Customer.js';
import User from '../models/User.js';
import Subscription from '../models/Subscription.js';
import Invoice from '../models/Invoice.js';
import Usage from '../models/Usage.js';
import { validateCustomer } from '../validators/validator.js';

export const getCustomers = async (req, res, next) => {
  try {
    const { search, status, page = 1, limit = 10 } = req.query;

    const query = {};
    if (status) {
      query.accountStatus = status;
    }

    if (search) {
      // Find matching users first
      const matchingUsers = await User.find({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ],
      }).select('_id');

      const userIds = matchingUsers.map((u) => u._id);

      query.$or = [
        { customerCode: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { userId: { $in: userIds } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [customers, total] = await Promise.all([
      Customer.find(query)
        .populate('userId', 'name email role status')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Customer.countDocuments(query),
    ]);

    // Attach active subscription to each customer
    const customersWithSubs = await Promise.all(
      customers.map(async (c) => {
        const sub = await Subscription.findOne({ customerId: c._id, status: 'ACTIVE' }).populate('planId');
        return {
          ...c.toObject(),
          activeSubscription: sub,
        };
      })
    );

    res.status(200).json({
      success: true,
      data: customersWithSubs,
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

export const getCustomerById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const query = id.match(/^[0-9a-fA-F]{24}$/) ? { _id: id } : { customerCode: id.toUpperCase() };
    const customer = await Customer.findOne(query).populate('userId', 'name email role status');
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer record not found.' });
    }

    // RBAC check: Customers can only fetch their own profile unless ADMIN or SUPPORT
    if (req.user.role === 'CUSTOMER') {
      const ownCustomer = await Customer.findOne({ userId: req.user._id });
      if (!ownCustomer || ownCustomer._id.toString() !== customer._id.toString()) {
        return res.status(403).json({ success: false, message: 'You are not authorized to view other customer records.' });
      }
    }

    // Active subscription
    const subscription = await Subscription.findOne({ customerId: customer._id, status: 'ACTIVE' }).populate('planId');

    // Recent invoices
    const invoices = await Invoice.find({ customerId: customer._id }).sort({ createdAt: -1 }).limit(5);

    // Recent usage
    const recentUsage = await Usage.find({ customerId: customer._id }).sort({ usageDate: -1 }).limit(10);

    res.status(200).json({
      success: true,
      data: {
        customer,
        subscription,
        invoices,
        recentUsage,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateCustomerStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { accountStatus, phone, address } = req.body;

    const customer = await Customer.findById(id);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found.' });
    }

    if (accountStatus) customer.accountStatus = accountStatus;
    if (phone) customer.phone = phone;
    if (address) customer.address = { ...customer.address, ...address };

    await customer.save();

    res.status(200).json({
      success: true,
      message: 'Customer details updated successfully',
      data: customer,
    });
  } catch (error) {
    next(error);
  }
};
