import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { investmentOpportunitiesApi } from '../../apis/loanApis';
import { getBTCvalueInUSD, getCollateralDetailsApi } from '../../apis/collateralApis';
import { issueLoanAPI } from '../../apis/contractApis';

const InvestmentOpportunities = () => {
  const [loanApplications, setLoanApplications] = useState([]);
  const [btcValue, setBtcValue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processingLoan, setProcessingLoan] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [collateralDetails, setCollateralDetails] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch loan applications
        const activeLoans = await investmentOpportunitiesApi();
        setLoanApplications(activeLoans);
        
        // Fetch BTC price
        const btcPrice = await getBTCvalueInUSD();
        setBtcValue(btcPrice);
        
        // Fetch collateral details for each loan
        const collateralPromises = activeLoans.map(loan => 
          getCollateralDetailsApi(loan.collateral)
            .then(details => ({ [loan.collateral]: details }))
            .catch(() => ({ [loan.collateral]: null }))
        );
        
        const collateralResults = await Promise.all(collateralPromises);
        const collateralData = collateralResults.reduce((acc, curr) => ({ ...acc, ...curr }), {});
        setCollateralDetails(collateralData);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load investment opportunities. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handleFundLoan = async (loanData) => {
    setProcessingLoan(loanData._id);
    setError('');
    setSuccess('');
    
    try {
      const collateralDetail = collateralDetails[loanData.collateral];
      if (!collateralDetail) {
        throw new Error('Could not retrieve collateral details');
      }
      
      const collateralType = collateralDetail.type === "gold" ? 1001 : 1002;
      const amountInBTC = loanData.amount / btcValue;
      
      const loanPayload = {
        ...loanData,
        collateralType,
        collateralValue: Math.round(collateralDetail.value),
        amountInBTC,
        loanType: 0o1,
        priceAtLoanTime: Math.round(btcValue)
      };
      
      await issueLoanAPI(loanPayload);
      
      // Remove the funded loan from the list
      setLoanApplications(prev => prev.filter(loan => loan._id !== loanData._id));
      setSuccess(`Successfully funded loan ${loanData._id.substring(0, 8)}...`);
      
      // Refresh the list after a short delay
      setTimeout(() => {
        setSuccess('');
      }, 5000);
      
    } catch (err) {
      console.error("Error funding loan:", err);
      setError(`Failed to fund loan: ${err.message || 'Unknown error'}`);
    } finally {
      setProcessingLoan(null);
    }
  };

  // Helper function to format BTC amount
  const formatBTC = (amount) => {
    if (!btcValue || !amount) return '0.00000000';
    return (amount / btcValue).toFixed(8);
  };

  // Helper function to get collateral type icon
  const getCollateralIcon = (collateralId) => {
    const details = collateralDetails[collateralId];
    if (!details) return '🔒';
    return details.type === 'gold' ? '🏅' : '🏢';
  };

  // Helper function to get collateral value
  const getCollateralValue = (collateralId) => {
    const details = collateralDetails[collateralId];
    if (!details) return 'Loading...';
    return `$${details.value.toFixed(2)}`;
  };

  // Helper function to calculate loan-to-value ratio
  const calculateLTV = (loanAmount, collateralId) => {
    const details = collateralDetails[collateralId];
    if (!details || !details.value) return 'N/A';
    const ltv = (loanAmount / details.value) * 100;
    return `${ltv.toFixed(2)}%`;
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
          <div className="absolute inset-0 bg-gradient-to-r from-purple-900 via-indigo-900 to-blue-900 opacity-90"></div>
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1620321023374-d1a68fbc720d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80')] bg-cover bg-center mix-blend-overlay"></div>
          <div className="relative z-10 px-8 py-12">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">Investment Opportunities</h1>
            <p className="text-gray-200 max-w-3xl">
              Fund Bitcoin loans backed by valuable collateral. Earn interest while helping others access liquidity without selling their assets.
            </p>
            {btcValue && (
              <div className="mt-4 inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full">
                <span className="text-yellow-300 font-medium">Current BTC Price:</span>
                <span className="ml-2 text-white font-bold">${btcValue.toLocaleString()}</span>
              </div>
            )}
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
                <p className="text-sm font-medium text-green-400">{success}</p>
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

        {/* Main Content */}
        <div className="space-y-8">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="relative w-24 h-24">
                <div className="absolute w-full h-full border-4 border-gray-200 rounded-full"></div>
                <div className="absolute w-full h-full border-4 border-t-transparent border-r-transparent border-purple-500 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-medium text-gray-400">Loading</span>
                </div>
              </div>
            </div>
          ) : loanApplications.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {loanApplications.map((loan, index) => (
            <motion.div 
              key={loan._id} 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-xl overflow-hidden border border-gray-700"
                >
                  {/* Loan Status Header */}
                  <div className="p-1 bg-gradient-to-r from-purple-600 to-indigo-600">
                    <div className="px-4 py-1 text-xs font-semibold text-white flex justify-between items-center">
                      <span>Status: {loan.status}</span>
                      <span className="bg-white/20 px-2 py-0.5 rounded-full">
                        LTV: {calculateLTV(loan.amount, loan.collateral)}
                      </span>
                    </div>
                  </div>
                  
                  {/* Loan Details */}
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-white">Loan Request</h3>
                        <p className="text-xs text-gray-400">ID: {loan._id.substring(0, 8)}...</p>
                      </div>
                      <div className="flex items-center justify-center w-12 h-12 bg-indigo-900/30 rounded-full">
                        <span className="text-2xl">{getCollateralIcon(loan.collateral)}</span>
                      </div>
                    </div>
                    
                    {/* Loan Amount */}
                    <div className="mb-6">
                      <div className="flex justify-between items-baseline">
                        <span className="text-gray-400 text-sm">Loan Amount:</span>
                        <div className="text-right">
                          <div className="text-xl font-bold text-white">{formatBTC(loan.amount)} BTC</div>
                          <div className="text-sm text-gray-400">${loan.amount.toLocaleString()}</div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Loan Details Grid */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-gray-800/50 p-3 rounded-lg">
                        <div className="text-xs text-gray-400 mb-1">Interest Rate</div>
                        <div className="text-white font-medium">{loan.interestRate}%</div>
                      </div>
                      
                      <div className="bg-gray-800/50 p-3 rounded-lg">
                        <div className="text-xs text-gray-400 mb-1">Term</div>
                        <div className="text-white font-medium">{loan.term} months</div>
                      </div>
                      
                      <div className="bg-gray-800/50 p-3 rounded-lg">
                        <div className="text-xs text-gray-400 mb-1">Risk Factor</div>
                        <div className="text-white font-medium">{loan.riskFactor}</div>
                      </div>
                      
                      <div className="bg-gray-800/50 p-3 rounded-lg">
                        <div className="text-xs text-gray-400 mb-1">Collateral Value</div>
                        <div className="text-white font-medium">{getCollateralValue(loan.collateral)}</div>
                      </div>
                    </div>
                    
                    {/* Potential Return Calculation */}
                    <div className="bg-gradient-to-br from-indigo-900/30 to-purple-900/30 p-4 rounded-lg border border-indigo-800/30 mb-6">
                      <div className="flex justify-between items-center">
                        <span className="text-indigo-300 text-sm">Potential Return:</span>
                        <span className="text-lg font-bold text-white">
                          ~${((loan.amount * loan.interestRate / 100) * (loan.term / 12)).toFixed(2)}
                        </span>
                      </div>
                    </div>
                    
                    {/* Fund Button */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleFundLoan(loan)}
                      disabled={processingLoan === loan._id}
                      className="w-full py-3 px-4 rounded-lg text-white font-medium shadow-lg transition-all duration-200 bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-500 hover:to-indigo-600 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {processingLoan === loan._id ? (
                        <div className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Processing...
                        </div>
                      ) : (
                        "Fund This Loan"
                      )}
                    </motion.button>
                  </div>
            </motion.div>
          ))}
        </div>
      ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-8 text-center border border-gray-700"
            >
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-medium text-gray-200 mb-2">No Investment Opportunities Available</h3>
              <p className="text-gray-400 mb-6 max-w-md mx-auto">
                There are currently no active loan applications seeking funding. Please check back later for new opportunities.
              </p>
            </motion.div>
          )}
        </div>

        {/* Information Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-8 p-6 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700"
        >
          <h3 className="text-xl font-semibold text-white mb-4">Why Invest in Bitcoin-Backed Loans?</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="flex flex-col items-center text-center p-4 bg-gray-800/50 rounded-lg">
              <div className="w-12 h-12 bg-purple-900/50 rounded-full flex items-center justify-center mb-3">
                <span className="text-xl">💰</span>
              </div>
              <h4 className="text-white font-medium mb-2">Earn Interest</h4>
              <p className="text-gray-400 text-sm">Generate returns by funding loans backed by valuable collateral assets.</p>
            </div>
            <div className="flex flex-col items-center text-center p-4 bg-gray-800/50 rounded-lg">
              <div className="w-12 h-12 bg-blue-900/50 rounded-full flex items-center justify-center mb-3">
                <span className="text-xl">🔒</span>
              </div>
              <h4 className="text-white font-medium mb-2">Secured Investment</h4>
              <p className="text-gray-400 text-sm">All loans are backed by collateral, reducing the risk of your investment.</p>
            </div>
            <div className="flex flex-col items-center text-center p-4 bg-gray-800/50 rounded-lg">
              <div className="w-12 h-12 bg-green-900/50 rounded-full flex items-center justify-center mb-3">
                <span className="text-xl">🌐</span>
              </div>
              <h4 className="text-white font-medium mb-2">Support the Ecosystem</h4>
              <p className="text-gray-400 text-sm">Help others access liquidity while maintaining their crypto holdings.</p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default InvestmentOpportunities;
