import { useState } from 'react';

const useUploadFile = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);

  // Tambahkan parameter onProgress untuk mengirim event ke UI
  const uploadFile = async (files, institutionName, onProgress) => {
    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      files.forEach((fileItem) => {
        formData.append('files', fileItem); 
      });
      formData.append('institution_name', institutionName);

      // Gunakan Fetch API untuk membaca stream
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/files/`, {
        method: 'POST',
        body: formData,
        // Content-Type akan diatur otomatis oleh browser beserta boundary-nya
      });

      if (!response.ok) {
        throw new Error(`Unexpected response status: ${response.status}`);
      }

      // Inisialisasi Reader untuk membaca stream SSE
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        // Decode byte ke string dan tambahkan ke buffer
        buffer += decoder.decode(value, { stream: true });
        
        // Memecah chunk berdasarkan format SSE standar (\n\n)
        const parts = buffer.split('\n\n');
        
        // Simpan sisa potongan yang belum lengkap kembali ke buffer
        buffer = parts.pop(); 

        for (const part of parts) {
          if (part.startsWith('data: ')) {
            try {
              const jsonData = JSON.parse(part.substring(6)); // Menghapus string 'data: '
              // Lemparkan event stream ke fungsi callback di UI
              if (onProgress) onProgress(jsonData);
            } catch (err) {
              console.error("Gagal parsing stream JSON:", err);
            }
          }
        }
      }
      
      return true;

    } catch (err) {
      setError(err);
      return false;
    } finally {
      setIsUploading(false);
    }
  };

  return { uploadFile, isUploading, error };
};

export default useUploadFile;