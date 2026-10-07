import express from 'express';
import {
  getCustomers,
  getCustomerById,
  updateCustomerStatus,
} from '../controllers/customer.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/role.middleware.js';

const router = express.Router();

router.use(protect);

router.get('/', authorize('ADMIN', 'SUPPORT'), getCustomers);
router.get('/:id', getCustomerById);
router.put('/:id', authorize('ADMIN', 'SUPPORT'), updateCustomerStatus);

export default router;
