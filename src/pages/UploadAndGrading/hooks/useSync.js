import { useMutation } from '@tanstack/react-query';
import axiosInstance from '../../../axios/axiosInstance';

const syncByGrade = async ({ id, onLog }) => {
  
  await axiosInstance.general.post(`/match/?file_id=${id}`, null);
  return new Promise((resolve, reject) => {
    const baseURL = axiosInstance.general.defaults.baseURL;
    const url     = `${baseURL}/match/stream/${id}`;

    const response$ = fetch(url, {
      method : 'GET',
      headers: { Accept: 'text/event-stream' },
    });

    let finalStatus = null; 

    response$
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`SSE connection failed: ${response.status}`);
        }

        const reader  = response.body.getReader();
        const decoder = new TextDecoder();
        let   buffer  = '';

        
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

const useSync = () => {
  return useMutation({
    mutationFn: ({ id, onLog }) => syncByGrade({ id, onLog }),
  });
};

export default useSync;