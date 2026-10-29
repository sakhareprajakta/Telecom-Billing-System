import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Customer from '../models/Customer.js';
import Plan from '../models/Plan.js';
import Subscription from '../models/Subscription.js';
import { validateRegistration } from '../validators/validator.js';

const generateToken = (id, role) => {
  const secret = process.env.JWT_SECRET || 'telecom_billing_secret_key_super_secure_2026';
  return jwt.sign({ id, role }, secret, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

export const register = async (req, res, next) => {
  try {
    const { name, email, password, role = 'CUSTOMER', phone, address } = req.body;

    const validationErrors = validateRegistration({ name, email, password, role });
    if (validationErrors.length > 0) {
      return res.status(400).json({ success: false, message: validationErrors.join(' ') });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
    }

    const passwordHash = await User.hashPassword(password);
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      role,
      status: 'ACTIVE',
    });

    let customer = null;
    if (role === 'CUSTOMER') {
      const count = await Customer.countDocuments();
      const customerCode = `CUST${1001 + count}`;
      customer = await Customer.create({
        userId: user._id,
        customerCode,
        phone: phone || '+1 (555) 019-2834',
        address: address || {
          street: '124 Innovation Way',
          city: 'San Jose',
          state: 'CA',
          pincode: '95112',
        },
        accountStatus: 'ACTIVE',
      });

      // Automatically assign default 5G starter plan
      const defaultPlan = (await Plan.findOne({ planCode: 'PLAN499' })) || (await Plan.findOne({ status: 'ACTIVE' }));
      if (defaultPlan) {
        await Subscription.create({
          customerId: customer._id,
          planId: defaultPlan._id,
          startDate: new Date(),
          status: 'ACTIVE',
        });
      }
    }

    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        customer: customer ? { id: customer._id, customerCode: customer.customerCode } : null,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password, requiredRole } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide both email and password.' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password credentials.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password credentials.' });
    }

    if (user.status !== 'ACTIVE') {
      return res.status(403).json({ success: false, message: 'Your account is deactivated. Contact support.' });
    }

    // Role-based Authorization: verify that user's registered role matches the login tab portal
    if (requiredRole && user.role !== requiredRole) {
      return res.status(403).json({
        success: false,
        message: `Access Denied: Your account '${user.email}' is registered as '${user.role}'. You cannot log in through the '${requiredRole}' portal. Please select the '${user.role}' tab to log in.`,
      });
    }

    const token = generateToken(user._id, user.role);

    let customer = null;
    if (user.role === 'CUSTOMER') {
      customer = await Customer.findOne({ userId: user._id });
      if (!customer) {
        const count = await Customer.countDocuments();
        customer = await Customer.create({
          userId: user._id,
          customerCode: `CUST${1001 + count}`,
          phone: '+1 (555) 019-2834',
          address: {
            street: '124 Innovation Way',
            city: 'San Jose',
            state: 'CA',
            pincode: '95112',
          },
          accountStatus: 'ACTIVE',
        });
        const defaultPlan = (await Plan.findOne({ planCode: 'PLAN499' })) || (await Plan.findOne({ status: 'ACTIVE' }));
        if (defaultPlan) {
          await Subscription.create({
            customerId: customer._id,
            planId: defaultPlan._id,
            startDate: new Date(),
            status: 'ACTIVE',
          });
        }
      }
    }

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        customer: customer ? { id: customer._id, customerCode: customer.customerCode, phone: customer.phone } : null,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = req.user;
    let customer = null;
    if (user.role === 'CUSTOMER') {
      customer = await Customer.findOne({ userId: user._id });
      if (!customer) {
        const count = await Customer.countDocuments();
        customer = await Customer.create({
          userId: user._id,
          customerCode: `CUST${1001 + count}`,
          phone: '+1 (555) 019-2834',
          address: {
            street: '124 Innovation Way',
            city: 'San Jose',
            state: 'CA',
            pincode: '95112',
          },
          accountStatus: 'ACTIVE',
        });
        const defaultPlan = (await Plan.findOne({ planCode: 'PLAN499' })) || (await Plan.findOne({ status: 'ACTIVE' }));
        if (defaultPlan) {
          await Subscription.create({
            customerId: customer._id,
            planId: defaultPlan._id,
            startDate: new Date(),
            status: 'ACTIVE',
          });
        }
      }
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        customer,
      },
    });
  } catch (error) {
    next(error);
  }
};
