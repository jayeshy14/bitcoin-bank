import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { createCollateralApi, fetchCitiesApi } from '../../apis/collateralApis';

const ListCollateral = () => {
  const [cities, setCities] = useState([]);
  const [formData, setFormData] = useState({
    type: 'gold',
    goldAmount: '',
    city: '',
    area: '',
    areaUnit: 'sq_ft',
    propertyDocument: null,
    status: 'pending'
  });

  useEffect(() => {
    const getCities = async() => {
      const cities = await fetchCitiesApi();
      console.log(cities)
      setCities(Array.isArray(cities) ? cities : []);
    }
    getCities();

  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleFileChange = (e) => {
    setFormData({
      ...formData,
      propertyDocument: e.target.files[0]
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();

      if (formData.type === 'gold') {
        formDataToSend.append('type', formData.type);
        formDataToSend.append('goldAmount', formData.goldAmount);
      } else if (formData.type === 'property') {
        formDataToSend.append('type', formData.type);
        formDataToSend.append('cityName', formData.city);
        formDataToSend.append('area', formData.area);
        formDataToSend.append('areaUnit', formData.areaUnit);
        if (formData.propertyDocument) {
          formDataToSend.append('propertyDocument', formData.propertyDocument);
        }
      }
      
      const data = await createCollateralApi(formDataToSend);
      console.log('Collateral listed:', data);
    } catch (error) {
      console.error('Error listing collateral:', error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Apply for a Loan</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-gray-700 mb-2">Type</label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
          >
            <option value="gold">Gold</option>
            <option value="property">Property</option>
          </select>
        </div>

        {formData.type === 'gold' && (
          <div>
            <label className="block text-gray-700 mb-2">Total Amount (in ounces)</label>
            <input
              type="number"
              name="goldAmount"
              value={formData.goldAmount}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
              required
            />
          </div>
        )}

        {formData.type === 'property' && (
          <>
            <div>
              <label className="block text-gray-700 mb-2">City</label>
              <select
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                required
              >
                <option value="">Select a city</option>
                {cities&&cities.map((city, index) => (
                  <option key={index} value={city.Name}>
                    {city.Name} - ${city.rate}/sq ft
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-700 mb-2">Total Area</label>
              <input
                type="number"
                name="area"
                value={formData.area}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2">Area Unit</label>
              <select
                name="areaUnit"
                value={formData.areaUnit}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
              >
                <option value="sq_ft">Square Feet</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-700 mb-2">Upload Property Document</label>
              <input
                type="file"
                name="propertyDocument"
                onChange={handleFileChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                required
              />
            </div>
          </>
        )}

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition duration-200"
        >
          List Collateral
        </button>
      </form>
    </div>
  );
};

export default ListCollateral;
