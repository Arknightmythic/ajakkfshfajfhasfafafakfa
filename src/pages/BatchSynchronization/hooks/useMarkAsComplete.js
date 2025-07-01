import { useMutation } from "@tanstack/react-query";
import axiosInstance from "../../../axios/axiosInstance";

const markAsComplete = async (metadata_id) => {
  const res = await axiosInstance.general.post(`/sync/mark-as-done/${metadata_id}`);
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
