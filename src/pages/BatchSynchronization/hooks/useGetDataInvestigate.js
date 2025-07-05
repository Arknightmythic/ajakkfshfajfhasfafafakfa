import { useQuery } from "@tanstack/react-query";
import axiosInstance from '../../../axios/axiosInstance';

const getInvestigationData = async (metadata_id) => {
  const res = await axiosInstance.general.get(`/sync/institution-detail/${metadata_id}`);
  const allData = res.data.data;

  const filtered = allData.filter(item => item.pivot_is_match === null);
  console.log("res from backend:", filtered)

  return filtered;
};

const useGetInvestigationData = (metadata_id) => {
  return useQuery({
    queryKey: ["investigation", metadata_id],
    queryFn: () => getInvestigationData(metadata_id),
    enabled: !!metadata_id, 
  });
};

export default useGetInvestigationData;
