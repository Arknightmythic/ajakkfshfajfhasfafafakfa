import { useEffect, useState } from 'react';
import axiosInstance from '../../../axios/axiosInstance';

const useGetData = () => {
  const [data, setData]       = useState([]);    
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.general.get('/upload');
      setData(res.data.data);   
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { data, loading, error, refetch: fetchData };
};

export default useGetData;
