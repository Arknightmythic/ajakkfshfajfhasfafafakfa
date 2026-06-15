import { Outlet, useLocation } from 'react-router-dom';
import { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import Chatbot from '../components/Chatbot';

const SIDEBAR_EXPANDED_WIDTH = 'ml-64';
const SIDEBAR_COLLAPSED_WIDTH = 'ml-16';

const Layout = () => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [showChatbot, setShowChatbot] = useState(false);
  const [isChatbotExpanded, setIsChatbotExpanded] = useState(false);

  const hideHeaderRoutes = [
    '/batch-synchronization/preview',
    '/batch-synchronization/investigate',
  ];
  const shouldHideHeader = hideHeaderRoutes.includes(location.pathname);

  return (
    <div className="flex min-h-screen">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((prev) => !prev)} />

      <div
        className={`flex flex-col flex-1 relative z-0 transition-all duration-300 ease-in-out ${
          collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_EXPANDED_WIDTH
        }`}
      >
        {!shouldHideHeader && <Header />}
        <main className="flex-1 px-8 pt-8 bg-[#F9FAFB] overflow-auto relative">
          <Outlet />
        </main>

        <button
          onClick={() => setShowChatbot(!showChatbot)}
          style={{
            position: 'fixed',
            bottom: '1.5rem',
            right: '1.5rem',
            zIndex: 9999,
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            backgroundColor: '#1C64F2',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            fontSize: '24px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          }}
          aria-label="Open Chatbot"
        >
          💬
        </button>

        {showChatbot && (
          <div
            style={{
              position: 'fixed',
              // Selalu dipatok 6rem dari bawah agar tidak pernah menutupi tombol (1.5rem + 56px + gap)
              bottom: '6rem', 
              right: '1.5rem',
              // Lebar menyesuaikan ke arah kiri
              left: isChatbotExpanded ? `calc(${collapsed ? '4rem' : '16rem'} + 1.5rem)` : 'auto',
              width: isChatbotExpanded ? 'auto' : '28rem',
              // Tinggi dasar, namun...
              height: isChatbotExpanded ? 'calc(100vh - 12rem)' : '42rem',
              // ...KUNCI UTAMA: Tidak akan pernah melebihi batas ini meskipun di-scale up (melindungi area Header)
              maxHeight: 'calc(100vh - 12rem)', 
              borderRadius: '0.75rem',
              overflow: 'hidden',
              boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
              zIndex: 9998,
              backgroundColor: 'white',
              display: 'flex',
              flexDirection: 'column',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            <Chatbot 
              isExpanded={isChatbotExpanded} 
              onToggleExpand={() => setIsChatbotExpanded(!isChatbotExpanded)} 
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Layout;