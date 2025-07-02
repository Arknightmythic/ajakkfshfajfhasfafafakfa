import { useMutation } from '@tanstack/react-query';
import axiosInstance from '../../../axios/axiosInstance';

const syncByGrade = async ({ id, grade }) => {
  const lowerGrade = grade?.toLowerCase();
  const endpoint = `/api/sync/grade-${lowerGrade}`;

  const res = await axiosInstance.synchronize.post(endpoint, {
    file_id: id,
  });

  console.log("line 12", res)
  return res.data; 
};

const useSync = () => {
  return useMutation({
    mutationFn: syncByGrade,
  });
};

export default useSync;
