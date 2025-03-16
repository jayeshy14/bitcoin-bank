import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  getTotalLoanIdAPI,
  getByLoanIdAPI
} from '../../apis/contractApis';
import { getBTCvalueInUSD } from '../../apis/collateralApis';

const LoanManagement = () => {
  const [totalLoans, setTotalLoans] = useState(0);
  const [loanId, setLoanId] = useState('');
  const [loanDetails, setLoanDetails] = useState(null);
  const [btcPrice, setBtcPrice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch total loan count
        try {
          const totalLoanCount = await getTotalLoanIdAPI();
          console.log("Total loan count response:", totalLoanCount);
          
          // Extract the total loan count from the response
          let count = 0;
          if (totalLoanCount.result && totalLoanCount.result.value) {
            count = Number(totalLoanCount.result.value);
          } else if (totalLoanCount.totalLoanId) {
            count = totalLoanCount.totalLoanId;
          }
          
          setTotalLoans(count);
        } catch (countError) {
          console.error("Error fetching total loan count:", countError);
          // Continue with default value of 0
        }
        
        // Fetch BTC price
        try {
          const price = await getBTCvalueInUSD();
          setBtcPrice(price);
        } catch (priceError) {
          console.error("Error fetching BTC price:", priceError);
          // Continue without price
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load loan management data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handleCheckLoan = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!loanId) {
      setError('Please enter a loan ID');
      return;
    }
    
    try {
      setLoading(true);
      // Use getByLoanIdAPI to fetch loan details
      const response = await getByLoanIdAPI(loanId);
      console.log("Loan details response:", response);
      
      // Extract loan data from the response
      let loanData;
      if (response.result && response.result.value && response.result.value.data) {
        // Handle the nested structure from the blockchain response
        const data = response.result.value.data;
        loanData = {
          status: data.status?.value,
          amount: data.amountInsBTC?.value,
          amountInUSD: data.amountInUSD?.value,
          borrower: data.borrower?.value,
          collateralId: data['collateral-id']?.value,
          collateralType: data['collateral-type']?.value,
          collateralValue: data['collateral-value']?.value,
          interestRate: data.interestRate?.value,
          lender: data.lender?.value,
          loanType: data.loanType?.value,
          priceAtLoanTime: data.priceAtLoanTime?.value,
          riskFactor: data.riskFactor?.value,
          timeInMonth: data.timeInMonth?.value,
          totalRepaymentInsBTC: data.totalRepayementInsBTC?.value,
          totalRepaymentInUSD: data.totalRepaymentInUSD?.value
        };
      } else {
        // Fallback to the direct response or a simpler structure
        loanData = response.result || response;
      }
      
      console.log("Processed loan data:", loanData);
      setLoanDetails(loanData);
      setSuccess(`Successfully retrieved details for loan ${loanId}`);
    } catch (err) {
      console.error('Error checking loan details:', err);
      setError(`Failed to check loan details: ${err.message || 'Unknown error'}`);
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
      >
        {/* Header */}
        <div className="relative mb-8 overflow-hidden rounded-2xl">
          <div className="absolute inset-0 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 opacity-90"></div>
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80')] bg-cover bg-center mix-blend-overlay"></div>
          <div className="relative z-10 px-8 py-12">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">Loan Management</h1>
            <p className="text-gray-200">
              Admin tools for managing and monitoring loans
            </p>
            <div className="mt-4 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 inline-block">
              <span className="text-white">Total Loans: <span className="font-bold">{totalLoans}</span></span>
            </div>
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
                <p className="text-sm font-medium text-green-400">{success}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Check Loan Details */}
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-xl overflow-hidden border border-gray-700">
            <div className="p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Check Loan Details</h3>
              
              <form onSubmit={handleCheckLoan} className="space-y-4">
                <div>
                  <label className="block text-gray-300 mb-2 text-sm font-medium">Loan ID</label>
                  <input
                    type="text"
                    value={loanId}
                    onChange={(e) => setLoanId(e.target.value)}
                    placeholder="Enter loan ID"
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                    required
                  />
                </div>
                
                <div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 rounded-lg text-white font-medium shadow-lg transition-all duration-200 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Checking...' : 'Check Loan Details'}
                  </button>
                </div>
              </form>
              
              {loanDetails && (
                <div className="mt-6 p-4 bg-gray-700/50 rounded-lg">
                  <h4 className="text-lg font-medium text-white mb-2">Loan Details</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Status:</span>
                      <span className="text-white">{loanDetails.status || 'Unknown'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Borrower:</span>
                      <span className="text-white">{loanDetails.borrower || 'Unknown'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Amount:</span>
                      <span className="text-white">{loanDetails.amount} BTC</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">USD Value:</span>
                      <span className="text-white">
                        ${btcPrice ? (loanDetails.amount * btcPrice).toFixed(2) : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Loan Statistics */}
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-xl overflow-hidden border border-gray-700">
            <div className="p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Loan Statistics</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-700/50 p-4 rounded-lg">
                  <div className="text-sm text-gray-400 mb-1">Total Loans</div>
                  <div className="text-2xl font-bold text-white">{totalLoans}</div>
                </div>
                
                <div className="bg-gray-700/50 p-4 rounded-lg">
                  <div className="text-sm text-gray-400 mb-1">BTC Price</div>
                  <div className="text-2xl font-bold text-white">${btcPrice ? btcPrice.toLocaleString() : 'Loading...'}</div>
                </div>
              </div>
              
              <div className="mt-6">
                <h4 className="text-lg font-medium text-white mb-3">System Information</h4>
                <div className="bg-gray-700/50 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Contract Address:</span>
                    <span className="text-white truncate max-w-[200px]">0x1234...5678</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Network:</span>
                    <span className="text-white">Stacks Testnet</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Status:</span>
                    <span className="text-green-400">Active</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoanManagement; 