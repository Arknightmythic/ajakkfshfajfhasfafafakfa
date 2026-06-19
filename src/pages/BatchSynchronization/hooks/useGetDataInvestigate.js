import { useQuery } from "@tanstack/react-query";
import axiosInstance from '../../../axios/axiosInstance';

const getInvestigationData = async (file_id, page) => {
  const res = await axiosInstance.general.get(`/manual-review-data`, {
    params: {
      file_id: file_id,
      page: page
    }
  });
  
  return res.data; 
};

const useGetInvestigationData = (file_id, page = 1) => {
  return useQuery({
    queryKey: ["investigation", file_id, page],
    queryFn: () => getInvestigationData(file_id, page),
    enabled: !!file_id, 
  });
};

export default useGetInvestigationData;