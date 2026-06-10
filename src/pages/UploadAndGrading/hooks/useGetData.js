import { useEffect, useState, useCallback } from 'react';
import axiosInstance from '../../../axios/axiosInstance';

const useGetData = (initialPage = 1) => {
  const [data, setData]       = useState([]);    
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);
  
  
  const [page, setPage]             = useState(initialPage);
  const [totalPages, setTotalPages] = useState(1);
  const [hasNext, setHasNext]       = useState(false);
  const [hasPrev, setHasPrev]       = useState(false);

  
  const fetchData = useCallback(async (targetPage, isBackground = false) => {
    
    if (!isBackground) {
      setLoading(true);
    }
    
    try {
      const res = await axiosInstance.general.get(`/graded_files?page=${targetPage}`);
      
      setData(res.data.data);
      setPage(res.data.page);
      setTotalPages(res.data.total_pages);
      setHasNext(res.data.has_next);
      setHasPrev(res.data.has_prev);
    } catch (err) {
      
      
      if (!isBackground) {
        setError(err);
      } else {
        console.warn("Background fetch failed:", err.message);
      }
    } finally {
      if (!isBackground) {
        setLoading(false);
      }
    }
  }, []);

  
  useEffect(() => {
    fetchData(page, false); 
  }, [page, fetchData]);

  
  useEffect(() => {
    const interval = setInterval(() => {
      fetchData(page, true); 
    }, 3000);

    
    
    return () => clearInterval(interval);
  }, [page, fetchData]);

  return { 
    data, 
    loading, 
    error, 
    refetch: () => fetchData(page, true), 
    page,
    setPage,
    totalPages,
    hasNext,
    hasPrev
  };
};

export default useGetData;