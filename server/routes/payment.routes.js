import express from 'express';
import { makePayment, getPayments } from '../controllers/payment.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.post('/', makePayment);
router.get('/', getPayments);

export default router;
