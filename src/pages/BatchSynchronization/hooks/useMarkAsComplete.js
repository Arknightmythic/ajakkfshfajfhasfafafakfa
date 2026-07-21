import { useMutation } from "@tanstack/react-query";
import axiosInstance from "../../../axios/axiosInstance";

// Endpoint sebenarnya: PATCH /mark-as-completed/files/{file_id}
// (lihat retrieval/routes.py). Sebelumnya hook ini menembak
// POST /sync/mark-as-done/{id} yang tidak pernah ada di backend (404).
const markAsComplete = async (file_id) => {
  const res = await axiosInstance.general.patch(`/mark-as-completed/files/${file_id}`);
  return res.data;
};

const useMarkAsComplete = () => {
  return useMutation({
    mutationFn: markAsComplete,
    onError: (error) => {
      console.error("Failed to mark as completed:", error);
    },
  });
};

export default useMarkAsComplete;
