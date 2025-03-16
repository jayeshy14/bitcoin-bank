import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { listCollateralApi } from '../../apis/collateralApis';

const ListCollateral = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    type: '',
    value: '',
    description: '',
    proofDocument: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [fileName, setFileName] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, proofDocument: file });
      setFileName(file.name);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('type', formData.type);
      formDataToSend.append('value', formData.value);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('proofDocument', formData.proofDocument);

      await listCollateralApi(formDataToSend);
      setSuccess(true);
      
      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (error) {
      console.error('Error listing collateral:', error);
      setError(error?.response?.data?.error || 'Failed to list collateral. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full px-4 py-8 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full"
      >
        {/* Header */}
        <div className="relative mb-8 overflow-hidden rounded-2xl">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-900 via-yellow-800 to-orange-900 opacity-90"></div>
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1618044733300-9472054094ee?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80')] bg-cover bg-center mix-blend-overlay"></div>
          <div className="relative z-10 px-8 py-12">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">List Your Collateral</h1>
            <p className="text-gray-200 max-w-3xl">
              Register your valuable assets as collateral to secure Bitcoin loans. We accept gold and property as collateral types.
            </p>
          </div>
        </div>

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

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-xl overflow-hidden border border-gray-700"
            >
              <div className="p-6 md:p-8">
                <h2 className="text-2xl font-bold text-white mb-6">Collateral Registration Form</h2>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Collateral Type */}
                  <div>
                    <label className="block text-gray-300 mb-2 text-sm font-medium">Collateral Type</label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white"
                      required
                    >
                      <option value="">Select collateral type</option>
                      <option value="gold">Gold</option>
                      <option value="property">Property</option>
                    </select>
                    <p className="mt-1 text-xs text-gray-400">
                      Select the type of asset you want to use as collateral
                    </p>
                  </div>
                  
                  {/* Collateral Value */}
                  <div>
                    <label className="block text-gray-300 mb-2 text-sm font-medium">Estimated Value (USD)</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-400">$</span>
                      </div>
                      <input
                        type="number"
                        name="value"
                        value={formData.value}
                        onChange={handleChange}
                        placeholder="Enter estimated value"
                        className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white"
                        required
                        min="1"
                        step="0.01"
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-400">
                      Provide an accurate estimate of your asset's current market value
                    </p>
                  </div>
                  
                  {/* Collateral Description */}
                  <div>
                    <label className="block text-gray-300 mb-2 text-sm font-medium">Description</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Provide details about your collateral..."
                      rows="4"
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white"
                      required
                    ></textarea>
                    <p className="mt-1 text-xs text-gray-400">
                      {formData.type === 'gold' 
                        ? 'Include details such as purity, weight, form (bars, coins, jewelry), and certification if available.'
                        : formData.type === 'property'
                          ? 'Include details such as property type, location, size, condition, and any relevant legal information.'
                          : 'Describe your asset in detail to help with verification and valuation.'}
                    </p>
                  </div>
                  
                  {/* Proof Document */}
                  <div>
                    <label className="block text-gray-300 mb-2 text-sm font-medium">Proof Document</label>
                    <div className="flex items-center justify-center w-full">
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-600 border-dashed rounded-lg cursor-pointer bg-gray-700 hover:bg-gray-600 transition-colors">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          {fileName ? (
                            <>
                              <svg className="w-8 h-8 mb-3 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                              </svg>
                              <p className="mb-2 text-sm text-gray-300 text-center"><span className="font-semibold">File selected:</span> {fileName}</p>
                            </>
                          ) : (
                            <>
                              <svg className="w-8 h-8 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                              </svg>
                              <p className="mb-2 text-sm text-gray-300 text-center"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                              <p className="text-xs text-gray-400 text-center">PDF, JPG, or PNG (max. 10MB)</p>
                            </>
                          )}
                        </div>
                        <input 
                          type="file" 
                          className="hidden" 
                          onChange={handleFileChange}
                          accept=".pdf,.jpg,.jpeg,.png"
                          required
                        />
                      </label>
                    </div>
                    <p className="mt-1 text-xs text-gray-400">
                      Upload documentation that proves ownership and value of your asset
                    </p>
                  </div>
                  
                  {/* Submit Button */}
                  <div className="pt-4">
                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      disabled={loading || success}
                      className="w-full py-3 px-4 rounded-lg text-white font-medium shadow-lg transition-all duration-200 bg-gradient-to-r from-amber-600 to-orange-700 hover:from-amber-500 hover:to-orange-600 disabled:opacity-70 disabled:cursor-not-allowed"
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
                          Collateral Registered
                        </div>
                      ) : (
                        "Register Collateral"
                      )}
                    </motion.button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
          
          {/* Information Section */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700 sticky top-24"
            >
              <div className="p-6">
                <h3 className="text-xl font-semibold text-white mb-4">Collateral Guidelines</h3>
                
                <div className="space-y-6">
                  {/* Gold Guidelines */}
                  <div className="p-4 bg-gradient-to-br from-amber-900/30 to-yellow-900/30 rounded-lg border border-amber-700/30">
                    <div className="flex items-center mb-3">
                      <span className="text-2xl mr-3">🏅</span>
                      <h4 className="text-amber-300 font-medium">Gold Collateral</h4>
                    </div>
                    <ul className="space-y-2 text-sm text-gray-300">
                      <li className="flex items-start">
                        <svg className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        <span>Minimum purity: 22 karat or 91.7% pure</span>
                      </li>
                      <li className="flex items-start">
                        <svg className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        <span>Accepted forms: Bars, coins, bullion</span>
                      </li>
                      <li className="flex items-start">
                        <svg className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        <span>Required proof: Certificate of authenticity, purchase receipts</span>
                      </li>
                    </ul>
                  </div>
                  
                  {/* Property Guidelines */}
                  <div className="p-4 bg-gradient-to-br from-blue-900/30 to-indigo-900/30 rounded-lg border border-blue-700/30">
                    <div className="flex items-center mb-3">
                      <span className="text-2xl mr-3">🏢</span>
                      <h4 className="text-blue-300 font-medium">Property Collateral</h4>
                    </div>
                    <ul className="space-y-2 text-sm text-gray-300">
                      <li className="flex items-start">
                        <svg className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        <span>Accepted types: Residential, commercial, land</span>
                      </li>
                      <li className="flex items-start">
                        <svg className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        <span>Clear title required with no pending disputes</span>
                      </li>
                      <li className="flex items-start">
                        <svg className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        <span>Required proof: Deed, recent appraisal, property tax documents</span>
                      </li>
                    </ul>
                  </div>
                  
                  {/* Verification Process */}
                  <div>
                    <h4 className="text-white font-medium mb-3">Verification Process</h4>
                    <ol className="space-y-3 text-sm text-gray-300">
                      <li className="flex">
                        <span className="bg-gray-700 h-6 w-6 rounded-full flex items-center justify-center text-xs font-medium text-white mr-3">1</span>
                        <div>
                          <p className="text-gray-200">Submit your collateral details and documentation</p>
                        </div>
                      </li>
                      <li className="flex">
                        <span className="bg-gray-700 h-6 w-6 rounded-full flex items-center justify-center text-xs font-medium text-white mr-3">2</span>
                        <div>
                          <p className="text-gray-200">Our team reviews and verifies your submission</p>
                        </div>
                      </li>
                      <li className="flex">
                        <span className="bg-gray-700 h-6 w-6 rounded-full flex items-center justify-center text-xs font-medium text-white mr-3">3</span>
                        <div>
                          <p className="text-gray-200">Collateral is approved and becomes available for loan applications</p>
                        </div>
                      </li>
                    </ol>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ListCollateral; 