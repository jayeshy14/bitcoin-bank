import Loan from "../models/loan.js";
import pkg from "../services/rustService.cjs";

const { getEmi } = pkg;

export const getEmiData = async (req, res) => {
    try {
        const loan = await Loan.findOne({ loanId: req.body.loanId }).exec();
        if (!loan) {
            return res.status(404).json({ error: "Loan not found" });
        }

        const { 
            principalBtc,
            priceAtLoanTime,
            monthlyInterestRate,
            riskPercentage,
            loanTimeInMonths, 
            currentPrice 
        } = loan;

        const emiResult = getEmi(
            principalBtc, 
            priceAtLoanTime, 
            monthlyInterestRate, 
            riskPercentage, 
            loanTimeInMonths, 
            currentPrice
        );

        const lateFeeCalculated = loan.calculateLateFee(new Date());
        res.json({ ...emiResult, lateFeeCalculated });
    } catch (error) {
        console.error("Error calculating EMI and late fee:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
