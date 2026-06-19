import { useQuery } from "@tanstack/react-query";
import axiosInstance from '../../../axios/axiosInstance';

const getPreviewData = async (file_id) => {
  const res = await axiosInstance.general.get(`/preview-data/${file_id}`);
  
  return res.data.data; 
};

const useGetPreviewData = (file_id) => {
  return useQuery({
    // Mengubah query key dari "investigation" menjadi "previewData" agar relevan
    queryKey: ["previewData", file_id],
    queryFn: () => getPreviewData(file_id),
    enabled: !!file_id, 
  });
};

export default useGetPreviewData;