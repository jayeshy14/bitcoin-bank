import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const path = location.pathname.replace("/", "");


  const navItem = ["Borrow", "Lend", "dashboard", "profile"]

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-gray-800  shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16 uppercase">
          <Link to="/" className="text-xl text-white font-bold transition duration-200">
            Bitcoin Loan Bank
          </Link>

          <div className='flex flex-row gap-10 leading-0 items-center justify-center'>
            {navItem.map((item, index) => (
              <div>
                {item !== "profile" ?
                  <Link to={`/${item}`} key={index} className={path === item ? "bg-blue-200 p-2 rounded" : "" }>{item}</Link>
                  : <button className="flex items-center bg-blue-600 hover:bg-blue-500 text-white px-4 py-5 rounded transition duration-200">
                    {user.firstName} <span className="ml-2">▼</span>
                  </button>
                }
              </div>
            ))}
          </div>

          {/* <div className="flex items-center space-x-4">
            {user ? (
              <div className="relative">
                
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 hidden group-hover:block">
                  <Link to="/dashboard" className="block px-4 py-2 text-gray-800 hover:bg-gray-200">Dashboard</Link>
                  {user.roles.includes('borrower') && (
                    <>
                      <Link to="/loans/apply" className="block px-4 py-2 text-gray-800 hover:bg-gray-200">Apply for Loan</Link>
                      <Link to="/loans/my-loans" className="block px-4 py-2 text-gray-800 hover:bg-gray-200">My Loans</Link>
                    </>
                  )}
                  {user.roles.includes('investor') && (
                    <>
                      <Link to="/investor/opportunities" className="block px-4 py-2 text-gray-800 hover:bg-gray-200">Invest</Link>
                      <Link to="/investor/my-investments" className="block px-4 py-2 text-gray-800 hover:bg-gray-200">My Investments</Link>
                    </>
                  )}
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-100 transition duration-200"
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <> 
                <Link to="/login" className="hover:text-blue-300 transition duration-200">Login</Link>
                <Link to="/register" className="bg-white text-blue-600 hover:bg-blue-50 px-4 py-2 rounded transition duration-200">Register</Link>
              </>
            )}
          </div> */}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;