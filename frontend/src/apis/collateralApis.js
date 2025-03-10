import axios from 'axios';

const API = 'http://localhost:3000/api/collateral/';

const createCollateralApi = async (formData) => {
    try {
        const response = await axios.post(`${API}create`, formData, {
            headers: { 
              'Content-Type': 'multipart/form-data'
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
        const response = await axios.delete(`${API}remove/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error removing collateral:', error);
        throw error;
    }
};

const fetchCitiesApi = async() => {
    try {
        const response = await axios.get('http://localhost:3000/api/cities');
        console.log(response.data)
        return response.data;
    } catch (error) {
        console.error(error);
    }
}

export { createCollateralApi, removeCollateralApi, fetchCitiesApi };
