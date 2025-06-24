import { useState } from 'react';
import axiosInstance from '../../../axios/axiosInstance';

const useSync = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);
  const [response, setResponse] = useState(null);

  const syncByGrade = async (id, grade) => {
    setLoading(true);
    setError(null);

    const lowerGrade = grade?.toLowerCase();

    const endpoint = `/api/sync/grade-${lowerGrade}`;

    try {

      const res = await axiosInstance.synchronize.post(endpoint, {
        file_id: id,
      });
      setResponse(res.data);
      return res.data;
    } catch (err) {
      setError(err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { syncByGrade, loading, error, response };
};

export default useSync;
