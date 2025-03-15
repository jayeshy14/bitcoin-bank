import axios from 'axios';

const API = 'http://localhost:3000/api/collateral/';

const createCollateralApi = async (formData) => {
    try {
        const response = await axios.post(`${API}create`, formData, {
            headers: { 
              'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error creating collateral:', error);
        throw error;
    }
};

const removeCollateralApi = async (id) => {
    try {
        const response = await axios.delete(`${API}remove/${id}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        return response.data;
    } catch (error) {
        console.error('Error removing collateral:', error);
        throw error;
    }
};

const getMyCollateralsApi = async() => {
    try {
        const response = await axios.get(`${API}my-collaterals`,{
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        return response.data;
    } catch (error) {
        console.error(error);
    }
}

const getCollateralDetailsApi = async(id) => {
    try {
        const response = await axios.get(`${API}${id}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
        return response.data;
    } catch (error) {
        console.error(error);
    }
}


const fetchCitiesApi = async() => {
    try {
        const response = await axios.get('http://localhost:3000/api/cities');
        console.log(response.data)
        return response.data;
    } catch (error) {
        console.error(error);
    }
}

const getBTCvalueInUSD = async () => {
    try {
        const response = await axios.get('http://localhost:3000/api/btc');
        console.log(response.data);
        return response.data;
    } catch (error) {
        console.error(error);
    }
}

export { createCollateralApi, removeCollateralApi, getCollateralDetailsApi, getMyCollateralsApi, fetchCitiesApi, getBTCvalueInUSD};
