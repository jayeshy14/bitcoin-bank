import pkg from "../services/rustService.cjs";

const { simulate } = pkg;

export const runSimulator = async(req, res) => {
    try {
        const { params } = req.body;

        if(!params) {
            return res.status(400).json({error: "Missing required parameters"});
        }

        const {
            principalBtc,
            priceAtLoanTime,
            monthlyInterestRate,
            riskPercentage,
            loanTimeInMonths,
        } = params;

        const result = simulate(principalBtc, priceAtLoanTime, monthlyInterestRate, riskPercentage, loanTimeInMonths);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: `internal server error: ${error}`})
    }
}