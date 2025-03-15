import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { motion } from 'framer-motion';
import { getMyCollateralsApi } from '../../apis/collateralApis';
import { getMyPendingApplicationsApi } from '../../apis/loanApis';
import { getOffChainBalance, getOnChainBalance } from '../../../../backend/controllers/contractController';
import { getBalanceAPI } from '../../apis/contractApis';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [collaterals, setCollaterals] = useState([]);
  const [loanApplications, setLoanApplications] = useState([]);
  const [onChainBalance, setOnChainBalance] = useState(null)
  const [offChainBalance, setOffChainBalance] = useState(null)
  const [Balance, setBalance] = useState(null)


  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const collaterals = await getMyCollateralsApi();
        setCollaterals(collaterals);

        const loanApplications = await getMyPendingApplicationsApi();
        setLoanApplications(loanApplications);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [logout]);

  useEffect(() => {
    const fetchBalance = async () => {

      try {

        const getOffChainBalance = await getOffChainBalance();
        const getOnChainBalance = await getOnChainBalance();
        const totalBalance = await getBalanceAPI();
        console.log("balances: ",getOffChainBalance, getOnChainBalance, totalBalance );
      } catch (error) {
        console.error("error getting balance, ",error);
      }
        
    }

    fetchBalance();
  })

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-12">
      <h1 className="text-3xl font-bold">Welcome, {user?.firstName}!</h1>

      <section>
        <h2 className="text-2xl font-semibold mb-4">My Balance</h2>

      </section>

      {/* My Collaterals Section */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">My Collaterals</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {collaterals.length > 0 ? (
            collaterals.map((collateral) => (
              <div key={collateral._id} className="p-6 bg-gray-800 rounded-lg shadow-lg">
                <h3 className="text-xl font-bold">{collateral.type.toUpperCase()}</h3>
                <p>Value: ${collateral.value.toFixed(2)}</p>
                <p>Status: {collateral.status}</p>
                {collateral.loanAssociation && <p>Associated Loan ID: {collateral.loanAssociation}</p>}
              </div>
            ))
          ) : (
            <p>No collaterals found.</p>
          )}
        </div>
      </section>

      {/* My unfulfilled Loans*/}
      <section>
        <h2 className='text-2xl font-semibold mb-4'>My Pending Loan Applications</h2>
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
      </section>

      {/* My Borrowed Loans Section */}
      {/* <section>
        <h2 className="text-2xl font-semibold mb-4">Borrowed Loans</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {borrowedLoans?.length > 0 ? (
            borrowedLoans?.map((loan) => (
              <div key={loan._id} className="p-6 bg-gray-800 rounded-lg shadow-lg">
                <h3 className="text-xl font-bold">Loan ID: {loan._id}</h3>
                <p>Amount: ${loan.amount}</p>
                <p>Term: {loan.term} months</p>
                <p>Status: {loan.status}</p>
              </div>
            ))
          ) : (
            <p>No borrowed loans found.</p>
          )}
        </div>
      </section> */}

      {/* Lended Loans Section */}
      {/* <section>
        <h2 className="text-2xl font-semibold mb-4">Lended Loans</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lendedLoans.length > 0 ? (
            lendedLoans.map((loan) => (
              <div key={loan._id} className="p-6 bg-gray-800 rounded-lg shadow-lg">
                <h3 className="text-xl font-bold">Loan ID: {loan._id}</h3>
                <p>Amount: ${loan.amount}</p>
                <p>Borrower: {loan.borrower?.firstName} {loan.borrower?.lastName}</p>
                <p>Status: {loan.status}</p>
              </div>
            ))
          ) : (
            <p>No lended loans found.</p>
          )}
        </div>
      </section> */}
    </div>
  );
};

export default Dashboard;
