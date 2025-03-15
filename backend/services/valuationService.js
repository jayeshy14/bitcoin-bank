import axios from 'axios';
import City from '../models/City.js';

const getPropertyValue = async (cityName, area) => {
  try {
    console.log("The city you're finding is: ", cityName);
    const city = await City.findOne({Name: cityName});
    console.log(city.Name);
    if(!city){
      throw new Error("City not found!");
    }
    console.log(city.rate*area);
    return city.rate * area;
  } catch (error) {
    console.error(error);
  }
}; 

const getGoldValue = async(amount) => {
  try{
    const goldRate = await getLatestGoldPrice();
    return goldRate * amount;
  }catch(error){
    console.error(error)
  }
}

const getLatestGoldPrice = async() => {
  try {
    const response = await axios.get("https://api.metalpriceapi.com/v1/latest", {
      params: {
        api_key: "575da44cc3f7aec1ff45febf88a3cd98",
        base: "USD",
        currencies: "XAU"
      }
    });
    const data = response.data;
    return data.rates.USDXAU;
  } catch (error) {
    console.error(error);
  }
}

const getCryptoLatestPrice = async() => {
  try {
    const response = await axios.get("https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest", {
      headers: {
        "X-CMC_PRO_API_KEY": "f407eef7-98ca-42c9-a0ef-8767951c089b"
      },
    });

    const btcData = response.data.data.find((crypto) => crypto.symbol === "BTC");
    
    if (!btcData) {
      throw new Error("BTC data not found");
    }

    console.log("BTC Price (USD):", btcData.quote.USD.price);
    return btcData.quote.USD.price;
  } catch (e) {
    console.error("Error fetching BTC price:", error.message);
    return null;
  }
}

export {getGoldValue, getPropertyValue, getCryptoLatestPrice}