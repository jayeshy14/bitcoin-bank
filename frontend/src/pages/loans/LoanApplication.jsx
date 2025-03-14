import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { createLoanApplicationApi } from '../../apis/loanApis'; 
import { getMyCollateralsApi } from '../../apis/collateralApis';

const LoanApplicationForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    amount: '',
    interestRate: '',
    riskFactor: '',
    term: '',
    collateralId: '',
  });
  
  const [collaterals, setCollaterals] = useState([]);

  useEffect(() => {
    const fetchMyCollaterals = async () => {
      try {
        const myCollaterals = await getMyCollateralsApi();
        setCollaterals(myCollaterals);
      } catch (error) {
        console.error('Failed to fetch collaterals:', error);
      }
    };
    fetchMyCollaterals();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await createLoanApplicationApi(formData);
      alert(data.message);
    } catch (error) {
      alert(error?.data?.error || 'Error submitting loan application');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8 bg-gray-800 text-gray-100 rounded-lg shadow-lg">
      <motion.h2 
        className="text-3xl font-bold mb-6 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        Apply for a Bitcoin Loan
      </motion.h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        {['amount', 'interestRate', 'riskFactor', 'term'].map((field, index) => (
          <div key={index}>
            <label className="block mb-2 capitalize">{field}</label>
            <input 
              type="text"
              name={field}
              value={formData[field]}
              onChange={handleChange}
              required
              className="w-full p-3 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        ))}
        <div>
          <label className="block mb-2">Collateral</label>
          <select 
            name="collateralId" 
            value={formData.collateralId} 
            onChange={handleChange} 
            required
            className="w-full p-3 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Collateral</option>
            {collaterals.map((collateral) => (
              <option key={collateral._id} value={collateral._id}>
                {`Collateral ${collateral._id}`}
              </option>
            ))}
          </select>
        </div>
        <motion.button 
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-lg font-semibold shadow-lg"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Submit Application
        </motion.button>
      </form>
    </div>
  );
};

export default LoanApplicationForm;
