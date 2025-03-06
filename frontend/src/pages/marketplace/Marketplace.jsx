import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Marketplace = () => {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLoans = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/loans'); // Endpoint to fetch available loans
        setLoans(response.data);
      } catch (err) {
        setError('Error fetching loans: ' + err.message);
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
      <h1 className="text-3xl font-bold mb-8">Available Loans</h1>
      <div className="grid gap-6">
        {loans.map(loan => (
          <div key={loan._id} className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold">Loan #{loan._id.slice(-6)}</h2>
            <p>Amount: {loan.amount} USD</p>
            <p>Interest Rate: {loan.interestRate}%</p>
            <p>Term: {loan.term} months</p>
            <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
              Invest Now
            </button>
          </div>
        ))}
        {loans.length === 0 && <div className="text-center py-8 text-gray-500">No loans available at the moment.</div>}
      </div>
    </div>
  );
};

export default Marketplace; 