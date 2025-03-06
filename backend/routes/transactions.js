import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  getMyTransactions,
  getTransactionDetails,
  updateTransactionStatus
} from '../controllers/transactionController.js';

const router = express.Router();

// Protect all routes
router.use(protect);

// User routes
router.get('/my-transactions', getMyTransactions);
router.get('/:id', getTransactionDetails);

// Admin routes
router.put('/:id/status', authorize('admin'), updateTransactionStatus);

export default router; 