import { useMutation } from '@tanstack/react-query';
import axiosInstance from '../../../axios/axiosInstance';

// 1. Fungsi ini DI-EXPORT TERPISAH agar bisa dipanggil saat RECONNECT (Refresh)
// Default stopKeyword = '__MATCHING_DONE__' karena itu satu-satunya sentinel yang
// dikirim backend saat matching SUKSES (lihat processing/tasks.py push_log).
// '__DONE__' backend HANYA mengirimkannya di jalur FAILED, jadi kalau default ini
// tetap '__DONE__', pemanggil yang lupa mengoper stopKeyword akan menunggu sampai
// timeout 15 menit walau matching-nya sudah sukses (lihat BUG_FIXING_GUIDE.md #1).
export const listenToSyncStream = (id, onLog, stopKeyword = '__MATCHING_DONE__') => {
  return new Promise((resolve, reject) => {
    const baseURL = axiosInstance.general.defaults.baseURL;
    const url     = `${baseURL}/match/stream/${id}`;

    fetch(url, {
      method : 'GET',
      headers: { Accept: 'text/event-stream' },
    })
      .then(async (response) => {
        if (!response.ok) throw new Error(`SSE connection failed: ${response.status}`);

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
            try { payload = JSON.parse(part.substring(6)); } 
            catch { continue; }

            // ── LOGIKA PEMBERHENTIAN ──
            // Berhenti jika menemui stopKeyword yang diminta ATAU __DONE__ (penutup absolut)
            if (payload.message === stopKeyword || payload.message === '__DONE__') {
              finalStatus = payload.level; 
              await reader.cancel();
              break;
            }

            // Sembunyikan kata kunci internal agar tidak ter-render di UI log
            if (payload.message === '__MATCHING_DONE__') continue;

            if (onLog) onLog(payload);
          }
          if (finalStatus !== null) break;
        }

        if (finalStatus === 'SUCCESS') {
          resolve({ matching_task_status: 'SUCCESS', file_id: id });
        } else {
          reject(new Error('Proses gagal di server. Cek log untuk detail.'));
        }
      })
      .catch((err) => reject(new Error(`Gagal terhubung ke stream: ${err.message}`)));
  });
};

// Tambahkan support stopKeyword untuk syncByGrade
const syncByGrade = async ({ id, onLog, stopKeyword = '__MATCHING_DONE__' }) => {
  await axiosInstance.general.post(`/match/?file_id=${id}`, null);
  return listenToSyncStream(id, onLog, stopKeyword);
};

const useSync = () => {
  return useMutation({
    mutationFn: syncByGrade,
  });
};

export default useSync;