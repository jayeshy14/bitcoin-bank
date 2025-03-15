import axios from "axios";

const API = "http://localhost:3000/api/contracts/"

export const depositAPI = async (amount) => {
    try {

        const response = await axios.post(`${API}deposit`, {
            amount: amount
        })
        return response.data;
    } catch (e) {
        console.error("Deposit error:", e);
        throw e.response?.data?.error || "An error occurred";
    }
}


//borrower, amount, interestRate, loanType, priceAtLoanTime, riskFactor, timeInMonth, collateralType, collateralValue, collateralId
export const issueLoanAPI = async (LoanData) => {
    try {
        console.log("Sending Loan data: ", LoanData);
        const response = await axios.post(`${API}issueLoan`, LoanData);
        return response.data;
    } catch (error) {
        console.error("Issue loan error:", error);
        throw error.response?.data?.error || "An error occurred";
    }
};


export const withdrawAPI = async (to, amount) => {
    try {
        const response = await axios.post(`${API}withdraw`, { 
            to,
            amount });
        return response.data;
    } catch (e) {
        console.error("Withdraw error:", e);
        throw e.response?.data?.error || "An error occured";
    }
}

// loanID, currentPrice, amountInBTC

export const repayLoanAPI = async (RepayData) => {
    try {
        console.log("Sending Repay data: ", RepayData);
        const response = await axios.post(`${API}repay`, RepayData);
        return response.data;
    } catch (error) {
        console.error("Repay loan error:", error);
        throw error.response?.data?.error || "An error occurred";
    }
};

export const closeLoanAPI = async (loanId) => {
    try {
        const response = await axios.post(`${API}closeLoan`, { loanId });
        return response.data;
    } catch (error) {
        console.error("Close loan error:", error);
        throw error.response?.data?.error || "An error occurred";
    }
};

export const openLoanAPI = async (loanId) => {
    try {
        const response = await axios.post(`${API}openLoan`, { loanId });
        return response.data;
    } catch (error) {
        console.error("Open loan error:", error);
        throw error.response?.data?.error || "An error occurred";
    }
};


export const getByLoanIdAPI = async (loanId) => {
    try {
        const response = await axios.get(`${API}getByLoanId`, { loanId });
        return response.data;
    } catch (error) {
        console.error("Get loan by ID error:", error);
        throw error.response?.data?.error || "An error occurred";
    }
};

export const getTotalLoanIdAPI = async () => {
    try {
        const response = await axios.get(`${API}getTotalLoanId`);
        return response.data;
    } catch (error) {
        console.error("Get total loan ID error:", error);
        throw error.response?.data?.error || "An error occurred";
    }
};

export const getOffChainBalanceAPI = async () => {
    try {
        const response = await axios.get(`${API}getOffChainBalance`, {
            headers: {Authorization: `Bearer ${localStorage.getItem("token")}`}
        });
        return response.data;
    } catch (error) {
        console.error("Get off-chain balance error:", error);
        throw error.response?.data?.error || "An error occurred";
    }
};

export const getOnChainBalanceAPI = async () => {
    try {
        const response = await axios.get(`${API}getOnChainBalance`, {
            headers: {Authorization: `Bearer ${localStorage.getItem("token")}`}
        });
        return response.data;
    } catch (error) {
        console.error("Get on-chain balance error:", error);
        throw error.response?.data?.error || "An error occurred";
    }
};


export const getBalanceAPI = async () => {
    try {
        const response = await axios.get(`${API}getBalance`, {
            headers: {Authorization: `Bearer ${localStorage.getItem("token")}`}
        });
        return response.data;
    } catch (error) {
        console.error("Balance fetch error:", error);
        throw error.response?.data?.error || "An error occurred";
    }
};
