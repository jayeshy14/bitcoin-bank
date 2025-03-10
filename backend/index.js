import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import scheduleLiquidationMonitoring from './scheduledTasks/liquidationScheduler.js';

// Import routes
import authRoutes from './routes/auth.js';
import loanRoutes from './routes/loans.js';
import collateralRoutes from './routes/collateral.js';
import investorRoutes from './routes/investor.js';
import transactionRoutes from './routes/transactions.js';
import dashboardRoutes from './routes/dashboard.js';
import cityRoutes from "./routes/city.js";

// Configure environment variables
dotenv.config();

const startServer = async () => {
  try {
    const app = express();

    // Connect to MongoDB
    await connectDB();

    // Middleware
    app.use(cors());
    app.use(express.json());

    // API Routes
    app.use('/api/auth', authRoutes);
    app.use('/api/loans', loanRoutes);
    app.use('/api/collateral', collateralRoutes);
    app.use('/api/investor', investorRoutes);
    app.use('/api/transactions', transactionRoutes);
    app.use('/api/dashboard', dashboardRoutes);
    app.use('/api/cities', cityRoutes);

    // Start the liquidation monitoring
    scheduleLiquidationMonitoring();

    // Error handling middleware
    app.use((err, req, res, next) => {
      console.error(err.stack);
      res.status(500).json({ 
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    });

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

  } catch (error) {
    console.error('Server startup error:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  process.exit(1);
});

startServer();

