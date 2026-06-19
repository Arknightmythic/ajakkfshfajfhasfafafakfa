import { useState, useEffect, useCallback } from 'react';
import axiosInstance from '../../../axios/axiosInstance';

const useDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = useCallback(async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    try {
      const response = await axiosInstance.general.get('/summary_dashboard/');
      setDashboardData(response.data);
    } catch (err) {
      if (!isBackground) {
        setError(
          err?.response?.data?.message ||
            err.message ||
            'Failed to fetch dashboard data'
        );
      } else {
        console.warn("Background fetch dashboard failed:", err.message);
      }
    } finally {
      if (!isBackground) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData(false); // Fetch awal dengan loading state

    // Polling setiap 5 detik untuk near real-time dashboard
    const interval = setInterval(() => {
      fetchDashboardData(true);
    }, 5000);

    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  return { dashboardData, loading, error };
};

export default useDashboard;