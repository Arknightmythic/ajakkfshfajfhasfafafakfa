import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../../axios/axiosInstance";

const postMatchData = async (data) => {
  const res = await axiosInstance.general.post("/sync/matching", data);
  console.log("line 6",res)
  return res.data;
};

const usePostMatchData = (metadata_id) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postMatchData,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["investigation", metadata_id] });
    },
  });
};

export default usePostMatchData;
