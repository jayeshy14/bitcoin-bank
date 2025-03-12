import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate()

  return (
    <div className="space-y-20 bg-gray-900 text-gray-100">
      {/* Hero Section */}
      <section className="text-center m-10 py-20 bg-gradient-to-r from-blue-900 to-purple-900 rounded">
        <div className="mx-auto px-4 rounded-3xl">
          <motion.h1 
            className="text-6xl font-extrabold mb-6" 
            initial={{ opacity: 0, y: -50 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.5 }}
          >
            Bitcoin-Backed Loans Made Simple
          </motion.h1>
          <motion.p 
            className="text-xl mb-8 max-w-2xl mx-auto font-thin"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            Get instant <span className='text-amber-200 font-normal'>loan</span> using your <span className='text-amber-200 font-normal'>Bitcoin</span> as collateral. <span className='text-amber-200 font-normal'>Low interest</span> rates, 
            transparent terms, and <span className='text-amber-200 font-normal'>no credit checks</span> required.
          </motion.p>
          {!user && (
            <motion.div 
              className="space-x-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              <button
                onClick={() => navigate("/register")}
                className="bg-blue-600 !text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 shadow-lg transform scale-105 hover:scale-90 transition-all cursor-pointer"
              >
                Get Started
              </button>
              <button
                onClick={() => navigate("/login")}
                className="border-2 border-blue-600 !text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-600 hover:text-white shadow-lg transform hover:scale-85 transition-all cursor-pointer"
              >
                Login
              </button>
            </motion.div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Why Choose Us</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {["Secure", "Fast", "Transparent"].map((feature, index) => (
            <motion.div 
              key={index}
              className="text-center p-6 bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-shadow"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2, duration: 0.5 }}
            >
              <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature}</h3>
              <p className="text-gray-400">
                {feature === "Secure" && "Your Bitcoin collateral is stored in secure multi-signature wallets."}
                {feature === "Fast" && "Get your loan approved and disbursed within minutes."}
                {feature === "Transparent" && "Clear terms and conditions with no hidden fees."}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-gray-800 py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-4 gap-8">
            {["Create Account", "Deposit Bitcoin", "Get Loan", "Repay & Release"].map((step, index) => (
              <motion.div 
                key={index}
                className="text-center p-6 bg-gray-700 rounded-lg shadow-md hover:shadow-lg transition-shadow"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2, duration: 0.5 }}
              >
                <div className="text-2xl font-bold text-blue-500 mb-4">{index + 1}</div>
                <h3 className="text-lg font-semibold mb-2">{step}</h3>
                <p className="text-gray-400">
                  {index === 0 && "Sign up and verify your identity."}
                  {index === 1 && "Transfer BTC to your secure wallet."}
                  {index === 2 && "Receive funds in your preferred currency."}
                  {index === 3 && "Pay back the loan and get your BTC back."}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
