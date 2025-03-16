import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getMyCollateralsApi } from '../../apis/collateralApis';
import { getMyPendingApplicationsApi } from '../../apis/loanApis';
import { getBalanceAPI, getOffChainBalanceAPI, getOnChainBalanceAPI } from '../../apis/contractApis';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [collaterals, setCollaterals] = useState([]);
  const [loanApplications, setLoanApplications] = useState([]);
  const [onChainBalance, setOnChainBalance] = useState(null);
  const [offChainBalance, setOffChainBalance] = useState(null);
  const [totalBalance, setTotalBalance] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const collaterals = await getMyCollateralsApi();
        setCollaterals(collaterals);

        const loanApplications = await getMyPendingApplicationsApi();
        setLoanApplications(loanApplications);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const offChainBalanceData = await getOffChainBalanceAPI();
        setOffChainBalance(offChainBalanceData);
        console.log("offChainBalanceData: ", offChainBalanceData);
        const onChainBalanceData = await getOnChainBalanceAPI();
        setOnChainBalance(onChainBalanceData);
        console.log("onChainBalanceData: ", onChainBalanceData);
        const totalBalanceData = await getBalanceAPI();
        setTotalBalance(totalBalanceData);
        console.log("totalBalanceData: ", totalBalanceData);
      } catch (error) {
        console.error("error getting balance, ",error);
      }
    }

    fetchBalance();
  },[]);

  if (loading) return (
    <div className="flex justify-center items-center h-screen w-full">
      <div className="relative w-24 h-24">
        <div className="absolute w-full h-full border-4 border-gray-200 rounded-full"></div>
        <div className="absolute w-full h-full border-4 border-t-transparent border-r-transparent border-yellow-500 rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-medium text-gray-400">Loading</span>
        </div>
      </div>
    </div>
  );

  // Format balance display
  const formatBalance = (balance) => {
    return balance !== null ? Number(balance).toFixed(8) : '0.00000000';
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
      {/* Header with background effect */}
      <div className="relative mb-8 overflow-hidden rounded-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-900 opacity-90"></div>
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1639322537504-6427a16b0a28?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80')] bg-cover bg-center mix-blend-overlay"></div>
        <div className="relative z-10 px-6 py-12 md:px-10 md:py-16 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-3">Welcome, {user?.firstName}</h1>
            <p className="text-gray-200 text-lg max-w-3xl">Manage your crypto-backed loans and collaterals in one secure place. Monitor your portfolio and make informed decisions.</p>
          </motion.div>
        </div>
      </div>

      {/* Balance Summary Cards */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mb-8"
      >
        <h2 className="text-2xl font-semibold mb-6 text-gray-100 px-2">Your Portfolio</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="relative overflow-hidden bg-gradient-to-br from-blue-800 to-blue-900 rounded-2xl p-6 shadow-xl">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 rounded-full bg-blue-500 opacity-20 blur-xl"></div>
            <div className="relative z-10">
              <div className="text-blue-300 mb-2 font-medium">On-Chain Balance</div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-white">{formatBalance(onChainBalance)}</span>
                <span className="text-blue-200">BTC</span>
              </div>
              <div className="mt-4 p-2 bg-blue-800/50 rounded-lg text-center">
                <span className="text-xs text-blue-200">Secure & Transparent</span>
              </div>
            </div>
          </div>
          
          <div className="relative overflow-hidden bg-gradient-to-br from-indigo-800 to-indigo-900 rounded-2xl p-6 shadow-xl">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 rounded-full bg-indigo-500 opacity-20 blur-xl"></div>
            <div className="relative z-10">
              <div className="text-indigo-300 mb-2 font-medium">Off-Chain Balance</div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-white">{formatBalance(offChainBalance)}</span>
                <span className="text-indigo-200">BTC</span>
              </div>
              <div className="mt-4 p-2 bg-indigo-800/50 rounded-lg text-center">
                <span className="text-xs text-indigo-200">Fast & Low-Fee</span>
              </div>
            </div>
          </div>
          
          <div className="relative overflow-hidden bg-gradient-to-br from-purple-800 to-purple-900 rounded-2xl p-6 shadow-xl">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 rounded-full bg-purple-500 opacity-20 blur-xl"></div>
            <div className="relative z-10">
              <div className="text-purple-300 mb-2 font-medium">Total Portfolio</div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-white">{formatBalance(totalBalance)}</span>
                <span className="text-purple-200">BTC</span>
              </div>
              <div className="mt-4 p-2 bg-purple-800/50 rounded-lg text-center">
                <span className="text-xs text-purple-200">Combined Assets</span>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Quick Actions */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mb-8"
      >
        <h2 className="text-2xl font-semibold mb-6 text-gray-100 px-2">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
          {[
            { title: "List Collateral", icon: "📋", desc: "Use assets as security", path: "/collateral", color: "from-sky-800 to-blue-900" },
            { title: "Apply for Loan", icon: "💰", desc: "Get BTC financing", path: "/borrow", color: "from-emerald-800 to-green-900" },
            { title: "Invest", icon: "📈", desc: "Fund loan requests", path: "/lend", color: "from-purple-800 to-indigo-900" },
            { title: "Deposit BTC", icon: "🪙", desc: "Add to your wallet", path: "/deposit", color: "from-amber-700 to-yellow-900" }
          ].map((action, i) => (
            <motion.div
              key={i}
              className={`relative overflow-hidden bg-gradient-to-br ${action.color} rounded-xl cursor-pointer h-full`}
              whileHover={{ scale: 1.03, y: -4 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate(action.path)}
            >
              <div className="absolute bottom-0 right-0 w-20 h-20 opacity-10 text-4xl flex items-center justify-center">{action.icon}</div>
              <div className="p-5 relative z-10">
                <div className="text-2xl mb-3">{action.icon}</div>
                <h3 className="text-base font-semibold text-white mb-2">{action.title}</h3>
                <p className="text-xs text-gray-300">{action.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Two-column layout for larger screens */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {/* My Collaterals */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mb-8"
        >
          <div className="flex justify-between items-center mb-6 px-2">
            <h2 className="text-2xl font-semibold text-gray-100">Your Collateral Assets</h2>
            <button
              onClick={() => navigate('/collateral')}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white rounded-lg shadow-lg transition-all flex items-center gap-2"
            >
              <span className="text-sm">Add New</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
          
          {collaterals.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {collaterals.map((collateral) => (
                <motion.div 
                  key={collateral._id}
                  whileHover={{ y: -5 }}
                  className="relative overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700 h-full"
                >
                  <div className="absolute top-0 right-0 p-2 text-xs font-medium">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full ${
                      collateral.status === 'available' 
                        ? 'bg-green-900/60 text-green-300' 
                        : 'bg-yellow-900/60 text-yellow-300'
                    }`}>
                      {collateral.status}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mt-2">
                    {collateral.type === 'gold' ? '🏅 Gold' : '🏢 Property'}
                  </h3>
                  
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Value:</span>
                      <span className="text-white font-medium">${collateral.value.toFixed(2)}</span>
                    </div>
                    
                    {collateral.loanAssociation && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Loan ID:</span>
                        <span className="text-blue-400 font-medium">{collateral.loanAssociation}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="absolute bottom-0 right-0 w-16 h-16 opacity-10">
                    {collateral.type === 'gold' 
                      ? <span className="text-4xl">🏅</span>
                      : <span className="text-4xl">🏢</span>
                    }
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 text-center border border-gray-700">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-medium text-gray-200 mb-2">No Collateral Assets Yet</h3>
              <p className="text-gray-400 mb-6">List your first asset as collateral to unlock the potential for crypto-backed loans.</p>
              <Link to="/collateral" className="inline-flex items-center px-5 py-3 bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white rounded-lg shadow-lg transition-all">
                <span>List Your First Collateral</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </div>
          )}
        </motion.section>

        {/* Loan Applications */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="flex justify-between items-center mb-6 px-2">
            <h2 className="text-2xl font-semibold text-gray-100">Loan Applications</h2>
            <button
              onClick={() => navigate('/borrow')}
              className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-800 hover:from-green-700 hover:to-green-900 text-white rounded-lg shadow-lg transition-all flex items-center gap-2"
            >
              <span className="text-sm">Apply Now</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
          
          {loanApplications.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {loanApplications.map((loan) => (
                <motion.div 
                  key={loan._id} 
                  whileHover={{ y: -5 }}
                  className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-xl overflow-hidden border border-gray-700 h-full"
                >
                  <div className="p-1 bg-gradient-to-r from-emerald-500 to-teal-600">
                    <div className="px-4 py-1 text-xs font-semibold text-emerald-100">
                      Status: {loan.status}
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-base md:text-lg font-semibold text-white">Loan Application</h3>
                        <p className="text-xs text-gray-400">ID: {loan._id.substring(0, 8)}...</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg md:text-xl font-bold text-white">{loan.amount} BTC</p>
                        <p className="text-xs text-gray-400">Interest: {loan.interestRate}%</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-400">Term:</span>
                        <span className="text-sm text-white">{loan.term} months</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-400">Risk Factor:</span>
                        <span className="text-sm text-white">{loan.riskFactor}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-400">Collateral ID:</span>
                        <span className="text-sm text-blue-400">{loan.collateral.substring(0, 8)}...</span>
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t border-gray-700">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-400">Applied on:</span>
                        <span className="text-xs text-gray-400">
                          {new Date().toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 text-center border border-gray-700">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-medium text-gray-200 mb-2">No Loan Applications</h3>
              <p className="text-gray-400 mb-6">Apply for your first crypto-backed loan and get instant liquidity while holding your assets.</p>
              <Link to="/borrow" className="inline-flex items-center px-5 py-3 bg-gradient-to-r from-green-600 to-green-800 hover:from-green-700 hover:to-green-900 text-white rounded-lg shadow-lg transition-all">
                <span>Apply for Your First Loan</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </div>
          )}
        </motion.section>
      </div>
    </div>
  );
};

export default Dashboard;
