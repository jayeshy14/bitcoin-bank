import axios from 'axios';

const VALUATION_API_URL = 'https://api.valuationprovider.com/'; // Replace with actual API URL

export const getCollateralValue = async (collateralType, amount) => {
  try {
    const response = await axios.get(`${VALUATION_API_URL}/value`, {
      params: { type: collateralType, amount }
    });
    return response.data.value;
  } catch (error) {
    console.error('Error fetching collateral value:', error);
    throw new Error('Could not fetch collateral value');
  }
}; 