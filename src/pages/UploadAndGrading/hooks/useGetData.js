import { useEffect, useState } from 'react';
import axiosInstance from '../../../axios/axiosInstance';

const useGetData = (initialPage = 1) => {
  const [data, setData]       = useState([]);    
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);
  
  // State untuk Pagination
  const [page, setPage]             = useState(initialPage);
  const [totalPages, setTotalPages] = useState(1);
  const [hasNext, setHasNext]       = useState(false);
  const [hasPrev, setHasPrev]       = useState(false);

  const fetchData = async (currentPage = page) => {
    setLoading(true);
    try {
      // Tembak ke endpoint baru beserta query params page
      const res = await axiosInstance.general.get(`/graded_files?page=${currentPage}`);
      
      setData(res.data.data);
      setPage(res.data.page);
      setTotalPages(res.data.total_pages);
      setHasNext(res.data.has_next);
      setHasPrev(res.data.has_prev);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data setiap kali variabel "page" berubah
  useEffect(() => {
    fetchData(page);
  }, [page]);

  return { 
    data, 
    loading, 
    error, 
    refetch: () => fetchData(page),
    page,
    setPage,
    totalPages,
    hasNext,
    hasPrev
  };
};

export default useGetData;