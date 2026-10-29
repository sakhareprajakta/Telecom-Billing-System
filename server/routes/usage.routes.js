import express from 'express';
import { logUsage, getUsage, getUsageStats, simulateTraffic } from '../controllers/usage.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/role.middleware.js';

const router = express.Router();

router.use(protect);

router.post('/', authorize('ADMIN'), logUsage);
router.post('/simulate', authorize('ADMIN'), simulateTraffic);
router.get('/', getUsage);
router.get('/stats', getUsageStats);

export default router;
