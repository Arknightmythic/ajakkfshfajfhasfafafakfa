import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../../../axios/axiosInstance';

// Menerima parameter query key dari hook
const fetchSyncData = async ({ queryKey }) => {
  const [_key, filters] = queryKey;
  
  const res = await axiosInstance.general.get('/synchronized_files', {
    params: {
      page: filters.page || 1,
      institution_name: filters.institution_name || '',
      grade: filters.grade || '1,2,3,4,5',
      sync_status: filters.sync_status || '1,2,3'
    }
  });
  
  // Mengembalikan full response untuk mendapatkan pagination meta
  return res.data; 
};

// Hook sekarang menerima parameter 'filters'
const useGetData = (filters) => {
  return useQuery({
    // Menjadikan filters bagian dari queryKey agar data ter-refetch otomatis saat filter berubah
    queryKey: ['syncData', filters], 
    queryFn: fetchSyncData,
    refetchInterval: 5000, 
    refetchOnWindowFocus: true,
  });
};

export default useGetData;