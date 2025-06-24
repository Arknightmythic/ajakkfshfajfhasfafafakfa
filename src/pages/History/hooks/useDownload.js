import { useState, useCallback } from 'react';
import axiosInstance from '../../../axios/axiosInstance';

const useDownload = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const downloadData = useCallback((item, type) => {
    setLoading(true);
    setError(null);

    let endpoint = '';
    if (type === 'matched') {
      endpoint = `/download/matched/${item.metadata_id || item.id}`;
    } else if (type === 'unmatched') {
      endpoint = `/download/unmatched/${item.metadata_id || item.id}`;
    } else {
      setError('Invalid download type');
      setLoading(false);
      return;
    }

    axiosInstance.backendApi
      .get(endpoint)
      .then((response) => {
        const data = response.data;
        const csv = convertToCSV(data);
        downloadFile(csv, `${type}_data.csv`);
      })
      .catch((error) => {
        setError(`Gagal mengunduh data ${type}: ${error.message}`);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []); // Empty dependency array since endpoint logic is static

  // Helper functions
  const convertToCSV = (data) => {
    if (!data.length) return '';
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map((row) => Object.values(row).join(',')).join('\n');
    return headers + '\n' + rows;
  };

  const downloadFile = (csv, filename) => {
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return { downloadData, loading, error };
};

export default useDownload;
