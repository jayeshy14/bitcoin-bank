import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Menu, MenuItem } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/solid';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const path = location.pathname.replace("/", "");

  const navItem = ["simulator", "borrow", "lend", "dashboard", "login", "register"];

  return (
    <nav className="bg-gray-900 shadow-lg border-b-2 border-slate-500 ">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16 uppercase">
          <h1 onClick={() => navigate("/")} className="text-2xl text-white font-bold transition duration-200 hover:text-slate-300 cursor-pointer">
            Bitcoin Loan Bank
          </h1>

          <div className='flex flex-row gap-10 leading-0 items-center justify-center'>
            {navItem
              .filter(item => !(user && (item === "login" || item === "register"))) // Filter out login and register if user exists
              .map((item, index) => (
                <div key={index}>
                  <Link
                    to={`/${item}`}
                    className={`px-4 py-2 rounded-lg transition !text-white duration-300 ${path === item ? "bg-slate-500 " : " hover:bg-slate-500"
                      }`}
                  >
                    {item}
                  </Link>
                </div>
              ))}

            {user && (
              <Menu as="div" className="relative">
                <Menu.Button className="flex items-center bg-blue-600 hover:bg-blue-500 text-white px-4 py-3 rounded-lg transition duration-200">
                  {user.firstName} <ChevronDownIcon className="w-5 h-5 ml-2" />
                </Menu.Button>
                <Menu.Items className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-lg z-10">
                  <MenuItem>
                    {({ active }) => (
                      <Link
                        to="/deposit"
                        className={`block px-4 py-2 text-sm ${active ? 'bg-blue-500 text-white' : 'text-gray-700'}`}
                      >
                        Deposit
                      </Link>
                    )}
                  </MenuItem>
                  <MenuItem>
                    {({ active }) => (
                      <button
                        onClick={logout}
                        className={`block w-full text-left px-4 py-2 text-sm ${active ? 'bg-red-500 text-white' : 'text-gray-700'}`}
                      >
                        Logout
                      </button>
                    )}
                  </MenuItem>
                </Menu.Items>
              </Menu>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
