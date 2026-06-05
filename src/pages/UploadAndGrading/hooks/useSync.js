import { useMutation } from '@tanstack/react-query';
import axiosInstance from '../../../axios/axiosInstance';

const syncByGrade = async ({ id }) => {
  // Gunakan endpoint baru
  const endpoint = `/match/?file_id=${id}`;

  // Sesuai postman: Body dikosongkan
  const res = await axiosInstance.general.post(endpoint, null);

  return res.data; 
};

const useSync = () => {
  return useMutation({
    mutationFn: syncByGrade,
  });
};

export default useSync;