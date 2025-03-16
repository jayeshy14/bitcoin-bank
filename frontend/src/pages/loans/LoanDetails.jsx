import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion as Motion } from 'framer-motion';
import { getByLoanIdAPI } from '../../apis/contractApis';
import { getBTCvalueInUSD } from '../../apis/collateralApis';
import { calculateEmi } from '../../apis/loanApis';

const LoanDetails = () => {
  const { id } = useParams();
  const [loan, setLoan] = useState(null);
  const [btcPrice, setBtcPrice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [apiErrors, setApiErrors] = useState({
    contract: false,
    emi: false
  });

  useEffect(() => {
    const fetchLoanDetails = async () => {
      try {
        // Fetch BTC price first as we'll need it regardless
        try {
          const price = await getBTCvalueInUSD();
          setBtcPrice(price);
        } catch (priceError) {
          console.error('Error fetching BTC price:', priceError);
        }

        // Try to fetch from contract API
        try {
          console.log("Attempting to fetch loan details from contract API");
          const response = await getByLoanIdAPI(id);
          console.log("Contract API response:", response);
          
          // If we get here, the API call succeeded
          // Extract loan data from the response
          if (response.result && response.result.value && response.result.value.data) {
            const data = response.result.value.data;
            const loanData = {
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
            setLoan(loanData);
            return; // Exit early if we got the data
          }
        } catch (contractError) {
          console.error("Error fetching from contract API:", contractError);
          setApiErrors(prev => ({ ...prev, contract: true }));
          // Continue to fallback
        }

        // Try to get EMI details as fallback
        try {
          console.log("Falling back to EMI calculation API for loan details");
          const emiResponse = await calculateEmi(id);
          console.log("EMI calculation response:", emiResponse);
          
          if (emiResponse) {
            const loanData = {
              principalBtc: emiResponse.principalBtc,
              amount: emiResponse.principalBtc, // For compatibility with UI
              interestRate: emiResponse.interestRate,
              timeInMonth: emiResponse.loanTimeInMonths,
              priceAtLoanTime: emiResponse.priceAtLoanTime,
              riskFactor: emiResponse.riskPercentage,
              // Use the EMI calculation fields from the response
              btcFixedMonthlyEmi: emiResponse.btcFixedMonthlyEmi,
              btcVariableMonthlyEmi: emiResponse.btcVariableMonthlyEmi,
              totalEmiInBtc: emiResponse.totalEmiInBtc,
              totalEmiInUsd: emiResponse.totalEmiInUsd,
              monthlyEmiBtc: emiResponse.totalEmiInBtc, // For compatibility with existing UI
              lateFeeCalculated: emiResponse.lateFeeCalculated,
              status: 'active' // Assume active if we can calculate EMI
            };
            setLoan(loanData);
            return; // Exit early if we got the data
          }
        } catch (emiError) {
          console.error("Error fetching EMI details:", emiError);
          setApiErrors(prev => ({ ...prev, emi: true }));
          // Continue to final fallback
        }

        // If we get here, both APIs failed
        // Create a placeholder loan object with the ID
        setLoan({
          _id: id,
          status: 'unknown',
          amount: 0,
          interestRate: 0,
          timeInMonth: 0,
          isPlaceholder: true // Flag to indicate this is a placeholder
        });
        
      } catch (error) {
        console.error('Error in loan details fetch flow:', error);
        setError('Failed to load loan details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchLoanDetails();
  }, [id]);

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

      <Motion.div
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
            {(apiErrors.contract || apiErrors.emi) && (
              <div className="mt-4 bg-yellow-500/20 backdrop-blur-sm rounded-lg px-4 py-2 inline-block">
                <span className="text-yellow-300">
                  {apiErrors.contract && apiErrors.emi 
                    ? "Note: Some loan details may be unavailable due to server issues."
                    : apiErrors.contract 
                      ? "Note: Contract details unavailable. Showing limited information."
                      : "Note: EMI calculation unavailable. Some details may be missing."}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Loan Details Card */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-xl overflow-hidden border border-gray-700">
          <div className="p-6">
            {loan.isPlaceholder ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-yellow-600/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Loan Details Unavailable</h3>
                <p className="text-gray-400 max-w-md mx-auto mb-6">
                  We're experiencing technical difficulties retrieving the details for this loan. 
                  Please try again later or contact support if the issue persists.
                </p>
                <Link
                  to="/loans/my-loans"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Return to My Loans
                </Link>
              </div>
            ) : (
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
                      <span className="text-white">{loan.amount || loan.principalBtc || 'N/A'} BTC</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">USD Value:</span>
                      <span className="text-white">
                        ${btcPrice && (loan.amount || loan.principalBtc) ? ((loan.amount || loan.principalBtc) * btcPrice).toFixed(2) : 'N/A'}
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
                      <span className="text-white">{loan.interestRate || 'N/A'}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Term Length:</span>
                      <span className="text-white">{loan.timeInMonth || 'N/A'} months</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Risk Factor:</span>
                      <span className="text-white">{loan.riskFactor || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {/* Collateral */}
                {(loan.collateralType || loan.collateralValue) && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-white">Collateral Information</h3>
                    <div className="bg-gray-700/50 p-4 rounded-lg space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Type:</span>
                        <span className="text-white">{loan.collateralType || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Value:</span>
                        <span className="text-white">${loan.collateralValue || 'N/A'}</span>
                      </div>
                      {loan.collateralValue && btcPrice && (loan.amount || loan.principalBtc) && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">LTV Ratio:</span>
                          <span className="text-white">
                            {(((loan.amount || loan.principalBtc) * (btcPrice || 0)) / loan.collateralValue * 100).toFixed(2)}%
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Payment Information */}
                {(loan.monthlyEmiBtc || loan.totalEmiInBtc) && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-white">Payment Information</h3>
                    <div className="bg-gray-700/50 p-4 rounded-lg space-y-2">
                      {loan.btcFixedMonthlyEmi !== undefined && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Fixed Monthly Payment:</span>
                          <span className="text-white">{parseFloat(loan.btcFixedMonthlyEmi).toFixed(8)} BTC</span>
                        </div>
                      )}
                      {loan.btcVariableMonthlyEmi !== undefined && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Variable Monthly Payment:</span>
                          <span className="text-white">{parseFloat(loan.btcVariableMonthlyEmi).toFixed(8)} BTC</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-400">Total Monthly Payment:</span>
                        <span className="text-white">{parseFloat(loan.totalEmiInBtc || loan.monthlyEmiBtc).toFixed(8)} BTC</span>
                      </div>
                      {btcPrice && (loan.totalEmiInUsd || (loan.totalEmiInBtc || loan.monthlyEmiBtc)) && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Payment in USD:</span>
                          <span className="text-white">
                            ${loan.totalEmiInUsd ? parseFloat(loan.totalEmiInUsd).toFixed(2) : ((loan.totalEmiInBtc || loan.monthlyEmiBtc) * btcPrice).toFixed(2)}
                          </span>
                        </div>
                      )}
                      {loan.lateFeeCalculated > 0 && (
                        <div className="flex justify-between text-red-400">
                          <span>Late Fee:</span>
                          <span>{parseFloat(loan.lateFeeCalculated).toFixed(8)} BTC</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        {!loan.isPlaceholder && (
          <div className="mt-6 flex flex-col sm:flex-row gap-4">
            <Link
              to="/loans/my-loans"
              className="flex-1 py-3 px-4 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-center transition-colors"
            >
              Back to Loans
            </Link>
            {loan.status === 'active' && (
              <Link
                to={`/loans/my-loans`}
                className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-center transition-colors"
              >
                Make Payment
              </Link>
            )}
          </div>
        )}
      </Motion.div>
    </div>
  );
};

export default LoanDetails; 