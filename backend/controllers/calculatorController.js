import pkg from "../services/rustService.cjs";

const { getEmi } = pkg;

export const getEmiData = async(req, res) => {
    try {
        const { params, currentPrice } = req.body;

        if(!params || currentPrice === undefined) {
            return res.status(400).json({error: "Missing required parameters"});
        }

        const {
            principalBtc,
            priceAtLoanTime,
            monthlyInterestRate,
            riskPercentage,
            loanTimeInMonths,
        } = params;

        const result = getEmi(principalBtc, priceAtLoanTime, monthlyInterestRate, riskPercentage, loanTimeInMonths, currentPrice);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: `internal server error: ${error}`})
    }
}