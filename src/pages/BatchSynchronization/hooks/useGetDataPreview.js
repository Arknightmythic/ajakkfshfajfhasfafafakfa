import { useQuery } from "@tanstack/react-query";
import axiosInstance from '../../../axios/axiosInstance';

const getPreviewData = async (metadata_id) => {
  const res = await axiosInstance.general.get(`/sync/preview/${metadata_id}`);
  console.log("line 6", res.data.data)
  return res.data.data; 
};

const useGetPreviewData = (metadata_id) => {
  return useQuery({
    queryKey: ["investigation", metadata_id],
    queryFn: () => getPreviewData(metadata_id),
    enabled: !!metadata_id, 
  });
};

export default useGetPreviewData;
