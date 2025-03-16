import Loan from "../models/loan.js";
import pkg from "../services/rustService.cjs";
import { getCryptoLatestPrice } from "../services/valuationService.js";

const { getEmi } = pkg;

export const getEmiData = async (req, res) => {
    try {
        const loan = await Loan.findById(req.params.id);
        if (!loan) {
            return res.status(404).json({ error: "Loan not found" });
        }

        const { 
            principalBtc,
            priceAtLoanTime,
            interestRate,
            riskFactor,
            timeInMonths, 
        } = loan;

        const currentPrice = await getCryptoLatestPrice();

        const emiResult = getEmi(
            principalBtc, 
            priceAtLoanTime, 
            interestRate, 
            riskFactor, 
            timeInMonths, 
            currentPrice
        );

        const lateFeeCalculated = loan.calculateLateFee(new Date());
        res.json({ ...emiResult, lateFeeCalculated });
    } catch (error) {
        console.error("Error calculating EMI and late fee:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
