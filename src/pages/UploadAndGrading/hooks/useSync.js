import { useState } from 'react';
import axiosInstance from '../../../axios/axiosInstance';

const useSync = () => {
  const [loadingSync, setLoadingSync] = useState(false);
  const [errorSync, setErrorSync]     = useState(null);
  const [response, setResponse] = useState(null);

  const syncByGrade = async (id, grade) => {
    setLoadingSync(true);
    setErrorSync(null);

    const lowerGrade = grade?.toLowerCase();

    const endpoint = `/api/sync/grade-${lowerGrade}`;

    try {

      const res = await axiosInstance.synchronize.post(endpoint, {
        file_id: id,
      });
      setResponse(res.data);
      return res.data;
    } catch (err) {
      setErrorSync(err);
      return null;
    } finally {
      setLoadingSync(false);
    }
  };

  return { syncByGrade, loadingSync, errorSync, response };
};

export default useSync;
