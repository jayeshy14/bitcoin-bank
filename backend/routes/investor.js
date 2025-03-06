import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  getInvestmentOpportunities,
  investInLoan,
  getMyInvestments,
  withdrawInvestment
} from '../controllers/investorController.js';

const router = express.Router();

// Protect all routes and ensure investor role
router.use(protect);
router.use(authorize('investor'));

router.get('/opportunities', getInvestmentOpportunities);
router.post('/invest/:loanId', investInLoan);
router.get('/my-investments', getMyInvestments);
router.post('/withdraw/:loanId', withdrawInvestment);

export default router; 