import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const LoanApplication = () => {
  const [formData, setFormData] = useState({
    amount: '',
    term: '3',
    purpose: '',
    collateralAmount: '',
    bitcoinAddress: '',
    loanType: 'platform'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await axios.post('http://localhost:3000/api/loans/apply', formData);
      navigate('/loans/my-loans');
    } catch (err) {
      console.error('Error submitting loan application:', err);
      setError(err.response?.data?.error || 'Error submitting loan application');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Apply for a Loan</h1>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-gray-700 mb-2">Loan Amount (USD)</label>
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
            required
            min="1000"
          />
        </div>
        <div>
          <label className="block text-gray-700 mb-2">Loan Term (months)</label>
          <select
            name="term"
            value={formData.term}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
          >
            <option value="3">3 months</option>
            <option value="6">6 months</option>
            <option value="12">12 months</option>
          </select>
        </div>
        <div>
          <label className="block text-gray-700 mb-2">Loan Purpose</label>
          <textarea
            name="purpose"
            value={formData.purpose}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
            rows="3"
            required
          />
        </div>
        <div>
          <label className="block text-gray-700 mb-2">Collateral Amount (BTC)</label>
          <input
            type="number"
            name="collateralAmount"
            value={formData.collateralAmount}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
            required
            step="0.00000001"
          />
        </div>
        <div>
          <label className="block text-gray-700 mb-2">Bitcoin Address</label>
          <input
            type="text"
            name="bitcoinAddress"
            value={formData.bitcoinAddress}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-gray-700 mb-2">Loan Type</label>
          <select
            name="loanType"
            value={formData.loanType}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
          >
            <option value="platform">Platform-backed Loan</option>
            <option value="p2p">Peer-to-Peer Loan</option>
          </select>
        </div>
        <button
          type="submit"
          disabled={loading}
          className={`w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition duration-200 ${
            loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {loading ? 'Submitting...' : 'Submit Application'}
        </button>
      </form>
    </div>
  );
};

export default LoanApplication; 