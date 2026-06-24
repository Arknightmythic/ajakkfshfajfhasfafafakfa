import { useMutation } from '@tanstack/react-query';
import axiosInstance from '../../../axios/axiosInstance';

// 1. Fungsi ini DI-EXPORT TERPISAH agar bisa dipanggil saat RECONNECT (Refresh)
export const listenToSyncStream = (id, onLog) => {
  return new Promise((resolve, reject) => {
    const baseURL = axiosInstance.general.defaults.baseURL;
    const url     = `${baseURL}/match/stream/${id}`;

    fetch(url, {
      method : 'GET',
      headers: { Accept: 'text/event-stream' },
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`SSE connection failed: ${response.status}`);
        }

        const reader  = response.body.getReader();
        const decoder = new TextDecoder();
        let   buffer  = '';
        let   finalStatus = null; 

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          const parts = buffer.split('\n\n');
          buffer = parts.pop(); 

          for (const part of parts) {
            if (!part.startsWith('data: ')) continue;

            let payload;
            try {
              payload = JSON.parse(part.substring(6));
            } catch {
              continue;
            }

            if (payload.message === '__DONE__') {
              finalStatus = payload.level; 
              await reader.cancel();
              break;
            }
            if (onLog) onLog(payload);
          }
          if (finalStatus !== null) break;
        }

        if (finalStatus === 'SUCCESS') {
          resolve({ matching_task_status: 'SUCCESS', file_id: id });
        } else {
          reject(new Error('Proses matching gagal di server. Cek log untuk detail.'));
        }
      })
      .catch((err) => {
        reject(new Error(`Gagal terhubung ke stream: ${err.message}`));
      });
  });
};

// 2. Fungsi utama yang dipanggil saat tombol "Start Synchronization" diklik pertama kali
const syncByGrade = async ({ id, onLog }) => {
  // A. Tembak POST untuk mengubah status DB menjadi PROCESSING dan trigger task background
  await axiosInstance.general.post(`/match/?file_id=${id}`, null);
  
  // B. Panggil fungsi stream di atas untuk mendengarkan log
  return listenToSyncStream(id, onLog);
};

const useSync = () => {
  return useMutation({
    mutationFn: syncByGrade,
  });
};

export default useSync;