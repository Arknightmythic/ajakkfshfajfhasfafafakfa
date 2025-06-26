import { useState, useEffect } from 'react';
import axiosInstance from '../../../axios/axiosInstance';

const useDownload = () => {
  const [loadingDownload, setLoadingDownload] = useState(false);

  const downloadFile = async (
    matchType,
    metadataId,
    format = 'csv',
    institutionName
  ) => {
    try {
      setLoadingDownload(true);
      const response = await axiosInstance.general.post(
        '/history',
        {
          match_type: matchType,
          metadata_id: metadataId,
          format: format,
        },
        {
          responseType: 'blob',
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `${matchType}_data_${institutionName}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Download failed. Please try again.');
    } finally {
      setLoadingDownload(false);
    }
  };

  return { downloadFile, loadingDownload };
};

export default useDownload;