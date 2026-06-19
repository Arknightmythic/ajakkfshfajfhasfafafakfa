import { useMutation } from "@tanstack/react-query";
import axiosInstance from "../../../axios/axiosInstance";

// Function menerima parameter object yang dibutuhkan oleh endpoint baru
const updateMatchStatus = async ({ file_id, id_incoming, match_status }) => {
  const res = await axiosInstance.general.patch(
    `/files/${file_id}/data/${id_incoming}/match-status`,
    { match_status } // Body request raw: {"match_status": 4} atau 5
  );
  return res.data;
};

const usePostMatchData = () => {
  // queryClient.invalidateQueries dipindahkan ke komponen agar bisa refresh spesifik halaman (page)
  return useMutation({
    mutationFn: updateMatchStatus,
  });
};

export default usePostMatchData;