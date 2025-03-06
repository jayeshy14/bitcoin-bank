import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/dashboard/Dashboard';
import LoanApplication from './pages/loans/LoanApplication';
import MyLoans from './pages/loans/MyLoans';
import InvestmentOpportunities from './pages/investor/InvestmentOpportunities';
import MyInvestments from './pages/investor/MyInvestments';
import Marketplace from './pages/marketplace/Marketplace';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/auth/PrivateRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50 flex flex-col">
          <Navbar />
          <main className="flex-grow container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/dashboard" element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              } />
              <Route path="/loans/apply" element={
                <PrivateRoute>
                  <LoanApplication />
                </PrivateRoute>
              } />
              <Route path="/loans/my-loans" element={
                <PrivateRoute>
                  <MyLoans />
                </PrivateRoute>
              } />
              <Route path="/investor/opportunities" element={
                <PrivateRoute>
                  <InvestmentOpportunities />
                </PrivateRoute>
              } />
              <Route path="/investor/my-investments" element={
                <PrivateRoute>
                  <MyInvestments />
                </PrivateRoute>
              } />
              <Route path="/marketplace" element={
                <PrivateRoute>
                  <Marketplace />
                </PrivateRoute>
              } />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
