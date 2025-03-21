import React, { useState, useEffect } from 'react';
import { motion as Motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  repayLoanAPI, 
  closeLoanAPI, 
  openLoanAPI,
  getByLoanIdAPI
} from '../../apis/contractApis';
import { getBTCvalueInUSD } from '../../apis/collateralApis';
import { calculateEmi, getMyClosedLoans } from '../../apis/loanApis';

const MyLoans = () => {
  const [activeLoans, setActiveLoans] = useState({ borrowed: [], lent: [] });
  const [closedLoans, setClosedLoans] = useState({ borrowed: [], lent: [] });
  const [showActiveLoans, setShowActiveLoans] = useState(true);
  const [showLentLoans, setShowLentLoans] = useState(false);
  const [btcPrice, setBtcPrice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [processingLoanId, setProcessingLoanId] = useState(null);

  // Add status code constants
  const LOAN_STATUS = {
    CLOSED: 2001,
    OPEN: 2002
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch active loans
        const loansResponse = await getByLoanIdAPI();
        
        // Separate active and closed loans for both borrowed and lent
        const activeLoans = {
          borrowed: loansResponse.result.borrowed.filter(loan => loan.status === LOAN_STATUS.OPEN) || [],
          lent: loansResponse.result.lent.filter(loan => loan.status === LOAN_STATUS.OPEN) || []
        };
        setActiveLoans(activeLoans);
        
        // Set closed loans from the same response
        const closedLoans = {
          borrowed: loansResponse.result.borrowed.filter(loan => loan.status === LOAN_STATUS.CLOSED) || [],
          lent: loansResponse.result.lent.filter(loan => loan.status === LOAN_STATUS.CLOSED) || []
        };
        setClosedLoans(closedLoans);
        
        // Fetch BTC price
        const price = await getBTCvalueInUSD();
        setBtcPrice(price);
      } catch (error) {
        console.error('Failed to fetch data:', error);
        setError('Failed to load your loans. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handleRepayLoan = async (loan) => {
    setProcessingLoanId(loan.databaseId);
    setError('');
    setSuccess('');
    
    try {
      // First get the EMI calculation using contract loan ID
      const emiData = await calculateEmi(loan.databaseId);
      console.log("EMI data:", emiData);
      
      const repayData = {
        loanID: loan.databaseId, // Use database ID for database operations
        currentPrice: btcPrice,
        amountInBTC: emiData.totalEmiInBtc
      };
      console.log("Repay data:", repayData);
      await repayLoanAPI(repayData);
      setSuccess(`Successfully repaid loan ${loan.databaseId}`);
      
      // Refresh loans list
      const updatedLoans = await getByLoanIdAPI();
      setActiveLoans(updatedLoans.result || []);
    } catch (err) {
      setError(`Failed to repay loan: ${err}`);
    } finally {
      setProcessingLoanId(null);
    }
  };

  const handleCloseLoan = async (loanId) => {
    setProcessingLoanId(loanId);
    setError('');
    setSuccess('');
    
    try {
      await closeLoanAPI(loanId);
      setSuccess(`Successfully closed loan ${loanId}`);
      
      // Refresh loans lists
      const updatedActiveLoans = await getByLoanIdAPI();
      setActiveLoans(updatedActiveLoans.result || []);
      
      const updatedClosedLoans = await getMyClosedLoans();
      setClosedLoans(updatedClosedLoans || []);
    } catch (err) {
      setError(`Failed to close loan: ${err.message}`);
    } finally {
      setProcessingLoanId(null);
    }
  };

  const handleOpenLoan = async (loanId) => {
    setProcessingLoanId(loanId);
    setError('');
    setSuccess('');
    
    try {
      await openLoanAPI(loanId);
      setSuccess(`Successfully opened loan ${loanId}`);
      
      // Refresh loans lists
      const updatedActiveLoans = await getByLoanIdAPI();
      setActiveLoans(updatedActiveLoans.result || []);
      
      const updatedClosedLoans = await getMyClosedLoans();
      setClosedLoans(updatedClosedLoans || []);
    } catch (err) {
      setError(`Failed to open loan: ${err.message}`);
    } finally {
      setProcessingLoanId(null);
    }
  };

  // Get the loans to display based on active/closed and borrowed/lent selection
  const getLoansToDisplay = () => {
    const loansSet = showActiveLoans ? activeLoans : closedLoans;
    return showLentLoans ? loansSet.lent : loansSet.borrowed;
  };

  // Update the loan card rendering to use the new data structure
  const renderLoanCard = (loan, index) => (
    <Motion.div
      key={loan.databaseId}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-xl overflow-hidden border border-gray-700"
    >
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold text-white">
              {showLentLoans ? 'Loan to' : 'Loan from'} #{loan.contractLoanId}
            </h3>
            <Link 
              to={`/loans/${loan.databaseId}`}
              className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
            >
              View Details
            </Link>
          </div>
          <div className="flex items-center space-x-2">
            {loan.status === LOAN_STATUS.OPEN && (
              <button
                onClick={() => handleCloseLoan(loan.databaseId)}
                disabled={processingLoanId === loan.databaseId}
                className="p-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
            {loan.status === LOAN_STATUS.CLOSED && (
              <button
                onClick={() => handleOpenLoan(loan.databaseId)}
                disabled={processingLoanId === loan.databaseId}
                className="p-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
              </button>
            )}
          </div>
        </div>

        <div className="space-y-4">
          {/* Loan Amount */}
          <div className="bg-gray-700/50 p-4 rounded-lg">
            <div className="flex justify-between items-baseline">
              <span className="text-gray-400">Principal Amount:</span>
              <div className="text-right">
                <div className="text-lg font-bold text-white">{loan.amountInBTC.toFixed(8)} BTC</div>
                <div className="text-sm text-gray-400">
                  ${loan.amountInUSD.toFixed(2)}
                </div>
              </div>
            </div>
          </div>

          {/* Repayment Amount */}
          <div className="bg-gray-700/50 p-4 rounded-lg">
            <div className="flex justify-between items-baseline">
              <span className="text-gray-400">Total Repaid:</span>
              <div className="text-right">
                <div className="text-lg font-bold text-white">{loan.totalRepaymentInBTC.toFixed(8)} BTC</div>
                <div className="text-sm text-gray-400">
                  ${loan.totalRepaymentInUSD.toFixed(2)}
                </div>
              </div>
            </div>
          </div>

          {/* Loan Details Grid */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gray-700/50 p-3 rounded-lg">
              <div className="text-xs text-gray-400">Interest Rate</div>
              <div className="text-white font-medium">{loan.interestRate}%</div>
            </div>
            <div className="bg-gray-700/50 p-3 rounded-lg">
              <div className="text-xs text-gray-400">Risk Factor</div>
              <div className="text-white font-medium">{loan.riskFactor}%</div>
            </div>
            <div className="bg-gray-700/50 p-3 rounded-lg">
              <div className="text-xs text-gray-400">Term</div>
              <div className="text-white font-medium">{loan.timeInMonth} months</div>
            </div>
          </div>

          {/* Repay Button - Only show for borrowed loans */}
          {loan.status === LOAN_STATUS.OPEN && !showLentLoans && (
            <button
              onClick={() => handleRepayLoan(loan)}
              disabled={processingLoanId === loan.databaseId}
              className="w-full py-2 px-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white rounded-lg transition-colors"
            >
              {processingLoanId === loan.databaseId ? 'Processing...' : 'Make Payment'}
            </button>
          )}
        </div>
      </div>
    </Motion.div>
  );

  return (
    <div className="w-full px-4 py-8 sm:px-6 lg:px-8">
      <Motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="relative mb-8 overflow-hidden rounded-2xl">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-900 opacity-90"></div>
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1639322537228-f710d846310a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80')] bg-cover bg-center mix-blend-overlay"></div>
          <div className="relative z-10 px-8 py-12">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">My Loans</h1>
            <p className="text-gray-200">
              Manage your active loans and view your loan history
            </p>
          </div>
        </div>

        {/* Updated Tabs */}
        <div className="flex flex-col space-y-4 mb-6">
          {/* Active/Closed Toggle */}
          <div className="flex border-b border-gray-700">
            <button
              className={`px-4 py-2 font-medium ${
                showActiveLoans
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
              onClick={() => setShowActiveLoans(true)}
            >
              Active Loans ({activeLoans.borrowed.length + activeLoans.lent.length})
            </button>
            <button
              className={`px-4 py-2 font-medium ${
                !showActiveLoans
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
              onClick={() => setShowActiveLoans(false)}
            >
              Closed Loans ({closedLoans.borrowed.length + closedLoans.lent.length})
            </button>
          </div>

          {/* Borrowed/Lent Toggle */}
          <div className="flex border-b border-gray-700">
            <button
              className={`px-4 py-2 font-medium ${
                !showLentLoans
                  ? 'text-purple-400 border-b-2 border-purple-400'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
              onClick={() => setShowLentLoans(false)}
            >
              Borrowed Loans ({showActiveLoans ? activeLoans.borrowed.length : closedLoans.borrowed.length})
            </button>
            <button
              className={`px-4 py-2 font-medium ${
                showLentLoans
                  ? 'text-purple-400 border-b-2 border-purple-400'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
              onClick={() => setShowLentLoans(true)}
            >
              Lent Loans ({showActiveLoans ? activeLoans.lent.length : closedLoans.lent.length})
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <Motion.div
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
          </Motion.div>
        )}

        {/* Success Message */}
        {success && (
          <Motion.div
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
          </Motion.div>
        )}

        {/* Main Content */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="relative w-24 h-24">
              <div className="absolute w-full h-full border-4 border-gray-200 rounded-full"></div>
              <div className="absolute w-full h-full border-4 border-t-transparent border-r-transparent border-blue-500 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-medium text-gray-400">Loading</span>
              </div>
            </div>
          </div>
        ) : getLoansToDisplay().length === 0 ? (
          <Motion.div
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
            <h3 className="text-xl font-medium text-gray-200 mb-2">
              No {showActiveLoans ? 'Active' : 'Closed'} {showLentLoans ? 'Lent' : 'Borrowed'} Loans
            </h3>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">
              {showLentLoans
                ? "You haven't lent any Bitcoin yet. Check out investment opportunities to start lending."
                : "You don't have any active loans at the moment. Apply for a loan to get started."}
            </p>
            {!showLentLoans && (
              <Link
                to="/borrow"
                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                Apply for a Loan
              </Link>
            )}
            {showLentLoans && (
              <Link
                to="/lend"
                className="inline-flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                View Investment Opportunities
              </Link>
            )}
          </Motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {getLoansToDisplay().map((loan, index) => renderLoanCard(loan, index))}
          </div>
        )}
      </Motion.div>
    </div>
  );
};

export default MyLoans; 