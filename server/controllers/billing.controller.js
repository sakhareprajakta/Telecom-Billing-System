import { calculateAndGenerateInvoice, previewBilling } from '../services/billing.service.js';
import Subscription from '../models/Subscription.js';
import Customer from '../models/Customer.js';

export const generateBill = async (req, res, next) => {
  try {
    const { customerId, billingPeriod, discount } = req.body;

    if (!customerId || !billingPeriod) {
      return res.status(400).json({
        success: false,
        message: 'Please provide customerId and billingPeriod (e.g., 2026-10).',
      });
    }

    const invoice = await calculateAndGenerateInvoice({
      customerId,
      billingPeriod,
      discount: discount !== undefined ? Number(discount) : 50,
    });

    res.status(201).json({
      success: true,
      message: `Invoice ${invoice.invoiceNumber} generated successfully.`,
      data: invoice,
    });
  } catch (error) {
    next(error);
  }
};

export const previewBill = async (req, res, next) => {
  try {
    const { customerId, billingPeriod } = req.body;

    let targetId = customerId;
    if (req.user && req.user.role === 'CUSTOMER') {
      const ownCustomer = await Customer.findOne({ userId: req.user._id });
      if (ownCustomer) targetId = ownCustomer._id;
    }

    if (!targetId || !billingPeriod) {
      return res.status(400).json({
        success: false,
        message: 'Please provide customerId and billingPeriod.',
      });
    }

    const preview = await previewBilling({ customerId: targetId, billingPeriod });
    res.status(200).json({ success: true, data: preview });
  } catch (error) {
    next(error);
  }
};

export const runBillingCycle = async (req, res, next) => {
  try {
    const { billingPeriod } = req.body;
    const period = billingPeriod || `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;

    // Find all active subscriptions
    const activeSubscriptions = await Subscription.find({ status: 'ACTIVE' });
    const generatedInvoices = [];
    const errors = [];

    for (const sub of activeSubscriptions) {
      try {
        const invoice = await calculateAndGenerateInvoice({
          customerId: sub.customerId,
          billingPeriod: period,
          discount: 50,
        });
        generatedInvoices.push(invoice);
      } catch (err) {
        errors.push({ customerId: sub.customerId, error: err.message });
      }
    }

    res.status(200).json({
      success: true,
      message: `Billing cycle completed for period ${period}. Generated ${generatedInvoices.length} invoices.`,
      generatedCount: generatedInvoices.length,
      errorsCount: errors.length,
      data: generatedInvoices,
      errors,
    });
  } catch (error) {
    next(error);
  }
};
