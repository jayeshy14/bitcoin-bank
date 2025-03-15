import pkg from "../services/rustService.cjs";

const { simulate } = pkg;

export const runSimulator = async(req, res) => {
    try {
        const { 
            principalBtc,
            priceAtLoanTime,
            monthlyInterestRate,
            riskPercentage,
            loanTimeInMonths 
        } = req.body;

        const result = simulate(principalBtc, priceAtLoanTime, monthlyInterestRate, riskPercentage, loanTimeInMonths);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: `internal server error: ${error}`})
    }
}