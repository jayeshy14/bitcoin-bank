import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { getMyCollateralsApi } from '../../apis/collateralApis';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [collaterals, setCollaterals] = useState([]);
  const [borrowedLoans, setBorrowedLoans] = useState([]);
  const [lendedLoans, setLendedLoans] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No token found');
        }
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        // Fetch all necessary data
        const [collateralsRes, borrowedLoansRes, lendedLoansRes] = await Promise.all([
          await getMyCollateralsApi(), '', ''
        ]);

        setCollaterals(collateralsRes);
        setBorrowedLoans(borrowedLoansRes);
        setLendedLoans(lendedLoansRes);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [logout]);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-12">
      <h1 className="text-3xl font-bold">Welcome, {user?.firstName}!</h1>

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

      {/* My Borrowed Loans Section */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">My Borrowed Loans</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {borrowedLoans.length > 0 ? (
            borrowedLoans.map((loan) => (
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
      </section>

      {/* Lended Loans Section */}
      <section>
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
      </section>
    </div>
  );
};

export default Dashboard;
