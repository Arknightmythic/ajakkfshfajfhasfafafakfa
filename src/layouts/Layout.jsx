import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = () => {
  return (
    <div className="flex min-h-screen">
      <div className="w-64 z-10">
        <Sidebar />
      </div>

      <div className="flex flex-col flex-1 relative z-0">
        <Header />
        <main className="flex-1 px-8 pt-8 bg-[#F9FAFB] overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
