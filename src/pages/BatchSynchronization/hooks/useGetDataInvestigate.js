import { useQuery } from "@tanstack/react-query";
import axiosInstance from '../../../axios/axiosInstance';

const getInvestigationData = async (metadata_id) => {
  const res = await axiosInstance.general.get(`/sync/institution-detail/${metadata_id}`);
  console.log("line 6", res.data.data)
  return res.data.data; 
};

const useGetInvestigationData = (metadata_id) => {
  return useQuery({
    queryKey: ["investigation", metadata_id],
    queryFn: () => getInvestigationData(metadata_id),
    enabled: !!metadata_id, 
  });
};

export default useGetInvestigationData;
