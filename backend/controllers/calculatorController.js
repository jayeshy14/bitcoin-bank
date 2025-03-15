import pkg from "../services/rustService.cjs";

const { getEmi } = pkg;

export const getEmiData = async(req, res) => {
    try {
        const { 
            principalBtc,
            priceAtLoanTime,
            monthlyInterestRate,
            riskPercentage,
            loanTimeInMonths, 
            currentPrice } = req.body;

        const result = getEmi(principalBtc, priceAtLoanTime, monthlyInterestRate, riskPercentage, loanTimeInMonths, currentPrice);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: `internal server error: ${error}`})
    }
}