import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../../../axios/axiosInstance';

const fetchSyncData = async () => {
  const res = await axiosInstance.general.get('/sync');
  return res.data.data;
};

const useGetData = () => {
  return useQuery({
    queryKey: ['syncData'],
    queryFn: fetchSyncData,
    refetchInterval: 5000, 
    refetchOnWindowFocus: true,
  });
};

export default useGetData;
