
const { callSimulate, callCalculateEmi } = require("../sbtc_loan__rust_simulator.node");

const simulate = (principalBtc, priceAtLoanTime, monthlyInterestRate, riskPercentage, loanTimeInMonths) => {
    const result = callSimulate(principalBtc, priceAtLoanTime, monthlyInterestRate, riskPercentage, loanTimeInMonths);
    console.log(result);
    return result
}

const getEmi = (principalBtc, priceAtLoanTime, monthlyInterestRate, riskPercentage, loanTimeInMonths, currentPrice) => {
    const result = callCalculateEmi(principalBtc, priceAtLoanTime, monthlyInterestRate, riskPercentage, loanTimeInMonths, currentPrice)
    return result
}

module.exports = {simulate, getEmi};