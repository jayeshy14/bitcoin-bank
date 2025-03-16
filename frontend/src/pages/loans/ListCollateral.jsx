import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { createCollateralApi, fetchCitiesApi, getBTCvalueInUSD } from '../../apis/collateralApis';
import { useNavigate } from 'react-router-dom';

const ListCollateral = () => {
  const navigate = useNavigate();
  const [cities, setCities] = useState([]);
  const [btcPrice, setBtcPrice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    type: 'gold',
    goldAmount: '',
    cityName: '',
    area: '',
  });

  // Fetch cities and BTC price on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch cities
        const cities = await fetchCitiesApi();
        setCities(Array.isArray(cities) ? cities : []);
        
        // Fetch BTC price
        const btcData = await getBTCvalueInUSD();
        setBtcPrice(btcData);
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    };
    
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const formDataToSend = {
        type: formData.type,
        goldAmount: formData.type === 'gold' ? formData.goldAmount : undefined,
        cityName: formData.type === 'property' ? formData.cityName : undefined,
        area: formData.type === 'property' ? formData.area : undefined,
      };
  
      await createCollateralApi(formDataToSend);
      setSuccess(true);
      
      // Reset form after successful submission
      setFormData({
        type: 'gold',
        goldAmount: '',
        cityName: '',
        area: '',
      });
      
      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
      
    } catch (err) {
      setError('Failed to list collateral. Please try again.');
      console.error('Error listing collateral:', err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate estimated value
  const calculateEstimatedValue = () => {
    if (formData.type === 'gold' && formData.goldAmount) {
      // Gold price per ounce (approximate)
      const goldPricePerOunce = btcPrice ? (btcPrice / 30) : 2000; // Fallback to $2000 if BTC price not available
      return (parseFloat(formData.goldAmount) * goldPricePerOunce).toFixed(2);
    } else if (formData.type === 'property' && formData.cityName && formData.area) {
      const selectedCity = cities.find(city => city.Name === formData.cityName);
      if (selectedCity && formData.area) {
        return (parseFloat(formData.area) * selectedCity.rate).toFixed(2);
      }
    }
    return '0.00';
  };

  return (
    <div className="w-full px-4 py-8 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto"
      >
        {/* Header */}
        <div className="relative mb-8 overflow-hidden rounded-2xl">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-900 opacity-90"></div>
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1618044733300-9472054094ee?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80')] bg-cover bg-center mix-blend-overlay"></div>
          <div className="relative z-10 px-8 py-12">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">List Your Collateral</h1>
            <p className="text-gray-200 max-w-2xl">
              Secure a loan by listing your valuable assets as collateral. We accept gold and property as security for your crypto-backed loans.
            </p>
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8 p-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/50 rounded-xl"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-400">
                  Collateral listed successfully! Redirecting to dashboard...
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8 p-4 bg-gradient-to-r from-red-500/20 to-pink-500/20 border border-red-500/50 rounded-xl"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-400">{error}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Main Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-xl overflow-hidden border border-gray-700"
        >
          <div className="p-6 md:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Collateral Type Selection */}
              <div className="mb-8">
                <label className="block text-gray-300 mb-2 text-sm font-medium">Collateral Type</label>
                <div className="grid grid-cols-2 gap-4">
                  <motion.button
                    type="button"
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setFormData({ ...formData, type: 'gold' })}
                    className={`relative p-4 rounded-xl border-2 transition-all duration-200 ${
                      formData.type === 'gold'
                        ? 'border-yellow-500 bg-gradient-to-br from-yellow-900/40 to-yellow-800/40'
                        : 'border-gray-700 hover:border-gray-600 bg-gray-800'
                    }`}
                  >
                    <div className="flex flex-col items-center">
                      <span className="text-3xl mb-2">🏅</span>
                      <span className={`font-medium ${formData.type === 'gold' ? 'text-yellow-400' : 'text-gray-300'}`}>Gold</span>
                      <p className="text-xs text-gray-400 mt-1">Physical gold in ounces</p>
                    </div>
                    {formData.type === 'gold' && (
                      <div className="absolute top-2 right-2">
                        <svg className="h-5 w-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </motion.button>

                  <motion.button
                    type="button"
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setFormData({ ...formData, type: 'property' })}
                    className={`relative p-4 rounded-xl border-2 transition-all duration-200 ${
                      formData.type === 'property'
                        ? 'border-blue-500 bg-gradient-to-br from-blue-900/40 to-blue-800/40'
                        : 'border-gray-700 hover:border-gray-600 bg-gray-800'
                    }`}
                  >
                    <div className="flex flex-col items-center">
                      <span className="text-3xl mb-2">🏢</span>
                      <span className={`font-medium ${formData.type === 'property' ? 'text-blue-400' : 'text-gray-300'}`}>Property</span>
                      <p className="text-xs text-gray-400 mt-1">Real estate assets</p>
                    </div>
                    {formData.type === 'property' && (
                      <div className="absolute top-2 right-2">
                        <svg className="h-5 w-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </motion.button>
                </div>
              </div>

              {/* Dynamic Form Fields */}
              <div className="space-y-6">
                {formData.type === 'gold' ? (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-gray-300 mb-2 text-sm font-medium">Gold Amount (in ounces)</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-400">oz</span>
                        </div>
                        <input
                          type="number"
                          name="goldAmount"
                          value={formData.goldAmount}
                          onChange={handleChange}
                          placeholder="Enter amount"
                          className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-white"
                          required
                          min="0.1"
                          step="0.01"
                        />
                      </div>
                      <p className="mt-1 text-xs text-gray-400">Current gold price: ~${btcPrice ? (btcPrice / 30).toFixed(2) : '2,000'}/oz</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-gray-300 mb-2 text-sm font-medium">City</label>
                      <select
                        name="cityName"
                        value={formData.cityName}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                        required
                      >
                        <option value="">Select a city</option>
                        {cities.map((city, index) => (
                          <option key={index} value={city.Name}>
                            {city.Name} - ${city.rate}/sq ft
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-gray-300 mb-2 text-sm font-medium">Property Area (sq ft)</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-400">ft²</span>
                        </div>
                        <input
                          type="number"
                          name="area"
                          value={formData.area}
                          onChange={handleChange}
                          placeholder="Enter area"
                          className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                          required
                          min="1"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Estimated Value Card */}
                {((formData.type === 'gold' && formData.goldAmount) || 
                  (formData.type === 'property' && formData.cityName && formData.area)) && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg border border-gray-600"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300 text-sm">Estimated Value:</span>
                      <span className="text-xl font-bold text-white">${calculateEstimatedValue()}</span>
                    </div>
                    <p className="mt-2 text-xs text-gray-400">
                      This is an estimated value based on current market rates. The final valuation may vary.
                    </p>
                  </motion.div>
                )}

                {/* Submit Button */}
                <div className="pt-4">
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={loading || success}
                    className={`w-full py-3 px-4 rounded-lg text-white font-medium shadow-lg transition-all duration-200 ${
                      formData.type === 'gold'
                        ? 'bg-gradient-to-r from-yellow-600 to-amber-700 hover:from-yellow-500 hover:to-amber-600'
                        : 'bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600'
                    } ${(loading || success) ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </div>
                    ) : success ? (
                      <div className="flex items-center justify-center">
                        <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        Collateral Listed
                      </div>
                    ) : (
                      `List ${formData.type === 'gold' ? 'Gold' : 'Property'} as Collateral`
                    )}
                  </motion.button>
                </div>
              </div>
            </form>
          </div>
        </motion.div>

        {/* Information Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-8 p-6 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700"
        >
          <h3 className="text-xl font-semibold text-white mb-4">How Collateral Works</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="flex flex-col items-center text-center p-4 bg-gray-800/50 rounded-lg">
              <div className="w-12 h-12 bg-blue-900/50 rounded-full flex items-center justify-center mb-3">
                <span className="text-xl">🔒</span>
              </div>
              <h4 className="text-white font-medium mb-2">Secure Your Loan</h4>
              <p className="text-gray-400 text-sm">Your assets serve as security for your crypto loan, reducing risk for lenders.</p>
            </div>
            <div className="flex flex-col items-center text-center p-4 bg-gray-800/50 rounded-lg">
              <div className="w-12 h-12 bg-purple-900/50 rounded-full flex items-center justify-center mb-3">
                <span className="text-xl">💰</span>
              </div>
              <h4 className="text-white font-medium mb-2">Better Rates</h4>
              <p className="text-gray-400 text-sm">Collateralized loans typically offer lower interest rates and better terms.</p>
            </div>
            <div className="flex flex-col items-center text-center p-4 bg-gray-800/50 rounded-lg">
              <div className="w-12 h-12 bg-green-900/50 rounded-full flex items-center justify-center mb-3">
                <span className="text-xl">✅</span>
              </div>
              <h4 className="text-white font-medium mb-2">Keep Your Assets</h4>
              <p className="text-gray-400 text-sm">You maintain ownership of your assets while using them to secure financing.</p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ListCollateral;
