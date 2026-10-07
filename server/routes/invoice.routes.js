import express from 'express';
import { getInvoices, getInvoiceById } from '../controllers/invoice.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getInvoices);
router.get('/:id', getInvoiceById);

export default router;
