import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/auth.routes.js';
import customerRoutes from './routes/customer.routes.js';
import planRoutes from './routes/plan.routes.js';
import usageRoutes from './routes/usage.routes.js';
import billingRoutes from './routes/billing.routes.js';
import invoiceRoutes from './routes/invoice.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import reportRoutes from './routes/report.routes.js';
import { errorMiddleware } from './middleware/error.middleware.js';

const app = express();

// Core Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Telecom Billing & Customer Management System API',
  });
});

// Main Feature Routes (Page 5 & 6)
app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/usage', usageRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reports', reportRoutes);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve compiled React frontend in production
const clientDist = path.join(__dirname, '../client/dist');
app.use(express.static(clientDist));

// Catch-all handler: for API routes return 404 JSON, for page routes return React index.html
app.get('*', (req, res, next) => {
  if (req.originalUrl.startsWith('/api')) {
    return res.status(404).json({
      success: false,
      statusCode: 404,
      message: `API route not found: ${req.method} ${req.originalUrl}`,
    });
  }
  res.sendFile(path.join(clientDist, 'index.html'));
});

// Centralized Error Handling Middleware (Page 11)
app.use(errorMiddleware);

export default app;
