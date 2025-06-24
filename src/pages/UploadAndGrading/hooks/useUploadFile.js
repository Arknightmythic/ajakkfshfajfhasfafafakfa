import { useState } from 'react';
import axiosInstance from '../../../axios/axiosInstance';

const useUploadFile = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);

  const uploadFile = async (file, institutionName) => {
    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('institution_name', institutionName);

      const response = await axiosInstance.general.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 200) {
        return true;
      } else {
        throw new Error(`Unexpected response status: ${response.status}`);
      }
    } catch (err) {
      setError(err);
      return false;
    } finally {
      setIsUploading(false);
    }
  };

  return { uploadFile, isUploading, error };
};

export default useUploadFile;
