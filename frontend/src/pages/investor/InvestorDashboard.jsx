import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { calculateRewards } from '../../services/rewardService';

const InvestorDashboard = () => {
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rewards, setRewards] = useState(0);

  useEffect(() => {
    const fetchInvestments = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/investor/my-investments');
        setInvestments(response.data);

        // Calculate rewards for the investor
        const totalRewards = await calculateRewards(response.data[0].lender); // Assuming lender ID is the investor ID
        setRewards(totalRewards);
      } catch (err) {
        setError('Error fetching investments: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchInvestments();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">My Investments</h1>
      <p className="text-lg mb-4">Total Rewards: {rewards.toFixed(2)} USD</p>
      <div className="grid gap-6">
        {investments.map(investment => (
          <div key={investment._id} className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold">Investment #{investment._id.slice(-6)}</h2>
            <p>Amount: {investment.amount} USD</p>
            <p>Status: {investment.status}</p>
            <p>Expected Return: {(investment.amount * (1 + investment.interestRate / 100)).toFixed(2)} USD</p>
            <p>Next Payment Due: {investment.nextPaymentDate ? new Date(investment.nextPaymentDate).toLocaleDateString() : 'N/A'}</p>
          </div>
        ))}
        {investments.length === 0 && <div className="text-center py-8 text-gray-500">No investments found.</div>}
      </div>
    </div>
  );
};

export default InvestorDashboard; 