import express from 'express';
import { generateBill, previewBill, runBillingCycle } from '../controllers/billing.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/role.middleware.js';

const router = express.Router();

router.use(protect);

router.post('/preview', previewBill);
router.post('/generate', authorize('ADMIN'), generateBill);
router.post('/cycle', authorize('ADMIN'), runBillingCycle);

export default router;
