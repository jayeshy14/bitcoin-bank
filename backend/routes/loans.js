import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import { 
  createLoanApplication, 
  getLoanDetails,
  getMyLoans,
  approveLoan,
  rejectLoan,
  makeLoanPayment
} from '../controllers/loanController.js';

const router = express.Router();

// Protect all routes
router.use(protect);

// Borrower routes
router.post('/apply', createLoanApplication);
router.get('/my-loans', getMyLoans);
router.post('/:id/payment', makeLoanPayment);

// Admin routes
router.put('/:id/approve', authorize('admin'), approveLoan);
router.put('/:id/reject', authorize('admin'), rejectLoan);

// Common routes
router.get('/:id', getLoanDetails);

export default router;