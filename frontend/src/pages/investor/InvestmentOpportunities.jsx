import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { investmentOpportunitiesApi } from '../../apis/loanApis';
import { getBTCvalueInUSD, getCollateralDetailsApi } from '../../apis/collateralApis';
import { issueLoanAPI } from '../../apis/contractApis';

const InvestmentOpportunities = () => {
  const [loanApplications, setLoanApplications] = useState([]);
  const [BtcValue, setBtcValue ] = useState(null);
  const [LoanData, setLoanData ] = useState(null);

  useEffect(() => {
    const fetchLoanApplications = async () => {
      try {
        const activeLoans = await investmentOpportunitiesApi();
        setLoanApplications(activeLoans);
      } catch (error) {
        console.error('Error fetching active loan applications:', error);
      }
    };
    fetchLoanApplications();
  }, []);

  useEffect(() => {
    const fetchBTCPrice = async() => {
      try {
        const data = await getBTCvalueInUSD();
        console.log("btc price", data)
        setBtcValue(data);
      } catch (error) {
        console.log('Error fetching btc price', error);
      }
    };
    fetchBTCPrice();
  })

  const handleSumblitClick = async (loanData) => {

    try {
      const collateralDetails = await getCollateralDetailsApi(loanData.collateral);
      const collateralType = collateralDetails.type === "gold"  ? 1001 : 1002;
      const amountInBTC = loanData.amount / BtcValue;
      loanData = {
        ...loanData,
        collateralType,
        collateralValue: Math.round(collateralDetails.value),
        amountInBTC,
        loanType: 0o1,
        priceAtLoanTime: Math.round(BtcValue)
      }
      console.log("loan", loanData);

      await issueLoanAPI(loanData);
    } catch (e) {
      console.log("error loan", e);
    }
  }

  return (
    <div className="min-w-lg mx-auto p-8 bg-gray-900 text-gray-100 rounded-lg shadow-xl border border-gray-700">
      <motion.h2 
        className="text-4xl font-extrabold mb-8 text-center text-yellow-400 uppercase tracking-wider"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        Active Loan Applications
      </motion.h2>
      {loanApplications.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loanApplications.map((loan) => (
            <motion.div 
              key={loan._id} 
              className="p-6 bg-gray-800 rounded-xl shadow-lg border border-gray-600 transition-transform transform hover:scale-105"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <h3 className="text-2xl font-bold text-yellow-300 mb-2 break-all">Loan ID: {loan._id}</h3>
              <p className="text-lg text-gray-300"><strong>Amount (BTC):</strong> <span className="text-yellow-400">{loan.amount / BtcValue} BTC</span></p>
              <p className="text-lg text-gray-300"><strong>Amount (USD):</strong> <span className="text-yellow-400">{loan.amount } USD</span></p>
              <p className="text-lg text-gray-300"><strong>Interest Rate:</strong> <span className="text-yellow-400">{loan.interestRate}%</span></p>
              <p className="text-lg text-gray-300"><strong>Risk Factor:</strong> <span className="text-yellow-400">{loan.riskFactor}</span></p>
              <p className="text-lg text-gray-300"><strong>Term:</strong> <span className="text-yellow-400">{loan.term} months</span></p>
              <p className="text-lg text-gray-300"><strong>Collateral ID:</strong> <span className="text-yellow-400">{loan.collateral}</span></p>
              <p className="text-lg font-semibold text-green-400 mt-4">Status: {loan.status}</p>
              <button onClick={() => handleSumblitClick(loan)} className="cursor-pointer p-2 bg-yellow-400 text-black font-bold rounded hover:bg-red-500">Give loan</button>
            </motion.div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-400 text-lg mt-6">No active loan applications available.</p>
      )}
    </div>
  );
};

export default InvestmentOpportunities;
