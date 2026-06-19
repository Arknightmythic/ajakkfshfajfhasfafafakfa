import { useState, useEffect, useCallback } from 'react';
import axiosInstance from '../../../axios/axiosInstance';

const useHistory = ({ page = 1, institution_name = '', start_date = '', end_date = '' }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Pagination states
  const [totalPages, setTotalPages] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);
  const [totalRows, setTotalRows] = useState(0);

  const fetchData = useCallback(async (isBackground = false) => {
    if (!isBackground) {
      setLoading(true);
    }
    
    try {
      // Menyusun parameter query
      const params = new URLSearchParams({
        page: page,
        institution_name: institution_name || '',
        start_date: start_date || '',
        end_date: end_date || ''
      });

      // Sesuaikan endpoint sesuai dengan API terbarumu
      const response = await axiosInstance.general.get(`/history_data?${params.toString()}`);
      
      setData(response.data.data || []);
      setTotalPages(response.data.total_pages);
      setHasNext(response.data.has_next);
      setHasPrev(response.data.has_prev);
      setTotalRows(response.data.total_rows);
      
    } catch (err) {
      if (!isBackground) {
        setError(err?.response?.data?.message || err.message || 'Unknown error');
      } else {
        console.warn("Background fetch history failed:", err.message);
      }
    } finally {
      if (!isBackground) {
        setLoading(false);
      }
    }
  }, [page, institution_name, start_date, end_date]);

  // Fetching awal atau saat parameter filter & halaman berubah
  useEffect(() => {
    fetchData(false);
  }, [fetchData]);

  // Polling near real-time (background fetch) setiap 3 detik
  useEffect(() => {
    const interval = setInterval(() => {
      fetchData(true);
    }, 3000);

    return () => clearInterval(interval);
  }, [fetchData]);

  return { data, loading, error, totalPages, hasNext, hasPrev, totalRows };
};

export default useHistory;