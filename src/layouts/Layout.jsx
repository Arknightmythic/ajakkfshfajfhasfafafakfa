import { Outlet, useLocation } from 'react-router-dom';
import { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

const SIDEBAR_EXPANDED_WIDTH = 'ml-64';
const SIDEBAR_COLLAPSED_WIDTH = 'ml-16';

const Layout = () => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [showChatbot, setShowChatbot] = useState(false);

  const chatbotUrl = import.meta.env.VITE_CHATBOT_URL;

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
              bottom: '5rem',
              right: '1.5rem',
              width: '24rem',
              height: '40rem',
              borderRadius: '0.5rem',
              overflow: 'hidden',
              boxShadow: '0 0 12px rgba(0,0,0,0.15)',
              zIndex: 9998,
              backgroundColor: 'white',
            }}
          >
            <iframe
              src={chatbotUrl}
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
              }}
              allow="microphone"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Layout;