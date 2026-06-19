import { useMutation } from '@tanstack/react-query';
import axiosInstance from '../../../axios/axiosInstance';

const syncByGrade = async ({ id }) => {
  // 1. Tembak POST untuk mengubah status DB menjadi PROCESSING
  await axiosInstance.general.post(`/match/?file_id=${id}`, null);

  // 2. Polling ke Database setiap 3 detik
  return new Promise((resolve, reject) => {
    let errorCount = 0;
    const MAX_ERRORS = 5; // Toleransi maksimal 5 kali gagal request berturut-turut

    const interval = setInterval(async () => {
      try {
        const statusRes = await axiosInstance.general.get(`/match/status/${id}`);
        const currentStatus = statusRes.data.matching_task_status;

        // Reset error count jika request berhasil nembus
        errorCount = 0;

        if (currentStatus === 'SUCCESS') {
          clearInterval(interval);
          resolve(statusRes.data); 
        } else if (currentStatus === 'FAILED') {
          clearInterval(interval);
          reject(new Error("Proses matching gagal di background server."));
        }
        // Jika PROCESSING atau IDLE, biarkan interval terus berjalan...
        
      } catch (err) {
        console.warn("Terjadi kendala jaringan saat polling:", err.message);
        errorCount++;
        
        // Hanya hentikan polling jika gagal berturut-turut melebihi batas
        if (errorCount >= MAX_ERRORS) {
          clearInterval(interval);
          reject(new Error("Gagal terhubung ke server setelah beberapa kali percobaan."));
        }
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