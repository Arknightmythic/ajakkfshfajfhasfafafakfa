import { useState, useEffect } from 'react';
import axiosInstance from '../../../axios/axiosInstance';

const useHistory = () => {
  const [historyData, setHistoryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHistoryData = async () => {
      try {
        const response = await axiosInstance.dashboardapi.get(
          '/historyApi/all'
        );
        setHistoryData(response.data);
      } catch (err) {
        setError(
          err?.response?.data?.message || err.message || 'Unknown error'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchHistoryData();
  }, []);

  return { historyData, loading, error };
};

export default useHistory;
