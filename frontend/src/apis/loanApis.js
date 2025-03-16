import axios from "axios";

const API = 'http://localhost:3000/api/loans/';

const createLoanApplicationApi = async(formData) => {
    try {
        const response = axios.post(`${API}apply`, formData, {
            headers: { 
                'Content-Type': 'application/json'
              }
        })
        return (await response).data;  
    } catch (error) {
        console.error(error);
    }
}

const getMyPendingApplicationsApi = async() => {
    try {
        const response = axios.get(`${API}my-applications`,{
            headers: {Authorization: `Bearer ${localStorage.getItem("token")}`}
        });
        return (await response).data;
    } catch (error) {
        console.error(error);
    }
}

const investmentOpportunitiesApi  = async() => {
    try {
        const response = axios.get(`${API}investment-opportunities`,{
            headers: {Authorization: `Bearer ${localStorage.getItem("token")}`}
        });
        return (await response).data;
    } catch (error) {
        console.error(error);
    }
}

// CALCULATOR_DATA
// principalBtc,
// priceAtLoanTime,
// monthlyInterestRate,
// riskPercentage,
// loanTimeInMonths, 
// currentPrice
const calculateEmi = async (loanId) => {
    try {
        const response = await axios.post(`${API}calculate_emi/${loanId}`);
        return response.data;
    } catch (error) {
        console.error("Error calculating EMI:", error);
        throw error.response?.data?.error || "An error occurred";
    }
}


// SIMULATE DATA
// principalBtc,
// priceAtLoanTime,
// monthlyInterestRate,
// riskPercentage,
// loanTimeInMonths,

const simulateEmi = async (SimulateData) => {
    try {
        console.log("simulate DATA", SimulateData)
        const response = await axios.post(`${API}simulate_loan`, SimulateData);
        return response.data;
    } catch (error) {
        console.error("Error Simulating loan:", error);
        throw error.response?.data?.error || "An error occurred";
    }
}

const getUserWallet = async() => {
    try {
        const response = await axios.get(`${API}get_wallet_address`)
        return response.data;
    } catch (error) {
        console.error("Error getting wallet address: ", error);
        throw error.response?.data?.error || "An error occurred";
    }
}

const getMyActiveLoans = async() => {
    try {
        const response = await axios.get(`${API}my-active-loans`, {
            headers: {Authorization: `Bearer ${localStorage.getItem("token")}`}
        })
        return response.data;
    } catch (error) {
        console.error("Error getting active loans: ", error);
    }
}

const getMyClosedLoans = async() => {
    try {
        const response = await axios.get(`${API}my-closed-loans`, {
            headers: {Authorization: `Bearer ${localStorage.getItem("token")}`}
        })
        return response.data;
    } catch (error) {
        console.error("Error getting closed loans: ", error);
    }
}

export {createLoanApplicationApi, getMyPendingApplicationsApi, investmentOpportunitiesApi, calculateEmi, simulateEmi, getUserWallet, getMyActiveLoans, getMyClosedLoans}