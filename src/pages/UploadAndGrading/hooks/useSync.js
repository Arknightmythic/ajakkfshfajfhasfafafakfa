import { useMutation } from '@tanstack/react-query';
import axiosInstance from '../../../axios/axiosInstance';

const syncByGrade = async ({ id }) => {
  // 1. Tembak POST untuk mengubah status DB menjadi PROCESSING
  await axiosInstance.general.post(`/match/?file_id=${id}`, null);

  // 2. Polling ke Database setiap 3 detik
  return new Promise((resolve, reject) => {
    const interval = setInterval(async () => {
      try {
        const statusRes = await axiosInstance.general.get(`/match/status/${id}`);
        const currentStatus = statusRes.data.matching_task_status;

        if (currentStatus === 'SUCCESS') {
          clearInterval(interval);
          resolve(statusRes.data); 
        } else if (currentStatus === 'FAILED') {
          clearInterval(interval);
          reject(new Error("Proses matching gagal di background server."));
        }
        // Jika PROCESSING atau IDLE, biarkan interval terus berjalan...
        
      } catch (err) {
        clearInterval(interval);
        reject(err);
      }
    }, 3000); 
  });
};

const useSync = () => {
  return useMutation({
    mutationFn: syncByGrade,
  });
};

export default useSync;