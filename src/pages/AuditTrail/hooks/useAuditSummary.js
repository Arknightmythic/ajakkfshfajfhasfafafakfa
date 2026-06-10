import { useState, useEffect } from 'react';
import axiosInstance from '../../../axios/axiosInstance';

const useAuditSummary = (period, dateRange, refreshInterval) => {
  const [summary, setSummary] = useState({ success: 0, failed: 0 });
  const [latencyData, setLatencyData] = useState([]);
  const [retention, setRetention] = useState({ total_executions: 0, success_executions: 0, last_execution: 'Never' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      // Jangan set loading true saat auto-refresh agar UI tidak berkedip
      try {
        let params = `?period=${period}`;
        if (period === 'custom' && dateRange.start && dateRange.end) {
          params += `&start_date=${dateRange.start}&end_date=${dateRange.end}`;
        }

        const [sumRes, latRes, retRes] = await Promise.all([
          axiosInstance.general.get(`/audit/summary${params}`),
          axiosInstance.general.get(`/audit/latency-chart${params}`),
          axiosInstance.general.get(`/retention/summary`)
        ]);
        
        setSummary(sumRes.data);
        setLatencyData(latRes.data);
        setRetention(retRes.data);
      } catch (error) {
        console.error("Gagal refresh summary:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSummary(); // Eksekusi pertama kali

    // Setup Auto-Refresh
    if (refreshInterval > 0) {
      const intervalId = setInterval(fetchSummary, refreshInterval);
      return () => clearInterval(intervalId); // Bersihkan saat unmount atau berubah parameter
    }
  }, [period, dateRange, refreshInterval]);

  return { summary, latencyData, retention, loading };
};

export default useAuditSummary;