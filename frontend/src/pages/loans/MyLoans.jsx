import React, { useState, useEffect } from 'react';
import axios from 'axios';

const MyLoans = () => {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLoans = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/loans/my-loans');
        setLoans(response.data);
      } catch (err) {
        console.error('Error fetching loans:', err);
        setError('Error fetching loans');
      } finally {
        setLoading(false);
      }
    };

    fetchLoans();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">My Loans</h1>
      <div className="grid gap-6">
        {loans.map(loan => (
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
              <span className={`px-3 py-1 rounded-full text-sm ${
                loan.status === 'active' ? 'bg-green-100 text-green-800' :
                loan.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                loan.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                'bg-red-100 text-red-800'
              }`}>
                {loan.status.charAt(0).toUpperCase() + loan.status.slice(1)}
              </span>
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
                <p className="text-gray-600">Next Payment</p>
                <p className="font-semibold">
                  {loan.nextPaymentDate ? new Date(loan.nextPaymentDate).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Collateral</p>
                <p className="font-semibold">{loan.collateral?.value?.amount} BTC</p>
              </div>
            </div>
            {loan.status === 'active' && (
              <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
                Make Payment
              </button>
            )}
          </div>
        ))}
        {loans.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No loans found. Apply for a loan to get started!
          </div>
        )}
      </div>
    </div>
  );
};

export default MyLoans; 