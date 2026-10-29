import Plan from '../models/Plan.js';
import Subscription from '../models/Subscription.js';
import Customer from '../models/Customer.js';

export const getPlans = async (req, res, next) => {
  try {
    const plans = await Plan.find({ status: { $ne: 'ARCHIVED' } }).sort({ monthlyPrice: 1 });
    res.status(200).json({ success: true, data: plans });
  } catch (error) {
    next(error);
  }
};

export const createPlan = async (req, res, next) => {
  try {
    const { name, planCode, monthlyPrice, includedData, includedSms, callPolicy, dataOverageRate, smsOverageRate, speed, description } = req.body;

    if (!name || !planCode || monthlyPrice === undefined || includedData === undefined) {
      return res.status(400).json({ success: false, message: 'Please provide name, planCode, monthlyPrice, and includedData.' });
    }

    const existing = await Plan.findOne({ planCode: planCode.toUpperCase().trim() });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Plan with this plan code already exists.' });
    }

    const plan = await Plan.create({
      name,
      planCode: planCode.toUpperCase().trim(),
      monthlyPrice: Number(monthlyPrice),
      includedData: Number(includedData),
      includedSms: Number(includedSms || 100),
      callPolicy: callPolicy || 'Unlimited Local + STD Calls',
      dataOverageRate: Number(dataOverageRate || 50),
      smsOverageRate: Number(smsOverageRate || 1),
      speed: speed || '5G Speed',
      description,
      status: 'ACTIVE',
    });

    res.status(201).json({ success: true, message: 'Plan created successfully', data: plan });
  } catch (error) {
    next(error);
  }
};

export const updatePlan = async (req, res, next) => {
  try {
    const { id } = req.params;
    const plan = await Plan.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Plan not found.' });
    }
    res.status(200).json({ success: true, message: 'Plan updated', data: plan });
  } catch (error) {
    next(error);
  }
};

export const subscribeCustomerToPlan = async (req, res, next) => {
  try {
    let { customerId, planId } = req.body;

    if (req.user && req.user.role === 'CUSTOMER') {
      const ownCustomer = await Customer.findOne({ userId: req.user._id });
      if (!ownCustomer) {
        return res.status(404).json({ success: false, message: 'Customer record not found.' });
      }
      customerId = ownCustomer._id;
    }

    const [customer, plan] = await Promise.all([
      Customer.findById(customerId),
      Plan.findById(planId),
    ]);

    if (!customer) return res.status(404).json({ success: false, message: 'Customer not found.' });
    if (!plan) return res.status(404).json({ success: false, message: 'Plan not found.' });

    // Mark previous active subscriptions as UPGRADED or CANCELLED
    await Subscription.updateMany(
      { customerId: customer._id, status: 'ACTIVE' },
      { $set: { status: 'UPGRADED', endDate: new Date() } }
    );

    // Create new active subscription
    const subscription = await Subscription.create({
      customerId: customer._id,
      planId: plan._id,
      startDate: new Date(),
      status: 'ACTIVE',
    });

    res.status(201).json({
      success: true,
      message: `Subscribed ${customer.customerCode} to ${plan.name} successfully.`,
      data: subscription,
    });
  } catch (error) {
    next(error);
  }
};
