import { useState } from 'react'; 
import axiosInstance from '../../../axios/axiosInstance';

const useFileDownloader = () => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState(null);

  // Parameter sekarang disesuaikan dengan API backend yang baru (file_id dan export_type)
  const downloadFile = async (file_id, export_type) => {
    setIsDownloading(true);
    setError(null);
    try {
      // 1. Hit API untuk mendapatkan Presigned URL & Nama File Dinamis
      const response = await axiosInstance.general.get(
        `/files/${file_id}/export/download?type=${export_type}`
      );

      const { url, filename } = response.data;

      // 2. Gunakan anchor element tersembunyi untuk langsung mendownload dari MinIO
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (err) {
      console.error("Download failed:", err);
      // Tampilkan pesan error spesifik dari backend jika ada
      setError(err?.response?.data?.detail || "Gagal memulai unduhan.");
    } finally {
      setIsDownloading(false);
    }
  };

  return { isDownloading, error, downloadFile };
};

export default useFileDownloader;