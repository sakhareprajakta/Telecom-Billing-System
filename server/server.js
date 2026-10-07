import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import connectDB from './config/database.js';
import { autoSeedIfEmpty } from './utils/seed.js';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    console.log('[Server] Database connection established.');

    // Auto seed initial data if empty
    await autoSeedIfEmpty();

    app.listen(PORT, () => {
      console.log(`=======================================================`);
      console.log(`  Telecom Billing System API Server Running on port ${PORT}`);
      console.log(`  URL: http://localhost:${PORT}`);
      console.log(`  Health Check: http://localhost:${PORT}/api/health`);
      console.log(`=======================================================`);
    });
  } catch (error) {
    console.error('[Server] Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
