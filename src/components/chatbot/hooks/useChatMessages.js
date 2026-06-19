import { useState, useEffect } from 'react';
import axiosInstance from '../../../axios/axiosInstance';

export function useChatMessages(activeSessionId, userId, updateSessionTitle) {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!activeSessionId) return;
    
    const fetchHistory = async () => {
      // 1. Segera kosongkan pesan sebelumnya ketika berpindah sesi atau membuat sesi baru
      setMessages([]);
      setIsLoading(true);

      try {
        const res = await axiosInstance.general.get(`/agent/conversations/${activeSessionId}`);
        const data = res.data; 
        
        if (Array.isArray(data) && data.length > 0) {
          const formatted = data.map(msg => ({
            id: msg.id,
            role: msg.role === 'human' ? 'user' : 'ai',
            content: msg.content,
            processes: [] 
          }));
          setMessages(formatted);
        } else {
          setMessages([{
            id: 'welcome',
            role: 'ai',
            content: 'Halo! Saya asisten AI Anda. Ada yang bisa saya bantu hari ini?',
            processes: [],
          }]);
        }
      } catch (error) {
        console.error('Error fetching messages', error);
        // 2. Berikan fallback pesan baru apabila API mengembalikan error (misal: sesi baru belum ada di DB)
        setMessages([{
          id: 'welcome',
          role: 'ai',
          content: 'Halo! Saya asisten AI Anda. Ada yang bisa saya bantu hari ini?',
          processes: [],
        }]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, [activeSessionId]);

  const sendMessage = async (input) => {
    if (!input.trim() || isLoading || !activeSessionId) return;

    setIsLoading(true);
    const userMessageId = Date.now().toString();
    const aiMessageId = (Date.now() + 1).toString();

    setMessages((prev) => [
      ...prev,
      { id: userMessageId, role: 'user', content: input },
      { id: aiMessageId, role: 'ai', content: '', processes: [] },
    ]);

    try {
      const baseUrl = axiosInstance.general.defaults.baseURL || import.meta.env.VITE_BACKEND_URL;

      const response = await fetch(`${baseUrl}/agent/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversation_id: activeSessionId,
          query: input,
          user_id: userId,
        }),
      });
      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let isDone = false;
      let buffer = '';

      while (!isDone) {
        const { value, done } = await reader.read();
        if (done) { isDone = true; break; }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const jsonStr = line.substring(6).trim();
            if (!jsonStr) continue;

            try {
              const data = JSON.parse(jsonStr);

              if (data.step === 'TITLE' && data.content) {
                updateSessionTitle(activeSessionId, data.content);
                continue; 
              }

              setMessages((prev) =>
                prev.map((msg) => {
                  if (msg.id === aiMessageId) {
                    let newContent = msg.content;
                    let newProcesses = [...(msg.processes || [])];

                    if (data.step === 'AIMessageChunk' && data.content) {
                      newContent += data.content;
                    }

                    if (data.step === 'AIMessageChunk' && data.tool_calls) {
                      data.tool_calls.forEach((tool) => {
                        newProcesses.push({ id: tool.id, name: tool.name, status: 'running', result: null });
                      });
                    }

                    if (data.step === 'ToolMessage') {
                      const runningIndex = newProcesses.findIndex(p => p.status === 'running');
                      if (runningIndex !== -1) {
                        newProcesses[runningIndex].status = 'done';
                        newProcesses[runningIndex].result = data.content; 
                      } else if (newProcesses.length > 0) {
                        newProcesses[newProcesses.length - 1].status = 'done';
                        newProcesses[newProcesses.length - 1].result = data.content;
                      }
                    }

                    if (data.step === 'END') {
                      newProcesses = newProcesses.map(p => ({ ...p, status: 'done' }));
                    }

                    return { ...msg, content: newContent, processes: newProcesses };
                  }
                  return msg;
                })
              );
            } catch (err) {
               console.error('JSON Parse error on stream', err);
            }
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages((prev) => [...prev, { id: Date.now().toString(), role: 'ai', content: 'Terjadi kesalahan sistem.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return { messages, isLoading, sendMessage };
}