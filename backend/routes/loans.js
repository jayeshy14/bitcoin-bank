import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import { createLoanApplication, getMyPendingApplications, getPendingApplications, getUserWalletAddress, getMyActiveLoans, getMyClosedLoans } from '../controllers/loanApplicationController.js';
import { getEmiData } from '../controllers/calculatorController.js';
import { runSimulator } from '../controllers/simulatorController.js';

const router = express.Router();

// Protect all routes
router.use(protect);

// Borrower routes
router.post('/apply', createLoanApplication);
router.get('/my-applications', getMyPendingApplications);
router.get('/investment-opportunities', getPendingApplications);
router.get('/my-active-loans', getMyActiveLoans);
router.get('/my-closed-loans', getMyClosedLoans);

//calculator
router.post("/calculate_emi/:id", getEmiData)

//simulator
router.post("/simulate_loan", runSimulator)

router.get("/get_wallet_address", getUserWalletAddress)

export default router;