import express from 'express';
import { getDashboardStats } from '../controllers/report.controller.js';
import { getCustomerNotifications, markAsRead } from '../services/notification.service.js';
import Customer from '../models/Customer.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.get('/dashboard', getDashboardStats);

router.get('/notifications', async (req, res, next) => {
  try {
    let customerId = req.query.customerId;
    if (req.user.role === 'CUSTOMER') {
      const own = await Customer.findOne({ userId: req.user._id });
      if (own) customerId = own._id;
    }
    const notifications = await getCustomerNotifications(customerId);
    res.status(200).json({ success: true, data: notifications });
  } catch (error) {
    next(error);
  }
});

router.put('/notifications/:id/read', async (req, res, next) => {
  try {
    const updated = await markAsRead(req.params.id);
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
});

export default router;
