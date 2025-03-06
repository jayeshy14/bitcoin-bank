import React, { useState, useEffect } from 'react';
import axios from 'axios';

const InvestmentOpportunities = () => {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOpportunities = async () => {
      console.log('Fetching investment opportunities...');
      try {
        const response = await axios.get('http://localhost:3000/api/investor/opportunities');
        console.log('Response:', response.data);
        setOpportunities(response.data);
      } catch (err) {
        console.error('Error fetching investment opportunities:', err);
        if (err.response && err.response.status === 403) {
          setError('You do not have permission to access this resource. Please check your account role.');
        } else {
          setError('Error fetching investment opportunities: ' + err.message);
        }
      } finally {
        setLoading(false);
        console.log('Loading state set to false');
      }
    };

    fetchOpportunities();
  }, []);

  const handleInvest = async (loanId) => {
    try {
      await axios.post(`http://localhost:3000/api/investor/invest/${loanId}`);
      // Remove the invested opportunity from the list
      setOpportunities(opportunities.filter(opp => opp._id !== loanId));
    } catch (err) {
      setError('Error processing investment: ' + err.message);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Investment Opportunities</h1>
      <div className="grid gap-6">
        {opportunities.map(loan => (
          <div key={loan._id} className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-semibold">
                  Loan #{loan._id.slice(-6)}
                </h2>
                <p className="text-gray-600">
                  Amount: {loan.amount} USD
                </p>
              </div>
              <div className="text-right">
                <p className="text-gray-600">Risk Score</p>
                <p className={`font-semibold ${
                  loan.riskScore >= 80 ? 'text-green-600' :
                  loan.riskScore >= 60 ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {loan.riskScore}/100
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-gray-600">Term</p>
                <p className="font-semibold">{loan.term} months</p>
              </div>
              <div>
                <p className="text-gray-600">Interest Rate</p>
                <p className="font-semibold">{loan.interestRate}%</p>
              </div>
              <div>
                <p className="text-gray-600">Collateral</p>
                <p className="font-semibold">{loan.collateral?.value?.amount} BTC</p>
              </div>
              <div>
                <p className="text-gray-600">LTV Ratio</p>
                <p className="font-semibold">
                  {((loan.amount / (loan.collateral?.value?.amount * 30000)) * 100).toFixed(2)}%
                </p>
              </div>
            </div>
            <button
              onClick={() => handleInvest(loan._id)}
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            >
              Invest Now
            </button>
          </div>
        ))}
        {opportunities.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No investment opportunities available at the moment.
          </div>
        )}
      </div>
    </div>
  );
};

export default InvestmentOpportunities;