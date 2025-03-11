import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({
    totalLoans: 0,
    activeLoans: 0,
    totalCollateral: 0,
    totalInvestments: 0,
    activeInvestments: 0,
    totalReturns: 0,
    nextPayment: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token'); // Get the token from local storage
        if (!token) {
          throw new Error('No token found'); // Handle case where token is missing
        }
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`; // Set the token in the header

        const response = await axios.get('http://localhost:3000/api/dashboard/stats');
        setStats(response.data);
      } catch (err) {
        console.error('Error fetching dashboard data:', err); // Log the error for debugging
        if (err.response && err.response.status === 401) {
          setError('Unauthorized access. Please log in again.'); // Specific error message for 401
          alert('Session expired. Please log in again.'); // Notify user about session expiration
          logout(); // Log the user out if unauthorized
        } else {
          setError('Error fetching dashboard data'); // General error message
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [logout]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  const BorrowerDashboard = () => (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">My Borrowing Overview</h2>
        <Link
          to="/loans/apply"
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
        >
          Apply for Loan
        </Link>
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Active Loans</h3>
          <p className="text-2xl font-bold">{stats.activeLoans}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Total Collateral</h3>
          <p className="text-2xl font-bold">{stats.totalCollateral} BTC</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Next Payment Due</h3>
          <p className="text-2xl font-bold">
            {stats.nextPayment ? new Date(stats.nextPayment).toLocaleDateString() : 'N/A'}
          </p>
        </div>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Recent Loans</h2>
        {/* Add recent loans list component */}
      </div>
    </div>
  );

  const InvestorDashboard = () => (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">My Investment Overview</h2>
        <Link
          to="/investor/opportunities"
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
        >
          View Opportunities
        </Link>
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Active Investments</h3>
          <p className="text-2xl font-bold">{stats.activeInvestments}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Total Invested</h3>
          <p className="text-2xl font-bold">${stats.totalInvestments}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Total Returns</h3>
          <p className="text-2xl font-bold">${stats.totalReturns}</p>
        </div>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Investment Portfolio</h2>
        {/* Add investment portfolio component */}
      </div>
    </div>
  );

  return (
    <div className="space-y-12">
      <h1 className="text-3xl font-bold">Welcome, {user.firstName}!</h1>
      
      {<BorrowerDashboard />}
      
      {<InvestorDashboard />}
    </div>
  );
};

export default Dashboard; 