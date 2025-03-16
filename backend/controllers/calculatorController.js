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

        // Ensure all values are properly typed to avoid Rust conversion errors
        const principalBtc = parseFloat(loan.principalBtc) || 0;
        const priceAtLoanTime = parseFloat(loan.priceAtLoanTime) || 0;
        const interestRate = parseFloat(loan.interestRate) || 0;
        const riskFactor = parseFloat(loan.riskFactor) || 0;
        const timeInMonths = parseInt(loan.timeInMonth) || 0;
        
        // Validate that we have all required values
        if (!principalBtc || !priceAtLoanTime || !timeInMonths) {
            return res.status(400).json({ 
                error: "Missing required loan parameters",
                details: {
                    principalBtc,
                    priceAtLoanTime,
                    interestRate,
                    riskFactor,
                    timeInMonths
                }
            });
        }

        const currentPrice = await getCryptoLatestPrice();

        try {
            const emiResult = getEmi(
                principalBtc, 
                priceAtLoanTime, 
                interestRate, 
                riskFactor, 
                timeInMonths, 
                currentPrice
            );

            const lateFeeCalculated = loan.calculateLateFee(new Date());
            
            // Return the EMI result with loan data for the frontend
            res.json({
                // EMI calculation results
                btcFixedMonthlyEmi: emiResult.btcFixedMonthlyEmi,
                btcVariableMonthlyEmi: emiResult.btcVariableMonthlyEmi,
                totalEmiInBtc: emiResult.totalEmiInBtc,
                totalEmiInUsd: emiResult.totalEmiInUsd,
                lateFeeCalculated,
                
                // Additional loan data for the frontend
                principalBtc,
                interestRate,
                loanTimeInMonths: timeInMonths,
                priceAtLoanTime,
                riskPercentage: riskFactor
            });
        } catch (rustError) {
            console.error("Rust calculation error:", rustError);
            
            // Fallback to JavaScript calculation if Rust fails
            const monthlyInterestRate = interestRate / 12 / 100;
            
            // Calculate fixed EMI (standard mortgage formula)
            const numerator = principalBtc * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, timeInMonths);
            const denominator = Math.pow(1 + monthlyInterestRate, timeInMonths) - 1;
            const fixedMonthlyEmi = denominator !== 0 ? numerator / denominator : 0;
            
            // Calculate variable EMI (based on risk factor)
            const variableMonthlyEmi = (principalBtc * (riskFactor / 100) * (currentPrice / priceAtLoanTime)) / timeInMonths;
            
            // Total EMI is the sum of fixed and variable components
            const totalEmiInBtc = fixedMonthlyEmi + variableMonthlyEmi;
            const totalEmiInUsd = totalEmiInBtc * currentPrice;
            
            res.json({
                btcFixedMonthlyEmi: fixedMonthlyEmi,
                btcVariableMonthlyEmi: variableMonthlyEmi,
                totalEmiInBtc: totalEmiInBtc,
                totalEmiInUsd: totalEmiInUsd,
                lateFeeCalculated: 0,
                
                // Additional loan data for the frontend
                principalBtc,
                interestRate,
                loanTimeInMonths: timeInMonths,
                priceAtLoanTime,
                riskPercentage: riskFactor,
                calculationMethod: "javascript-fallback"
            });
        }
    } catch (error) {
        console.error("Error calculating EMI and late fee:", error);
        res.status(500).json({ 
            error: "Internal server error", 
            message: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};
