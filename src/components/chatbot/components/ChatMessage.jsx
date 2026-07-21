import { useMemo } from 'react';
import { Bot, User, Loader2, Wrench, ChevronDown, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const isInternalHref = (href = '') => href.startsWith('/') && !href.startsWith('//');

/* eslint-disable no-unused-vars */
const createMarkdownComponents = (isUser, navigate) => ({
  // Tailwind preflight men-set `a { color: inherit; text-decoration: inherit }`,
  // jadi tanpa override ini link tampil persis seperti teks biasa.
  a: ({ node, href = '', children, ...props }) => {
    const base =
      'font-medium underline underline-offset-2 decoration-2 rounded-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 [overflow-wrap:anywhere]';
    const tone = isUser
      ? 'text-white decoration-white/50 hover:decoration-white focus-visible:ring-white/70'
      : 'text-blue-600 decoration-blue-300 hover:text-blue-700 hover:decoration-blue-600 focus-visible:ring-blue-500';

    if (isInternalHref(href)) {
      return (
        <a
          href={href}
          onClick={(e) => {
            e.preventDefault();
            navigate(href);
          }}
          className={`${base} ${tone}`}
          {...props}
        >
          {children}
        </a>
      );
    }

    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={`${base} ${tone} inline-flex items-baseline gap-1`}
        {...props}
      >
        {children}
        <ExternalLink
          className="w-3 h-3 flex-shrink-0 self-center opacity-70"
          aria-hidden="true"
        />
      </a>
    );
  },

  table: ({ node, ...props }) => (
    <div className="w-full overflow-x-auto my-3 rounded-lg border border-gray-200">
      <table className="min-w-full border-collapse text-sm" {...props} />
    </div>
  ),
  thead: ({ node, ...props }) => <thead className="bg-gray-100/50" {...props} />,
  th: ({ node, ...props }) => <th className="border-b border-gray-200 px-4 py-2 font-semibold text-left whitespace-nowrap" {...props} />,
  td: ({ node, ...props }) => <td className="border-b border-gray-200 px-4 py-2 whitespace-nowrap" {...props} />,

  ul: ({ node, ...props }) => <ul className="list-disc pl-5 my-2 space-y-1" {...props} />,
  ol: ({ node, ...props }) => <ol className="list-decimal pl-5 my-2 space-y-1" {...props} />,
  li: ({ node, ...props }) => <li className="marker:text-gray-500" {...props} />,
  p: ({ node, ...props }) => <p className="mb-2 last:mb-0 break-words" {...props} />,
  strong: ({ node, ...props }) => (
    <strong className={`font-bold ${isUser ? 'text-white' : 'text-gray-900'}`} {...props} />
  ),

  // react-markdown v10 sudah tidak mengirim prop `inline`, jadi deteksi block
  // code lewat className `language-*` yang ditempel remark.
  pre: ({ node, ...props }) => (
    <pre
      className="my-2 p-3 bg-gray-900 text-gray-100 rounded-lg overflow-x-auto text-xs font-mono"
      {...props}
    />
  ),
  code: ({ node, className, ...props }) => {
    const isBlock = Boolean(className && className.includes('language-'));
    if (isBlock) return <code className={className} {...props} />;
    return (
      <code
        className={`px-1 py-0.5 rounded text-xs font-mono break-all ${
          isUser ? 'bg-blue-700/60 text-white' : 'bg-gray-100 text-pink-600'
        }`}
        {...props}
      />
    );
  },
});
/* eslint-enable no-unused-vars */

export default function ChatMessage({ msg, isLoading }) {
  const isUser = msg.role === 'user';
  const navigate = useNavigate();

  const markdownComponents = useMemo(
    () => createMarkdownComponents(isUser, navigate),
    [isUser, navigate]
  );

  return (
    <div className={`flex items-start gap-4 w-full ${isUser ? 'flex-row-reverse' : ''}`}>
      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-sm ${isUser ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 text-gray-600'}`}>
        {isUser ? <User className="w-6 h-6" /> : <Bot className="w-6 h-6" />}
      </div>

      <div className={`flex flex-col max-w-[80%] min-w-0 ${isUser ? 'items-end' : 'items-start'}`}>
        <div className={`px-5 py-3 rounded-2xl shadow-sm max-w-full ${isUser ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white text-gray-800 border border-gray-200 rounded-tl-none'}`}>

          {/* Bagian Expandable Tool Messages */}
          {!isUser && msg.processes && msg.processes.length > 0 && (
            <details className="mb-3 group/main">
              <summary className="list-none cursor-pointer flex items-center gap-2 text-xs font-medium text-gray-500 hover:text-blue-600 select-none bg-gray-50 px-3 py-2 rounded-lg border border-gray-200 w-fit transition-colors">
                <div className="flex items-center gap-1.5">
                  {msg.processes.some(p => p.status === 'running') ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-500" />
                  ) : (
                    <Wrench className="w-3.5 h-3.5 text-gray-500" />
                  )}
                  <span>{msg.processes.length} proses internal</span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 transition-transform duration-200 group-open/main:rotate-180" />
              </summary>

              <div className="mt-2 space-y-2 pl-2 border-l-2 border-gray-200 ml-2">
                {msg.processes.map((proc, idx) => (
                  <details key={idx} className="group/tool bg-white border border-gray-200 rounded-md overflow-hidden shadow-sm">
                    <summary className="flex items-center gap-2 text-[11px] text-gray-600 p-2 cursor-pointer hover:bg-gray-50 select-none list-none">
                      {proc.status === 'running' ? (
                        <Loader2 className="w-3 h-3 animate-spin text-blue-500" />
                      ) : (
                        <Wrench className="w-3 h-3 text-green-500" />
                      )}
                      <span className="font-mono flex-1 truncate">{proc.name} {proc.status === 'running' ? '...' : ''}</span>
                      {proc.result && <ChevronDown className="w-3 h-3 text-gray-400 group-open/tool:rotate-180 transition-transform" />}
                    </summary>

                    {proc.result && (
                      <div className="p-2 bg-gray-50 border-t border-gray-200 text-[10px] font-mono text-gray-700 overflow-x-auto whitespace-pre-wrap max-h-40 overflow-y-auto">
                        {proc.result}
                      </div>
                    )}
                  </details>
                ))}
              </div>
            </details>
          )}

          <div className="text-sm leading-relaxed overflow-x-auto break-words">
            {msg.content || (!isUser && isLoading && msg.processes?.length === 0) ? (
              !msg.content ? (
                <span className="animate-pulse">Mengetik...</span>
              ) : (
                <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                  {msg.content}
                </ReactMarkdown>
              )
            ) : null}
          </div>

        </div>
      </div>
    </div>
  );
}