import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
// import { getAllActiveLoanApplicationsApi } from '../../apis/loanApis';

const InvestmentOpportunities = () => {
  const [loanApplications, setLoanApplications] = useState([]);

  useEffect(() => {
    const fetchLoanApplications = async () => {
      try {
        const activeLoans = await getAllActiveLoanApplicationsApi();
        setLoanApplications(activeLoans);
      } catch (error) {
        console.error('Error fetching active loan applications:', error);
      }
    };
    fetchLoanApplications();
  }, []);

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
              <h3 className="text-2xl font-bold text-yellow-300 mb-2">Loan ID: {loan._id}</h3>
              <p className="text-lg text-gray-300"><strong>Amount:</strong> <span className="text-yellow-400">{loan.amount} BTC</span></p>
              <p className="text-lg text-gray-300"><strong>Interest Rate:</strong> <span className="text-yellow-400">{loan.interestRate}%</span></p>
              <p className="text-lg text-gray-300"><strong>Risk Factor:</strong> <span className="text-yellow-400">{loan.riskFactor}</span></p>
              <p className="text-lg text-gray-300"><strong>Term:</strong> <span className="text-yellow-400">{loan.term} months</span></p>
              <p className="text-lg text-gray-300"><strong>Collateral ID:</strong> <span className="text-yellow-400">{loan.collateral}</span></p>
              <p className="text-lg font-semibold text-green-400 mt-4">Status: {loan.status}</p>
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
