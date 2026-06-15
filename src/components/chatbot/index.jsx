import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Menu, Maximize2, Minimize2 } from 'lucide-react';
import { useChatSession } from './hooks/useChatSession';
import { useChatMessages } from './hooks/useChatMessages';
import ChatSidebar from './components/ChatSidebar';
import ChatMessage from './components/ChatMessage';

// Tangkap props isExpanded dan onToggleExpand dari Layout
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

  const activeSessionTitle = sessions.find(s => s.id === activeSessionId)?.title || 'Chatbot';

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
    setInput('');
  };

  return (
    <div className="flex flex-col h-full w-full bg-white overflow-hidden relative">
      
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
        
        {/* flex-1 agar teks mengambil seluruh sisa ruang di tengah */}
        <div className="overflow-hidden flex-1">
          <h2 className="text-base font-semibold text-white truncate">{activeSessionTitle}</h2>
          <p className="text-blue-200 text-[10px]">User: {userId}</p>
        </div>

        {/* Tombol Expand/Collapse */}
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

      {/* Message Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-gray-50">
        {messages.map((msg) => (
          <ChatMessage key={msg.id} msg={msg} isLoading={isLoading} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 bg-white border-t border-gray-200 z-10">
        <form onSubmit={handleSubmit} className="flex items-end gap-2">
          <div className="relative flex-1">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              placeholder="Ketik pesan..."
              className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block p-3 resize-none max-h-32"
              rows={1}
              disabled={isLoading || !activeSessionId}
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !input.trim() || !activeSessionId}
            className="flex-shrink-0 inline-flex justify-center items-center p-3 text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </form>
      </div>
    </div>
  );
}