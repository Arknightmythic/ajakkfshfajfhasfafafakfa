import { useState } from 'react'; 
import axiosInstance from '../../../axios/axiosInstance';

const useFileDownloader = () => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState(null);

  const downloadFile = (match_type, metadata_id, file_format, filename_prefix) => {
    setIsDownloading(true);
    setError(null);
    try {
      const baseURL = axiosInstance.general.defaults.baseURL;

      if (!baseURL) {
        throw new Error("Base URL for 'general' instance is not configured.");
      }

      const params = new URLSearchParams({
        match_type,
        metadata_id,
        file_format,
      });
      
      const url = `${baseURL}/history/download?${params.toString()}`;

      const link = document.createElement('a');
      link.href = url;
      
      const fileName = `${filename_prefix}_${match_type}.${file_format}`;
      console.log(fileName)
      link.setAttribute('download', fileName);

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (err) {
      console.error("Download failed:", err);
      setError("Gagal memulai unduhan.");
    } finally {
      setIsDownloading(false);
    }
  };

  return { isDownloading, error, downloadFile };
};

export default useFileDownloader;