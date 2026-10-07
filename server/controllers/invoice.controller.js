import Invoice from '../models/Invoice.js';
import Customer from '../models/Customer.js';
import Payment from '../models/Payment.js';

export const getInvoices = async (req, res, next) => {
  try {
    const { customerId, status, billingPeriod, page = 1, limit = 10 } = req.query;

    const query = {};
    if (status) query.status = status;
    if (billingPeriod) query.billingPeriod = billingPeriod;

    // RBAC: Customer can only see their invoices
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

    const [invoices, total] = await Promise.all([
      Invoice.find(query)
        .populate({
          path: 'customerId',
          select: 'customerCode phone userId address',
          populate: { path: 'userId', select: 'name email' },
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Invoice.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: invoices,
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

export const getInvoiceById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const invoice = await Invoice.findById(id).populate({
      path: 'customerId',
      select: 'customerCode phone userId address accountStatus',
      populate: { path: 'userId', select: 'name email' },
    });

    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found.' });
    }

    // RBAC: Verify customer ownership
    if (req.user && req.user.role === 'CUSTOMER') {
      const ownCustomer = await Customer.findOne({ userId: req.user._id });
      if (!ownCustomer || ownCustomer._id.toString() !== invoice.customerId._id.toString()) {
        return res.status(403).json({ success: false, message: 'Access denied to this invoice.' });
      }
    }

    // Attach payments associated with this invoice
    const payments = await Payment.find({ invoiceId: invoice._id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        ...invoice.toObject(),
        payments,
      },
    });
  } catch (error) {
    next(error);
  }
};
