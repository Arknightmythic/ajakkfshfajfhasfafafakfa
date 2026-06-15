import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Wrench, ChevronDown } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

/* eslint-disable no-unused-vars */
const MarkdownComponents = {
  table: ({ node, ...props }) => (
    <table className="min-w-full border-collapse border border-gray-300 my-3 text-sm" {...props} />
  ),
  thead: ({ node, ...props }) => (
    <thead className="bg-gray-100/50" {...props} />
  ),
  th: ({ node, ...props }) => (
    <th className="border border-gray-300 px-4 py-2 font-semibold text-left" {...props} />
  ),
  td: ({ node, ...props }) => (
    <td className="border border-gray-300 px-4 py-2" {...props} />
  ),
  ul: ({ node, ...props }) => (
    <ul className="list-disc pl-5 my-2 space-y-1" {...props} />
  ),
  ol: ({ node, ...props }) => (
    <ol className="list-decimal pl-5 my-2 space-y-1" {...props} />
  ),
  li: ({ node, ...props }) => (
    <li className="marker:text-gray-500" {...props} />
  ),
  p: ({ node, ...props }) => (
    <p className="mb-2 last:mb-0" {...props} />
  ),
  strong: ({ node, ...props }) => (
    <strong className="font-bold text-gray-900" {...props} />
  ),
  code: ({ node, inline, ...props }) => (
    inline 
      ? <code className="bg-gray-100 text-pink-600 px-1 py-0.5 rounded text-xs font-mono" {...props} />
      : <code {...props} />
  )
};
/* eslint-enable no-unused-vars */

export default function Chatbot() {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'ai',
      content: 'Halo! Saya asisten AI Anda. Ada yang bisa saya bantu hari ini?',
      processes: [],
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input;
    setInput('');
    setIsLoading(true);

    const newUserMsg = { id: Date.now().toString(), role: 'user', content: userMessage };
    setMessages((prev) => [...prev, newUserMsg]);

    const aiMessageId = (Date.now() + 1).toString();
    setMessages((prev) => [
      ...prev,
      { id: aiMessageId, role: 'ai', content: '', processes: [] },
    ]);

    try {
      const response = await fetch('http://localhost:9191/agent/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversation_id: 'test_postman_40',
          query: userMessage,
        }),
      });

      if (!response.body) throw new Error('ReadableStream not supported.');

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let isDone = false;
      let buffer = '';

      while (!isDone) {
        const { value, done } = await reader.read();
        if (done) {
          isDone = true;
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const jsonStr = line.substring(6).trim();
            if (!jsonStr) continue;

            try {
              const data = JSON.parse(jsonStr);

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
                        newProcesses.push({
                          id: tool.id,
                          name: tool.name,
                          status: 'running',
                        });
                      });
                    }

                    if (data.step === 'ToolMessage') {
                      const runningProcIndex = newProcesses.findIndex(p => p.status === 'running');
                      if (runningProcIndex !== -1) {
                        newProcesses[runningProcIndex].status = 'done';
                      } else if (newProcesses.length > 0) {
                        newProcesses[newProcesses.length - 1].status = 'done';
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
              console.error('Error parsing stream data:', err, jsonStr);
            }
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString(), role: 'ai', content: 'Maaf, terjadi kesalahan saat menghubungi server.' }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-white overflow-hidden">
      {/* Header */}
      <div className="bg-blue-600 px-6 py-4 flex items-center gap-3 border-b border-blue-700">
        <div className="bg-white p-2 rounded-full shadow-sm">
          <Bot className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-white">Syncrono Agent</h2>
          <p className="text-blue-100 text-xs">Sedang aktif • ID: test_postman_40</p>
        </div>
      </div>

      {/* Message Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            {/* Avatar */}
            <div
              className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-sm ${
                msg.role === 'user' ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 text-gray-600'
              }`}
            >
              {msg.role === 'user' ? <User className="w-6 h-6" /> : <Bot className="w-6 h-6" />}
            </div>

            {/* Bubble */}
            <div
              className={`flex flex-col max-w-[85%] ${
                msg.role === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              <div
                className={`px-5 py-3 rounded-2xl shadow-sm ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-none'
                    : 'bg-white text-gray-800 border border-gray-200 rounded-tl-none'
                }`}
              >
                {/* Collapsible Agent Processing Steps UI */}
                {msg.processes && msg.processes.length > 0 && (
                  <details className="mb-3 group">
                    <summary className="list-none cursor-pointer flex items-center gap-2 text-xs font-medium text-gray-500 hover:text-blue-600 select-none bg-gray-50 px-3 py-2 rounded-lg border border-gray-200 w-fit transition-colors">
                      <div className="flex items-center gap-1.5">
                        {msg.processes.some(p => p.status === 'running') ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-500" />
                        ) : (
                          <Wrench className="w-3.5 h-3.5 text-gray-500" />
                        )}
                        <span>{msg.processes.length} proses internal dijalankan</span>
                      </div>
                      <ChevronDown className="w-3.5 h-3.5 transition-transform duration-200 group-open:rotate-180" />
                    </summary>
                    
                    {/* Detail processes yang terbuka jika diklik */}
                    <div className="mt-2 space-y-1.5 pl-2 border-l-2 border-gray-200 ml-2 animate-in fade-in slide-in-from-top-1">
                      {msg.processes.map((proc, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-[11px] text-gray-500">
                          {proc.status === 'running' ? (
                            <Loader2 className="w-3 h-3 animate-spin text-blue-500" />
                          ) : (
                            <Wrench className="w-3 h-3 text-green-500" />
                          )}
                          <span className="font-mono">
                            {proc.name} {proc.status === 'running' ? '...' : ''}
                          </span>
                        </div>
                      ))}
                    </div>
                  </details>
                )}

                {/* Text Content (Markdown) */}
                <div className="text-sm leading-relaxed overflow-x-auto">
                  {msg.content || (msg.role === 'ai' && isLoading && msg.processes?.length === 0) ? (
                    !msg.content ? (
                      <span className="animate-pulse">Mengetik...</span>
                    ) : (
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={MarkdownComponents}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    )
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-gray-200">
        <form onSubmit={handleSendMessage} className="flex items-end gap-2">
          <div className="relative flex-1">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e);
                }
              }}
              placeholder="Tanyakan sesuatu..."
              className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block p-3 pr-12 resize-none max-h-32"
              rows={1}
              disabled={isLoading}
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="flex-shrink-0 inline-flex justify-center items-center p-3 text-white bg-blue-600 rounded-xl hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 disabled:opacity-50 transition-colors"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </form>
      </div>
    </div>
  );
}