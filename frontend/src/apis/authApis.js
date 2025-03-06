import axios from "axios";

const API = "http://localhost:3000/api/auth/";

export const checkAuthAPI = async () => {
    try {
        const response = await axios.get(`${API}me`);
        return response.data;
    } catch (error) {
        console.error("Auth check failed:", error);
        throw error;
    }
};

export const registerAPI = async (formData) => {
    try {
        console.log('Sending registration data:', formData);
        const response = await axios.post(`${API}register`, formData);
        return response.data;
    } catch (error) {
        console.error("Registration error:", error);
        throw error.response?.data?.error || "An error occurred during registration";
    }
};

export const loginAPI = async (email, password) => {
    try {
        const response = await axios.post(`${API}login`, { email, password });
        return response.data;
    } catch (error) {
        console.error("Login error:", error);
        throw error.response?.data?.error || "An error occurred";
    }
};
