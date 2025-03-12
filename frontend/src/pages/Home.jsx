import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="space-y-20 bg-gray-900 text-gray-100">
      {/* Hero Section */}
      <section className="text-center py-20 bg-gradient-to-r from-purple-700 to-blue-700">
        <div className="mx-auto px-4">
          <motion.h1 
            className="text-6xl font-extrabold mb-6" 
            initial={{ opacity: 0, y: -50 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.5 }}
          >
            Get Bitcoin Loans with Gold or Property
          </motion.h1>
          <motion.p 
            className="text-xl mb-8 max-w-2xl mx-auto font-thin"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            Unlock liquidity by securing a Bitcoin loan with your gold or property as collateral. No credit checks, low interest rates, and secure transactions.
          </motion.p>
          {!user && (
            <motion.div 
              className="space-x-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              <Link
                to="/register"
                className="bg-yellow-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-yellow-700 shadow-lg transform hover:scale-105 transition-transform"
              >
                Get Started
              </Link>
              <Link
                to="/login"
                className="border-2 border-yellow-600 text-yellow-600 px-8 py-3 rounded-lg font-semibold hover:bg-yellow-600 hover:text-white shadow-lg transform hover:scale-105 transition-transform"
              >
                Login
              </Link>
            </motion.div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Why Choose Us?</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {["Secure Storage", "Instant Loans", "Flexible Repayment"].map((feature, index) => (
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
                {feature === "Secure Storage" && "Your gold and property details are securely stored and insured."}
                {feature === "Instant Loans" && "Get Bitcoin loans within minutes after collateral verification."}
                {feature === "Flexible Repayment" && "Choose a repayment plan that fits your needs, with no hidden fees."}
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
            {["Create Account", "Add Collateral", "Get Bitcoin Loan", "Repay & Unlock"].map((step, index) => (
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
                  {index === 0 && "Sign up and complete your identity verification."}
                  {index === 1 && "Add your gold or property details for valuation."}
                  {index === 2 && "Receive Bitcoin directly to your wallet after approval."}
                  {index === 3 && "Repay the loan to release your collateral."}
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
