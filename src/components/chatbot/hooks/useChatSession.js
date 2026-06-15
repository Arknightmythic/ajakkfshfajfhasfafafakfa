import { useState, useEffect, useCallback, useRef } from 'react';
import { uniqueNamesGenerator, adjectives, animals } from 'unique-names-generator';
import { v4 as uuidv4 } from 'uuid';
import axiosInstance from '../../../axios/axiosInstance'; 

export function useChatSession() {
  // 1. Lazy Initialization: Kita langsung generate/ambil nama saat state dibuat.
  // Ini mencegah terjadinya re-render akibat perubahan userId di awal.
  const [userId] = useState(() => {
    let storedUser = localStorage.getItem('synchrono_user_id');
    if (!storedUser) {
      storedUser = uniqueNamesGenerator({
        dictionaries: [adjectives, animals],
        separator: '_',
        length: 2,
      });
      localStorage.setItem('synchrono_user_id', storedUser);
    }
    return storedUser;
  });

  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // useRef ini bertugas sebagai "satpam" agar fetch dari API awal hanya berjalan 1x
  // sekalipun React Strict Mode mencoba menjalankannya berkali-kali.
  const hasFetched = useRef(false);

  // 2. Fungsi membuat sesi baru (Dipicu saat user klik "Percakapan Baru")
  const startNewSession = useCallback(() => {
    const newId = uuidv4();
    const newSession = {
      id: newId,
      user_id: userId,
      title: 'New Conversation',
      created_at: new Date().toISOString(),
    };
    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newId);
    setIsSidebarOpen(false);
  }, [userId]);

  // 3. Fetch Daftar Sesi dari API
  const fetchSessions = useCallback(async () => {
    try {
      const response = await axiosInstance.general.get('/agent/conversations', {
        params: { user_id: userId }
      });
      const data = response.data;
      
      if (Array.isArray(data) && data.length > 0) {
        setSessions(data);
        setActiveSessionId(data[0].id);
      } else {
        // Jika DB kosong, kita cek dulu prev array-nya. 
        // Jika sudah ada isinya (mungkin dari eksekusi yg balapan), jangan buat sesi baru lagi.
        setSessions((prev) => {
          if (prev.length === 0) {
            const newId = uuidv4();
            setActiveSessionId(newId);
            return [{
              id: newId,
              user_id: userId,
              title: 'New Conversation',
              created_at: new Date().toISOString()
            }];
          }
          return prev;
        });
      }
    } catch (error) {
      console.error('Failed to fetch sessions', error);
      // Fallback jika API gagal
      setSessions((prev) => {
        if (prev.length === 0) {
          const newId = uuidv4();
          setActiveSessionId(newId);
          return [{ id: newId, user_id: userId, title: 'New Conversation', created_at: new Date().toISOString() }];
        }
        return prev;
      });
    }
  }, [userId]);

  // 4. Jalankan fetch pertama kali secara aman
  useEffect(() => {
    if (!hasFetched.current) {
      fetchSessions();
      hasFetched.current = true;
    }
  }, [fetchSessions]);

  // 5. Update Judul Sesi secara dinamis dari AI
  const updateSessionTitle = useCallback((sessionId, newTitle) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, title: newTitle } : s))
    );
  }, []);

  return {
    userId,
    sessions,
    activeSessionId,
    setActiveSessionId,
    startNewSession,
    updateSessionTitle,
    isSidebarOpen,
    setIsSidebarOpen,
  };
}