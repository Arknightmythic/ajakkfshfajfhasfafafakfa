import { useState, useEffect } from 'react';
import axiosInstance from '../../../axios/axiosInstance';

const useAuditLogs = (period, dateRange, refreshInterval, initialPage = 1) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(1);

  // Reset page ke 1 setiap kali filter berubah
  useEffect(() => { setPage(1); }, [period, dateRange]);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        let params = `?page=${page}&period=${period}`;
        if (period === 'custom' && dateRange.start && dateRange.end) {
          params += `&start_date=${dateRange.start}&end_date=${dateRange.end}`;
        }
        const res = await axiosInstance.general.get(`/audit/logs${params}`);
        setLogs(res.data.data);
        setPage(res.data.page);
        setTotalPages(res.data.total_pages);
      } catch (error) {
        console.error("Gagal refresh log:", error);
      } finally {
        setLoading(false); // Matikan loading setelah fetch pertama
      }
    };

    // Saat pindah halaman, paksa loading indicator menyala
    setLoading(true); 
    fetchLogs();

    if (refreshInterval > 0) {
      const intervalId = setInterval(fetchLogs, refreshInterval);
      return () => clearInterval(intervalId);
    }
  }, [page, period, dateRange, refreshInterval]);

  return { logs, loading, page, setPage, totalPages };
};

export default useAuditLogs;