import express from 'express';
import {
  getPlans,
  createPlan,
  updatePlan,
  subscribeCustomerToPlan,
} from '../controllers/plan.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/role.middleware.js';

const router = express.Router();

router.get('/', getPlans);

router.post('/', protect, authorize('ADMIN'), createPlan);
router.put('/:id', protect, authorize('ADMIN'), updatePlan);
router.post('/subscribe', protect, subscribeCustomerToPlan);

export default router;
