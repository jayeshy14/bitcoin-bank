import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { createLoanApplicationApi } from '../../apis/loanApis'; 
import { getCollateralDetailsApi, getMyCollateralsApi, getBTCvalueInUSD } from '../../apis/collateralApis';

const LoanApplicationForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    amount: '',
    interestRate: '',
    riskFactor: '',
    term: '',
    collateralId: '',
  });
  
  const [collaterals, setCollaterals] = useState([]);
  const [selectedCollateral, setSelectedCollateral] = useState(null);
  const [btcPrice, setBtcPrice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch collaterals
        const myCollaterals = await getMyCollateralsApi();
        setCollaterals(myCollaterals.filter(c => c.status === 'unlocked'));
        
        // Fetch BTC price
        const price = await getBTCvalueInUSD();
        setBtcPrice(price);
      } catch (error) {
        console.error('Failed to fetch data:', error);
        setError('Failed to load your collaterals. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Fetch collateral details when collateralId changes
  useEffect(() => {
    const fetchCollateralDetails = async () => {
      if (!formData.collateralId) {
        setSelectedCollateral(null);
        return;
      }
      
      try {
        const details = await getCollateralDetailsApi(formData.collateralId);
        setSelectedCollateral(details);
      } catch (error) {
        console.error('Failed to fetch collateral details:', error);
      }
    };
    
    fetchCollateralDetails();
  }, [formData.collateralId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    
    try {
      await createLoanApplicationApi(formData);
      setSuccess(true);
      
      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (error) {
      setError(error?.data?.error || 'Error submitting loan application. Please try again.');
      console.error('Application submission error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const calculateBTC = () => {
    if (!btcPrice || !formData.amount) return '0';
    return (parseFloat(formData.amount) / btcPrice).toFixed(8);
  };

  const calculateLTV = () => {
    if (!selectedCollateral || !formData.amount) return '0';
    return ((parseFloat(formData.amount) / selectedCollateral.value) * 100).toFixed(2);
  };

  const calculateMonthlyPayment = () => {
    if (!formData.amount || !formData.interestRate || !formData.term) return '0.00';
    
    const principal = parseFloat(formData.amount);
    const rate = parseFloat(formData.interestRate) / 100 / 12;
    const term = parseInt(formData.term);
    
    const payment = (principal * rate * Math.pow(1 + rate, term)) / (Math.pow(1 + rate, term) - 1);
    return payment.toFixed(2);
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
          <div className="absolute inset-0 bg-gradient-to-r from-green-900 via-emerald-900 to-teal-900 opacity-90"></div>
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1639322537228-f710d846310a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80')] bg-cover bg-center mix-blend-overlay"></div>
          <div className="relative z-10 px-8 py-12">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">Apply for a Bitcoin Loan</h1>
            <p className="text-gray-200 max-w-3xl">
              Use your valuable assets as collateral to access Bitcoin liquidity without selling your holdings.
            </p>
            {btcPrice && (
              <div className="mt-4 inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full">
                <span className="text-yellow-300 font-medium">Current BTC Price:</span>
                <span className="ml-2 text-white font-bold">${btcPrice.toLocaleString()}</span>
              </div>
            )}
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
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="relative w-24 h-24">
              <div className="absolute w-full h-full border-4 border-gray-200 rounded-full"></div>
              <div className="absolute w-full h-full border-4 border-t-transparent border-r-transparent border-green-500 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-medium text-gray-400">Loading</span>
              </div>
            </div>
          </div>
        ) : collaterals.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-8 text-center border border-gray-700"
          >
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
            </div>
            <h3 className="text-xl font-medium text-gray-200 mb-2">No Collateral Available</h3>
            <p className="text-gray-400 mb-6">You need to list at least one collateral asset before you can apply for a loan. List your assets to unlock the potential for crypto-backed loans.</p>
            <Link to="/collateral" className="inline-flex items-center px-5 py-3 bg-gradient-to-r from-green-600 to-green-800 hover:from-green-700 hover:to-green-900 text-white rounded-lg shadow-lg transition-all">
              <span>List Your First Collateral</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-xl overflow-hidden border border-gray-700"
          >
            <div className="p-6 md:p-8">
              <h2 className="text-2xl font-bold text-white mb-6">Loan Application Form</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="mb-6">
                  <label className="block text-gray-300 mb-2 text-sm font-medium">Select Collateral</label>
                  <select
                    name="collateralId"
                    value={formData.collateralId}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-white"
                    required
                  >
                    <option value="">Select a collateral asset</option>
                    {collaterals.map((collateral) => (
                      <option key={collateral._id} value={collateral._id}>
                        {collateral.type.toUpperCase()} - Value: ${collateral.value.toFixed(2)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Selected Collateral Card */}
                {selectedCollateral && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="p-4 bg-gradient-to-br from-gray-700/50 to-gray-800/50 rounded-lg border border-gray-600 mb-6"
                  >
                    <h4 className="text-white font-medium mb-2">Selected Collateral</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-gray-400 text-sm">Type:</p>
                        <p className="text-white">
                          {selectedCollateral.type === 'gold' ? '🏅 Gold' : '🏢 Property'}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Value:</p>
                        <p className="text-white">${selectedCollateral.value.toFixed(2)}</p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Loan Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Loan Amount */}
                  <div>
                    <label className="block text-gray-300 mb-2 text-sm font-medium">Loan Amount (USD)</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-400">$</span>
                      </div>
                      <input
                        type="number"
                        name="amount"
                        value={formData.amount}
                        onChange={handleChange}
                        placeholder="Enter amount"
                        className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-white"
                        required
                        min="1"
                        step="0.01"
                      />
                    </div>
                    {btcPrice && formData.amount && (
                      <p className="mt-1 text-xs text-gray-400">
                        Equivalent to approximately {calculateBTC()} BTC
                      </p>
                    )}
                  </div>

                  {/* Interest Rate */}
                  <div>
                    <label className="block text-gray-300 mb-2 text-sm font-medium">Interest Rate (%)</label>
                    <div className="relative">
                      <input
                        type="number"
                        name="interestRate"
                        value={formData.interestRate}
                        onChange={handleChange}
                        placeholder="e.g. 5.5"
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-white"
                        required
                        min="0.1"
                        step="0.1"
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <span className="text-gray-400">%</span>
                      </div>
                    </div>
                    <p className="mt-1 text-xs text-gray-400">
                      Annual interest rate for your loan
                    </p>
                  </div>

                  {/* Risk Factor */}
                  <div>
                    <label className="block text-gray-300 mb-2 text-sm font-medium">Risk Factor (0-100)</label>
                    <div className="relative">
                      <input
                        type="number"
                        name="riskFactor"
                        value={formData.riskFactor}
                        onChange={handleChange}
                        placeholder="Enter risk factor"
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-white"
                        required
                        min="0"
                        max="100"
                        step="1"
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <span className="text-gray-400">/100</span>
                      </div>
                    </div>
                    <p className="mt-1 text-xs text-gray-400">
                      Higher risk values may affect interest rates and loan approval
                    </p>
                  </div>

                  {/* Loan Term */}
                  <div>
                    <label className="block text-gray-300 mb-2 text-sm font-medium">Loan Term (Months)</label>
                    <select
                      name="term"
                      value={formData.term}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-white"
                      required
                    >
                      <option value="">Select term</option>
                      <option value="3">3 months</option>
                      <option value="6">6 months</option>
                      <option value="12">12 months</option>
                      <option value="24">24 months</option>
                    </select>
                    <p className="mt-1 text-xs text-gray-400">
                      Duration of your loan
                    </p>
                  </div>
                </div>

                {/* Loan Summary */}
                {formData.amount && formData.interestRate && formData.term && selectedCollateral && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-gradient-to-br from-green-900/30 to-emerald-900/30 rounded-lg border border-green-700/30 mt-6"
                  >
                    <h4 className="text-white font-medium mb-3">Loan Summary</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-gray-400 text-sm">Loan Amount:</p>
                        <p className="text-white font-medium">${parseFloat(formData.amount).toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Loan-to-Value Ratio:</p>
                        <p className="text-white font-medium">{calculateLTV()}%</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Monthly Payment (est.):</p>
                        <p className="text-white font-medium">${calculateMonthlyPayment()}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Total Repayment (est.):</p>
                        <p className="text-white font-medium">
                          ${(parseFloat(calculateMonthlyPayment()) * parseInt(formData.term)).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Submit Button */}
                <div className="pt-4">
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={submitting || success}
                    className="w-full py-3 px-4 rounded-lg text-white font-medium shadow-lg transition-all duration-200 bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-500 hover:to-emerald-600 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {submitting ? (
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
                        Application Submitted
                      </div>
                    ) : (
                      "Submit Loan Application"
                    )}
                  </motion.button>
                </div>
              </form>
            </div>
          </motion.div>
        )}

        {/* Information Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-8 p-6 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700"
        >
          <h3 className="text-xl font-semibold text-white mb-4">How Bitcoin Loans Work</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="flex flex-col items-center text-center p-4 bg-gray-800/50 rounded-lg">
              <div className="w-12 h-12 bg-green-900/50 rounded-full flex items-center justify-center mb-3">
                <span className="text-xl">🔒</span>
              </div>
              <h4 className="text-white font-medium mb-2">Collateral-Backed</h4>
              <p className="text-gray-400 text-sm">Your assets secure the loan, allowing you to borrow without selling.</p>
            </div>
            <div className="flex flex-col items-center text-center p-4 bg-gray-800/50 rounded-lg">
              <div className="w-12 h-12 bg-teal-900/50 rounded-full flex items-center justify-center mb-3">
                <span className="text-xl">⏱️</span>
              </div>
              <h4 className="text-white font-medium mb-2">Flexible Terms</h4>
              <p className="text-gray-400 text-sm">Choose from various loan durations to suit your financial needs.</p>
            </div>
            <div className="flex flex-col items-center text-center p-4 bg-gray-800/50 rounded-lg">
              <div className="w-12 h-12 bg-emerald-900/50 rounded-full flex items-center justify-center mb-3">
                <span className="text-xl">💸</span>
              </div>
              <h4 className="text-white font-medium mb-2">Competitive Rates</h4>
              <p className="text-gray-400 text-sm">Get access to liquidity with transparent and competitive interest rates.</p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default LoanApplicationForm;
