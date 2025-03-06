import React, { useState, useEffect } from 'react';
import axios from 'axios';

const MyInvestments = () => {
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchInvestments = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/investor/my-investments');
        setInvestments(response.data);
      } catch (err) {
        setError('Error fetching investments');
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
      <div className="grid gap-6">
        {investments.map(investment => (
          <div key={investment._id} className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-semibold">
                  Loan #{investment._id.slice(-6)}
                </h2>
                <p className="text-gray-600">
                  Amount: {investment.amount} USD
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm ${
                investment.status === 'active' ? 'bg-green-100 text-green-800' :
                investment.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                'bg-red-100 text-red-800'
              }`}>
                {investment.status.charAt(0).toUpperCase() + investment.status.slice(1)}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-gray-600">Term</p>
                <p className="font-semibold">{investment.term} months</p>
              </div>
              <div>
                <p className="text-gray-600">Interest Rate</p>
                <p className="font-semibold">{investment.interestRate}%</p>
              </div>
              <div>
                <p className="text-gray-600">Expected Return</p>
                <p className="font-semibold">
                  {(investment.amount * (1 + investment.interestRate / 100)).toFixed(2)} USD
                </p>
              </div>
              <div>
                <p className="text-gray-600">Next Payment</p>
                <p className="font-semibold">
                  {investment.nextPaymentDate ? new Date(investment.nextPaymentDate).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
            {investment.status === 'completed' && (
              <button
                className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                onClick={() => handleWithdraw(investment._id)}
              >
                Withdraw Funds
              </button>
            )}
          </div>
        ))}
        {investments.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No investments found. Start investing to grow your portfolio!
          </div>
        )}
      </div>
    </div>
  );
};

export default MyInvestments; 