import { MessageSquare, Plus, X } from 'lucide-react';

export default function ChatSidebar({ 
  isOpen, 
  onClose, 
  sessions, 
  activeSessionId, 
  onSelectSession, 
  onNewSession 
}) {

  // Helper function untuk mengubah UTC dari API menjadi Waktu Jakarta
  const formatJakartaTime = (dateString) => {
    if (!dateString) return '';
    // Tambahkan 'Z' ke belakang string jika belum ada agar JS tahu ini adalah format UTC
    const utcDateString = dateString.endsWith('Z') ? dateString : `${dateString}Z`;
    const dateObj = new Date(utcDateString);

    return dateObj.toLocaleString('id-ID', {
      timeZone: 'Asia/Jakarta',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  return (
    <div 
      className={`absolute inset-y-0 left-0 w-64 bg-gray-50 border-r border-gray-200 z-50 transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } flex flex-col shadow-xl`}
    >
      <div className="p-4 flex items-center justify-between border-b border-gray-200 bg-white">
        <h3 className="font-semibold text-gray-800">Riwayat Obrolan</h3>
        <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-md text-gray-500">
          <X className="w-5 h-5" />
        </button>
      </div>
      
      <div className="p-3">
        <button
          onClick={onNewSession}
          className="w-full flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Percakapan Baru
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-1">
        {sessions.map((session) => (
          <button
            key={session.id}
            onClick={() => {
              onSelectSession(session.id);
              onClose(); 
            }}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-colors ${
              activeSessionId === session.id 
                ? 'bg-blue-100 text-blue-700' 
                : 'hover:bg-gray-200 text-gray-700'
            }`}
          >
            <MessageSquare className="w-4 h-4 flex-shrink-0" />
            <div className="overflow-hidden">
              <p className="text-sm font-medium truncate">{session.title || 'New Conversation'}</p>
              <p className="text-[10px] opacity-70 mt-0.5 truncate">
                {formatJakartaTime(session.created_at)}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}