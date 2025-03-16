import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { simulateEmi } from "../../apis/loanApis";
import { getBTCvalueInUSD } from "../../apis/collateralApis";

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
  const [btcPrice, setBtcPrice] = useState(null);

  // Fetch current BTC price
  useEffect(() => {
    const fetchBTCPrice = async () => {
      try {
        const price = await getBTCvalueInUSD();
        setBtcPrice(price);
        
        // Pre-fill the price field if available
        if (price && !formData.priceAtLoanTime) {
          setFormData(prev => ({
            ...prev,
            priceAtLoanTime: price.toString()
          }));
        }
      } catch (err) {
        console.error("Error fetching BTC price:", err);
      }
    };
    
    fetchBTCPrice();
  }, []);

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
      console.error("Simulation error:", err);
    }

    setLoading(false);
  };

  // Helper function to format field labels
  const formatFieldLabel = (key) => {
    const formatted = key
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase());
    
    // Special cases
    if (key === "principalBtc") return "Principal Amount (BTC)";
    if (key === "priceAtLoanTime") return "BTC Price (USD)";
    if (key === "monthlyInterestRate") return "Monthly Interest Rate (%)";
    if (key === "riskPercentage") return "Risk Percentage (%)";
    if (key === "loanTimeInMonths") return "Loan Term (Months)";
    
    return formatted;
  };

  // Helper function to get field description
  const getFieldDescription = (key) => {
    switch(key) {
      case "principalBtc":
        return "The amount of Bitcoin you wish to borrow";
      case "priceAtLoanTime":
        return "Current Bitcoin price in USD";
      case "monthlyInterestRate":
        return "Monthly interest rate applied to your loan";
      case "riskPercentage":
        return "Risk factor affecting your loan terms";
      case "loanTimeInMonths":
        return "Duration of your loan in months";
      default:
        return "";
    }
  };

  return (
    <div className="w-full px-4 py-8 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full"
      >
        {/* Header */}
        <div className="relative mb-8 overflow-hidden rounded-2xl">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-900 opacity-90"></div>
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1639322537228-f710d846310a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80')] bg-cover bg-center mix-blend-overlay"></div>
          <div className="relative z-10 px-8 py-12">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">Bitcoin Loan Simulator</h1>
            <p className="text-gray-200 max-w-3xl">
              Estimate your loan payments and see how Bitcoin price fluctuations might affect your repayment schedule over time.
            </p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8 p-4 bg-gradient-to-r from-red-500/20 to-pink-500/20 border border-red-500/50 rounded-xl"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-400">{error}</p>
              </div>
            </div>
          </motion.div>
        )}

        {!result ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-xl overflow-hidden border border-gray-700"
          >
            <div className="p-6 md:p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Object.keys(formData).map((key, index) => (
                    <motion.div 
                      key={key}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.1 * index }}
                      className="space-y-2"
                    >
                      <label className="block text-gray-300 text-sm font-medium">
                        {formatFieldLabel(key)}
                      </label>
                      <div className="relative">
                        {key === "principalBtc" && (
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-400">₿</span>
                          </div>
                        )}
                        {key === "priceAtLoanTime" && (
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-400">$</span>
                          </div>
                        )}
                        {(key === "monthlyInterestRate" || key === "riskPercentage") && (
                          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <span className="text-gray-400">%</span>
                          </div>
                        )}
                        <input
                          type="number"
                          name={key}
                          value={formData[key]}
                          onChange={handleChange}
                          required
                          step={key === "principalBtc" ? "0.00000001" : "0.01"}
                          placeholder={key === "priceAtLoanTime" && btcPrice ? btcPrice.toString() : ""}
                          className={`w-full p-3 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white ${
                            (key === "principalBtc" || key === "priceAtLoanTime") ? "pl-10" : ""
                          } ${
                            (key === "monthlyInterestRate" || key === "riskPercentage") ? "pr-8" : ""
                          }`}
                        />
                      </div>
                      <p className="text-xs text-gray-400">{getFieldDescription(key)}</p>
                    </motion.div>
                  ))}
                </div>

                <div className="pt-4">
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={loading}
                    className="w-full py-3 px-4 rounded-lg text-white font-medium shadow-lg transition-all duration-200 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Simulating...
                      </div>
                    ) : (
                      "Simulate Loan"
                    )}
                  </motion.button>
                </div>
              </form>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-xl overflow-hidden border border-gray-700"
          >
            <div className="p-6 md:p-8">
              <h3 className="text-2xl font-bold text-white mb-6 text-center">Loan Simulation Results</h3>
              
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="bg-gradient-to-br from-blue-900/40 to-blue-800/40 p-4 rounded-lg border border-blue-700/50">
                  <h4 className="text-blue-300 text-sm font-medium mb-1">Total Repayment (USD)</h4>
                  <p className="text-2xl font-bold text-white">${result.totalRepaymentInUsd.toFixed(2)}</p>
                </div>
                
                <div className="bg-gradient-to-br from-purple-900/40 to-purple-800/40 p-4 rounded-lg border border-purple-700/50">
                  <h4 className="text-purple-300 text-sm font-medium mb-1">Total Repayment (BTC)</h4>
                  <p className="text-2xl font-bold text-white">{result.totalRepaymentInBtc.toFixed(8)} BTC</p>
                </div>
                
                <div className="bg-gradient-to-br from-green-900/40 to-green-800/40 p-4 rounded-lg border border-green-700/50">
                  <h4 className="text-green-300 text-sm font-medium mb-1">Fixed EMI (Sats)</h4>
                  <p className="text-2xl font-bold text-white">{result.totalFixedEmiSats.toLocaleString()}</p>
                </div>
                
                <div className="bg-gradient-to-br from-amber-900/40 to-amber-800/40 p-4 rounded-lg border border-amber-700/50">
                  <h4 className="text-amber-300 text-sm font-medium mb-1">Variable EMI (Sats)</h4>
                  <p className="text-2xl font-bold text-white">{result.totalVariableEmiSats.toLocaleString()}</p>
                </div>
              </div>
              
              {/* Monthly Breakdown */}
              <div className="mb-6">
                <h4 className="text-xl font-semibold text-white mb-4">Monthly Repayment Schedule</h4>
                <div className="bg-gray-900/50 rounded-lg border border-gray-700 overflow-hidden">
                  {/* Table Header */}
                  <div className="grid grid-cols-4 gap-2 p-3 border-b border-gray-700 bg-gray-800/80 text-gray-300 text-sm font-medium">
                    <div>Month</div>
                    <div>BTC Price</div>
                    <div>EMI (BTC)</div>
                    <div>EMI (USD)</div>
                  </div>
                  
                  {/* Table Body */}
                  <div className="max-h-80 overflow-y-auto">
                    {result.months.map((month, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3, delay: index * 0.03 }}
                        className={`grid grid-cols-4 gap-2 p-3 text-sm ${
                          index % 2 === 0 ? 'bg-gray-800/30' : 'bg-gray-800/10'
                        } hover:bg-gray-700/30 transition-colors`}
                      >
                        <div className="font-medium text-white">Month {month.month}</div>
                        <div className="text-gray-300">${month.btcPrice.toLocaleString()}</div>
                        <div className="text-gray-300">{month.monthlyEmiBtc.toFixed(8)}</div>
                        <div className="text-gray-300">${month.monthlyEmiUsd.toFixed(2)}</div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-4">
                <motion.button
                  onClick={() => setResult(null)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 py-3 px-4 rounded-lg text-white font-medium shadow-lg transition-all duration-200 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600"
                >
                  Simulate Another Loan
                </motion.button>
                
                <motion.button
                  onClick={() => window.print()}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="py-3 px-4 rounded-lg text-white font-medium shadow-lg transition-all duration-200 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
        
        {/* Information Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-8 p-6 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700"
        >
          <h3 className="text-xl font-semibold text-white mb-4">Understanding Your Loan Simulation</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="flex flex-col items-center text-center p-4 bg-gray-800/50 rounded-lg">
              <div className="w-12 h-12 bg-blue-900/50 rounded-full flex items-center justify-center mb-3">
                <span className="text-xl">📊</span>
              </div>
              <h4 className="text-white font-medium mb-2">BTC Price Volatility</h4>
              <p className="text-gray-400 text-sm">See how Bitcoin price changes affect your monthly payments over time.</p>
            </div>
            <div className="flex flex-col items-center text-center p-4 bg-gray-800/50 rounded-lg">
              <div className="w-12 h-12 bg-purple-900/50 rounded-full flex items-center justify-center mb-3">
                <span className="text-xl">💸</span>
              </div>
              <h4 className="text-white font-medium mb-2">Fixed vs Variable</h4>
              <p className="text-gray-400 text-sm">Compare fixed and variable payment options to find what works best for you.</p>
            </div>
            <div className="flex flex-col items-center text-center p-4 bg-gray-800/50 rounded-lg">
              <div className="w-12 h-12 bg-green-900/50 rounded-full flex items-center justify-center mb-3">
                <span className="text-xl">🔮</span>
              </div>
              <h4 className="text-white font-medium mb-2">Future Planning</h4>
              <p className="text-gray-400 text-sm">Plan ahead with detailed monthly breakdowns of your potential loan payments.</p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default Simulator;