import { useState, useEffect } from 'react';
import axios from 'axios';
import axiosInstance from '../../../axios/axiosInstance';

const useDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await axiosInstance.general.get('/sync/dashboard');
        setDashboardData(response.data);
      } catch (err) {
        setError(
          err?.response?.data?.message ||
            err.message ||
            'Failed to fetch dashboard data'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return { dashboardData, loading, error };
};

export default useDashboard;
