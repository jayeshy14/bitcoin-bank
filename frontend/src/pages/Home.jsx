import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-20">
      {/* Hero Section */}
      <section className="text-center py-20 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="container mx-auto px-4">
          <h1 className="text-5xl font-bold mb-6">
            Bitcoin-Backed Loans Made Simple
          </h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Get instant loans using your Bitcoin as collateral. Low interest rates, 
            transparent terms, and no credit checks required.
          </p>
          {!user && (
            <div className="space-x-4">
              <Link
                to="/register"
                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50"
              >
                Get Started
              </Link>
              <Link
                to="/login"
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600"
              >
                Login
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Why Choose Us</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center p-6">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Secure</h3>
            <p className="text-gray-600">
              Your Bitcoin collateral is stored in secure multi-signature wallets
            </p>
          </div>
          <div className="text-center p-6">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Fast</h3>
            <p className="text-gray-600">
              Get your loan approved and disbursed within minutes
            </p>
          </div>
          <div className="text-center p-6">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Transparent</h3>
            <p className="text-gray-600">
              Clear terms and conditions with no hidden fees
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 mb-4">1</div>
              <h3 className="text-lg font-semibold mb-2">Create Account</h3>
              <p className="text-gray-600">Sign up and verify your identity</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 mb-4">2</div>
              <h3 className="text-lg font-semibold mb-2">Deposit Bitcoin</h3>
              <p className="text-gray-600">Transfer BTC to your secure wallet</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 mb-4">3</div>
              <h3 className="text-lg font-semibold mb-2">Get Loan</h3>
              <p className="text-gray-600">Receive funds in your preferred currency</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 mb-4">4</div>
              <h3 className="text-lg font-semibold mb-2">Repay & Release</h3>
              <p className="text-gray-600">Pay back the loan and get your BTC back</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home; 