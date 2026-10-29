import express from 'express';
import { logUsage, getUsage, getUsageStats, simulateTraffic } from '../controllers/usage.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.post('/', logUsage);
router.post('/simulate', simulateTraffic);
router.get('/', getUsage);
router.get('/stats', getUsageStats);

export default router;
