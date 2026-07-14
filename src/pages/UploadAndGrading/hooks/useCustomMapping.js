import { useMutation } from '@tanstack/react-query';
import axiosInstance from '../../../axios/axiosInstance';

// ── Fungsi request DI-EXPORT TERPISAH (sama pola dengan listenToSyncStream
// di useSync.js) supaya bisa dipanggil langsung di luar konteks mutation,
// misal untuk polling status di dalam useEffect.

export const activateCustomMapping = async (fileId) => {
  const { data } = await axiosInstance.general.post(
    `/custom-mapping/${fileId}/activate`,
  );
  return data;
};

export const getCustomMapping = async (fileId) => {
  const { data } = await axiosInstance.general.get(
    `/custom-mapping/${fileId}`,
  );
  return data;
};

export const saveCustomMapping = async (fileId, pairs) => {
  const { data } = await axiosInstance.general.put(
    `/custom-mapping/${fileId}`,
    { pairs },
  );
  return data;
};

// ── React Query mutation wrappers ───────────────────────────────────────

export const useActivateCustomMapping = () => {
  return useMutation({
    mutationFn: (fileId) => activateCustomMapping(fileId),
  });
};

export const useSaveCustomMapping = () => {
  return useMutation({
    mutationFn: ({ fileId, pairs }) => saveCustomMapping(fileId, pairs),
  });
};