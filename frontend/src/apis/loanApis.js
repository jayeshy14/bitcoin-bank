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

export {createLoanApplicationApi}