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
import ListCollateral from './pages/loans/ListCollateral';
import LoanApplicationForm from './pages/loans/LoanApplication';
import Simulator from './pages/simulator/Simulator';
import Deposit from './pages/deposit/Deposit';


function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-900 text-gray-200 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex flex-col min-h-screen py-10 min-w-screen items-center justify-center">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/simulator" element={<Simulator />} />
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/deposit"
              element={
                <PrivateRoute>
                  <Deposit />
                </PrivateRoute>
              }
            />
            <Route
              path="/borrow"
              element={
                <PrivateRoute>
                  <LoanApplicationForm />
                </PrivateRoute>
              }
            />
            <Route
              path="/loans/my-loans"
              element={
                <PrivateRoute>
                  <MyLoans />
                </PrivateRoute>
              }
            />
            <Route
              path="/lend"
              element={
                <PrivateRoute>
                  <InvestmentOpportunities />
                </PrivateRoute>
              }
            />
            <Route
              path="/investor/my-investments"
              element={
                <PrivateRoute>
                  <MyInvestments />
                </PrivateRoute>
              }
            />
            <Route
              path="/marketplace"
              element={
                <PrivateRoute>
                  <Marketplace />
                </PrivateRoute>
              }
            />
            <Route
              path="/collateral"
              element={
                <PrivateRoute>
                  <ListCollateral />
                </PrivateRoute>
              }
            />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
