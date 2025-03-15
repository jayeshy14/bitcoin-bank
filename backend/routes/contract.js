import express from "express";
import { protect } from "../middleware/auth.js";
import { closeLoan, deposit, getBalance, getByLoanId, getOffChainBalance, getOnChainBalance, getTotalLoanId, issueLoan, openLoan, repay, withdraw } from "../controllers/contractController.js";

const router = express.Router();

router.use(protect);

//contract call routes
router.post('/deposit', deposit);
router.post('/issueLoan', issueLoan);
router.post('/withdraw', withdraw);
router.post('/repay', repay);
router.post('/closeLoan', closeLoan);
router.post('/openLoan', openLoan);



// contract read-only routes
router.get("/getByLoanId", getByLoanId);
router.get("/getTotalLoanId", getTotalLoanId);
router.get("/getOffChainBalance", getOffChainBalance);
router.get("/getOnChainBalance", getOnChainBalance);
router.get("/getBalance", getBalance);


export default router;