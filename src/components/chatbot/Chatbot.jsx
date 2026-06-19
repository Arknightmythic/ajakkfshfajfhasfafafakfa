import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Menu, Maximize2, Minimize2 } from 'lucide-react';
import { useChatSession } from './hooks/useChatSession';
import { useChatMessages } from './hooks/useChatMessages';
import ChatSidebar from './components/ChatSidebar';
import ChatMessage from './components/ChatMessage';

export default function Chatbot({ isExpanded, onToggleExpand }) {
  const { 
    userId, 
    sessions, 
    activeSessionId, 
    setActiveSessionId, 
    startNewSession, 
    updateSessionTitle,
    isSidebarOpen,
    setIsSidebarOpen
  } = useChatSession();

  const { messages, isLoading, sendMessage } = useChatMessages(
    activeSessionId, 
    userId, 
    updateSessionTitle
  );

  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null); // Ref untuk auto-resize text area

  const activeSessionTitle = sessions.find(s => s.id === activeSessionId)?.title || 'Chatbot';

  // Autoscroll ke pesan terbawah
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Reset tinggi text-area saat pesan kosong (selesai disubmit)
  useEffect(() => {
    if (input === '' && textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }, [input]);

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
    setInput('');
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
    // Auto-resize logic: Sesuaikan tinggi dengan scrollHeight
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Tambahkan overscroll-contain untuk mencegah background ikut di-scroll
  return (
    <div className="flex flex-col h-full w-full bg-white overflow-hidden relative overscroll-contain">
      
      <ChatSidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)}
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={setActiveSessionId}
        onNewSession={startNewSession}
      />

      {isSidebarOpen && (
        <div 
          className="absolute inset-0 bg-black/20 z-40" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Header */}
      <div className="bg-blue-600 px-4 py-3 flex items-center gap-3 border-b border-blue-700 z-10">
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 bg-blue-700/50 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        
        <div className="overflow-hidden flex-1">
          <h2 className="text-base font-semibold text-white truncate">{activeSessionTitle}</h2>
          <p className="text-blue-200 text-[10px]">User: {userId}</p>
        </div>

        {onToggleExpand && (
          <button
            onClick={onToggleExpand}
            className="p-2 bg-blue-700/50 hover:bg-blue-700 text-white rounded-lg transition-colors"
            title={isExpanded ? "Perkecil ukuran" : "Perbesar ukuran"}
          >
            {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        )}
      </div>

      {/* Message Area dengan overscroll-contain */}
      <div className="flex-1 overflow-y-auto overscroll-contain p-4 space-y-6 bg-gray-50">
        {messages.map((msg) => (
          <ChatMessage key={msg.id} msg={msg} isLoading={isLoading} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area (UI Diperbagus) */}
      <div className="p-3 bg-white border-t border-gray-200 z-10 shadow-[0_-4px_10px_-4px_rgba(0,0,0,0.05)]">
        <form onSubmit={handleSubmit} className="flex items-end gap-3">
          <div className="relative flex-1 bg-gray-50 border border-gray-300 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 rounded-2xl transition-all duration-200 shadow-inner overflow-hidden">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Ketik pesan..."
              className={`w-full bg-transparent text-gray-900 text-sm block px-4 py-3 resize-none outline-none transition-all ${
                // max-h-144px (sekitar 6 baris) jika expand, max-h-104px (sekitar 4 baris) jika collapse
                isExpanded ? 'max-h-[144px]' : 'max-h-[104px]'
              }`}
              rows={1}
              disabled={isLoading || !activeSessionId}
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !input.trim() || !activeSessionId}
            className="flex-shrink-0 inline-flex justify-center items-center p-3.5 text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm hover:shadow-md"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </form>
      </div>
    </div>
  );
}