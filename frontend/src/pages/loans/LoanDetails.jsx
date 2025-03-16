import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getByLoanIdAPI } from '../../apis/contractApis';
import { getBTCvalueInUSD } from '../../apis/collateralApis';
import { calculateEmi } from '../../apis/loanApis';

const LoanDetails = () => {
  const { id } = useParams();
  const [loan, setLoan] = useState(null);
  const [emiDetails, setEmiDetails] = useState(null);
  const [btcPrice, setBtcPrice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [useContractAPI, setUseContractAPI] = useState(true);

  useEffect(() => {
    const fetchLoanDetails = async () => {
      try {
        let loanData = null;
        
        // Try to fetch from contract API first
        if (useContractAPI) {
          try {
            console.log("Attempting to fetch loan details from contract API");
            const response = await getByLoanIdAPI(id);
            console.log("Contract API response:", response);
            
            // Extract loan data from the response
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
          } catch (contractError) {
            console.error("Error fetching from contract API:", contractError);
            setUseContractAPI(false);
            // We'll fall back to the loan API below
          }
        }
        
        // If contract API failed or we're not using it, try to get EMI details
        // which will include some loan information
        if (!loanData) {
          try {
            console.log("Falling back to EMI calculation API for loan details");
            const emiResponse = await calculateEmi(id);
            console.log("EMI calculation response:", emiResponse);
            setEmiDetails(emiResponse);
            
            // Extract basic loan info from EMI response if available
            if (emiResponse) {
              loanData = {
                principalBtc: emiResponse.principalBtc,
                interestRate: emiResponse.interestRate,
                timeInMonth: emiResponse.loanTimeInMonths,
                priceAtLoanTime: emiResponse.priceAtLoanTime,
                riskFactor: emiResponse.riskPercentage,
                // Add other fields that might be available in the EMI response
              };
            }
          } catch (emiError) {
            console.error("Error fetching EMI details:", emiError);
            // Continue with whatever data we have
          }
        }
        
        if (loanData) {
          console.log("Final loan data:", loanData);
          setLoan(loanData);
        } else {
          setError("Could not retrieve loan details from any source");
        }

        // Fetch BTC price
        const price = await getBTCvalueInUSD();
        setBtcPrice(price);
      } catch (error) {
        console.error('Error in loan details fetch flow:', error);
        setError('Failed to load loan details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchLoanDetails();
  }, [id, useContractAPI]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="relative w-24 h-24">
          <div className="absolute w-full h-full border-4 border-gray-200 rounded-full"></div>
          <div className="absolute w-full h-full border-4 border-t-transparent border-r-transparent border-blue-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-medium text-gray-400">Loading</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-500/10 border border-red-500 rounded-lg m-4">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!loan) {
    return (
      <div className="p-4 bg-gray-800 rounded-lg m-4">
        <p className="text-gray-400">No loan found with ID: {id}</p>
      </div>
    );
  }

  return (
    <div className="w-full px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-4">
        <Link to="/loans/my-loans" className="text-blue-400 hover:text-blue-300 flex items-center">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
          </svg>
          Back to My Loans
        </Link>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="relative mb-8 overflow-hidden rounded-2xl">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-900 opacity-90"></div>
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1639322537504-6427a16b0a28?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80')] bg-cover bg-center mix-blend-overlay"></div>
          <div className="relative z-10 px-8 py-12">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">Loan Details</h1>
            <p className="text-gray-200">
              Loan ID: {id}
            </p>
          </div>
        </div>

        {/* Loan Details Card */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-xl overflow-hidden border border-gray-700">
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-white">Basic Information</h3>
                <div className="bg-gray-700/50 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Status:</span>
                    <span className="text-white">{loan.status || 'Unknown'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Amount:</span>
                    <span className="text-white">{loan.amount} BTC</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">USD Value:</span>
                    <span className="text-white">
                      ${btcPrice ? (loan.amount * btcPrice).toFixed(2) : 'Loading...'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Terms */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-white">Loan Terms</h3>
                <div className="bg-gray-700/50 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Interest Rate:</span>
                    <span className="text-white">{loan.interestRate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Term Length:</span>
                    <span className="text-white">{loan.timeInMonth} months</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Risk Factor:</span>
                    <span className="text-white">{loan.riskFactor}</span>
                  </div>
                </div>
              </div>

              {/* Collateral */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-white">Collateral Information</h3>
                <div className="bg-gray-700/50 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Type:</span>
                    <span className="text-white">{loan.collateralType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Value:</span>
                    <span className="text-white">${loan.collateralValue}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">LTV Ratio:</span>
                    <span className="text-white">
                      {((loan.amount * (btcPrice || 0)) / loan.collateralValue * 100).toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Schedule */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-white">Payment Information</h3>
                <div className="bg-gray-700/50 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Next Payment:</span>
                    <span className="text-white">{loan.nextPaymentDate || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Monthly Payment:</span>
                    <span className="text-white">{loan.monthlyPayment || 'N/A'} BTC</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Remaining Payments:</span>
                    <span className="text-white">{loan.remainingPayments || 'N/A'}</span>
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

export default LoanDetails; 