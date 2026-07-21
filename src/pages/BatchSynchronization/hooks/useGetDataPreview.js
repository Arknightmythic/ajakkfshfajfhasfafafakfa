import { useQuery } from "@tanstack/react-query";
import axiosInstance from '../../../axios/axiosInstance';

const getPreviewData = async (file_id) => {
  const res = await axiosInstance.general.get(`/preview-data/${file_id}`);

  // Kembalikan full body (bukan cuma res.data.data) — backend sekarang juga
  // menyertakan institution_name & grade di sini, dipakai PreviewPage.jsx
  // sebagai sumber kebenaran tunggal supaya tampilannya selalu sama baik
  // dibuka lewat tombol List maupun lewat link (mis. dari chatbot) yang
  // mungkin tidak membawa query param institutionName/grade.
  return res.data;
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