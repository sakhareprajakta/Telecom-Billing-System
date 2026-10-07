import Customer from '../models/Customer.js';
import Subscription from '../models/Subscription.js';
import Invoice from '../models/Invoice.js';
import Payment from '../models/Payment.js';
import Usage from '../models/Usage.js';
import Plan from '../models/Plan.js';

export const getDashboardStats = async (req, res, next) => {
  try {
    const isCustomer = req.user.role === 'CUSTOMER';

    if (isCustomer) {
      const customer = await Customer.findOne({ userId: req.user._id });
      if (!customer) {
        return res.status(404).json({ success: false, message: 'Customer record not found.' });
      }

      const activeSubscription = await Subscription.findOne({
        customerId: customer._id,
        status: 'ACTIVE',
      }).populate('planId');

      const invoices = await Invoice.find({ customerId: customer._id }).sort({ createdAt: -1 });
      const pendingInvoices = invoices.filter((inv) => inv.status === 'PENDING');
      const paidInvoices = invoices.filter((inv) => inv.status === 'PAID');

      const outstandingAmount = pendingInvoices.reduce((acc, curr) => acc + curr.totalAmount, 0);
      const totalPaidAmount = paidInvoices.reduce((acc, curr) => acc + curr.totalAmount, 0);

      const usageAggregation = await Usage.aggregate([
        { $match: { customerId: customer._id } },
        {
          $group: {
            _id: '$type',
            total: { $sum: '$quantity' },
          },
        },
      ]);

      const usageStats = {
        data: 0,
        voice: 0,
        sms: 0,
      };

      usageAggregation.forEach((item) => {
        if (item._id === 'DATA') usageStats.data = Math.round(item.total * 10) / 10;
        if (item._id === 'VOICE') usageStats.voice = Math.round(item.total);
        if (item._id === 'SMS') usageStats.sms = item.total;
      });

      return res.status(200).json({
        success: true,
        data: {
          customer,
          activeSubscription,
          outstandingAmount,
          totalPaidAmount,
          pendingInvoicesCount: pendingInvoices.length,
          paidInvoicesCount: paidInvoices.length,
          usageStats,
          recentInvoices: invoices.slice(0, 5),
        },
      });
    }

    // Admin / Support Dashboard
    const [
      totalCustomers,
      activeSubscriptionsCount,
      plansCount,
      invoiceAgg,
      paymentsAgg,
      usageAgg,
      recentPayments,
      recentInvoices,
    ] = await Promise.all([
      Customer.countDocuments(),
      Subscription.countDocuments({ status: 'ACTIVE' }),
      Plan.countDocuments({ status: 'ACTIVE' }),
      Invoice.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalAmount: { $sum: '$totalAmount' },
          },
        },
      ]),
      Payment.aggregate([
        { $match: { status: 'SUCCESS' } },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$amount' },
            count: { $sum: 1 },
          },
        },
      ]),
      Usage.aggregate([
        {
          $group: {
            _id: '$type',
            totalQuantity: { $sum: '$quantity' },
            count: { $sum: 1 },
          },
        },
      ]),
      Payment.find({ status: 'SUCCESS' })
        .sort({ createdAt: -1 })
        .limit(6)
        .populate({ path: 'customerId', select: 'customerCode phone userId', populate: { path: 'userId', select: 'name' } })
        .populate('invoiceId', 'invoiceNumber'),
      Invoice.find()
        .sort({ createdAt: -1 })
        .limit(6)
        .populate({ path: 'customerId', select: 'customerCode phone userId', populate: { path: 'userId', select: 'name' } }),
    ]);

    let outstandingAmount = 0;
    let pendingInvoicesCount = 0;
    let paidInvoicesCount = 0;

    invoiceAgg.forEach((group) => {
      if (group._id === 'PENDING' || group._id === 'OVERDUE') {
        outstandingAmount += group.totalAmount;
        pendingInvoicesCount += group.count;
      } else if (group._id === 'PAID') {
        paidInvoicesCount += group.count;
      }
    });

    const totalRevenue = paymentsAgg.length > 0 ? paymentsAgg[0].totalRevenue : 0;
    const totalTransactions = paymentsAgg.length > 0 ? paymentsAgg[0].count : 0;

    res.status(200).json({
      success: true,
      data: {
        totalCustomers,
        activeSubscriptionsCount,
        plansCount,
        totalRevenue,
        outstandingAmount,
        pendingInvoicesCount,
        paidInvoicesCount,
        totalTransactions,
        usageBreakdown: usageAgg,
        recentPayments,
        recentInvoices,
      },
    });
  } catch (error) {
    next(error);
  }
};
