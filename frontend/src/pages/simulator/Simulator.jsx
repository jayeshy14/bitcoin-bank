import React, { useState } from "react";
import { motion } from "framer-motion";
import { simulateEmi } from "../../apis/loanApis";

function Simulator() {
  const [formData, setFormData] = useState({
    principalBtc: "",
    priceAtLoanTime: "",
    monthlyInterestRate: "",
    riskPercentage: "",
    loanTimeInMonths: "",
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const numericFormData = Object.fromEntries(
        Object.entries(formData).map(([key, value]) => [key, parseFloat(value)])
      );

      const result = await simulateEmi(numericFormData);
      setResult(result);
    } catch (err) {
      setError("An error occurred while simulating the loan.");
    }

    setLoading(false);
  };

  return (
    <div className="min-w-lg mx-auto p-8 bg-gray-800 text-gray-100 rounded-lg shadow-lg">
      {!result ? (
        <>
          <motion.h2
            className="text-3xl font-bold mb-6 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            Bitcoin Loan Simulator
          </motion.h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {Object.keys(formData).map((key) => (
              <div key={key}>
                <label className="block mb-2 capitalize">
                  {key.replace(/([A-Z])/g, " $1")}
                </label>
                <input
                  type="number"
                  name={key}
                  value={formData[key]}
                  onChange={handleChange}
                  required
                  className="w-full p-3 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            ))}

            <motion.button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-lg font-semibold shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={loading}
            >
              {loading ? "Calculating..." : "Simulate Loan"}
            </motion.button>
          </form>

          {error && <p className="text-red-500 mt-4">{error}</p>}
        </>
      ) : (
        <div className="mt-6 p-6 bg-gray-700 rounded-lg shadow-lg">
          <h3 className="text-2xl font-semibold mb-4 text-center">Simulation Result</h3>
          <div className="space-y-2">
            <p><strong>Total Repayment (USD):</strong> ${result.totalRepaymentInUsd.toFixed(2)}</p>
            <p><strong>Total Repayment (BTC):</strong> {result.totalRepaymentInBtc.toFixed(8)} BTC</p>
            <p><strong>Fixed EMI (Sats):</strong> {result.totalFixedEmiSats.toLocaleString()}</p>
            <p><strong>Variable EMI (Sats):</strong> {result.totalVariableEmiSats.toLocaleString()}</p>
          </div>

          <h4 className="text-xl font-semibold mt-4">Monthly Breakdown</h4>
          <div className="max-h-64 overflow-y-auto mt-2 p-2 bg-gray-800 rounded">
            {result.months.map((month, index) => (
              <div key={index} className="p-2 border-b border-gray-600">
                <p><strong>Month {month.month}</strong></p>
                <p>BTC Price: ${month.btcPrice.toLocaleString()}</p>
                <p>Monthly EMI (BTC): {month.monthlyEmiBtc.toFixed(8)}</p>
                <p>Monthly EMI (USD): ${month.monthlyEmiUsd.toFixed(2)}</p>
              </div>
            ))}
          </div>

          <motion.button
            onClick={() => setResult(null)}
            className="w-full mt-6 bg-red-600 hover:bg-red-700 py-3 rounded-lg font-semibold shadow-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Recalculate
          </motion.button>
        </div>
      )}
    </div>
  );
}

export default Simulator;