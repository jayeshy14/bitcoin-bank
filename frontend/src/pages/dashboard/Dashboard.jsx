import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { getMyCollateralsApi } from '../../apis/collateralApis';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No token found');
        }
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        const myCollaterals = await getMyCollateralsApi();
        console.log(myCollaterals)
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [logout]);

  if (loading) return <div>Loading...</div>;


  return (
    <div className="space-y-12">
      <h1 className="text-3xl font-bold">Welcome, {user.firstName}!</h1>
    </div>
  );
};

export default Dashboard; 