import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { menu } from '../configs/menu';
import { DatabaseZap } from 'lucide-react';

const Sidebar = () => {
  const [currentPath, setCurrentPath] = useState('');
  const location = useLocation();


  useEffect(() => {
    setCurrentPath(location.pathname);
  }, [location.pathname]);

    const isActive = (path) => {
      return currentPath === path || currentPath.startsWith(path + '/');
    };

  return (
    <nav className="w-64 bg-slate-900 text-slate-300 flex flex-col fixed h-full">
        <div className="flex items-center justify-center h-20 border-b border-slate-800">
            <div className="flex items-center space-x-3">
                <div className="bg-blue-600 p-2 rounded-lg">
                    <DatabaseZap className="text-white" />
                </div>
                <h1 className="text-xl font-bold text-white">syncrono<span className="text-blue-400">.ai</span></h1>
            </div>
        </div>


        <div className="flex-1 px-4 py-6 space-y-2 overflow-y-auto sidebar-scroll">
            {menu.map((item) => (
            <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-4 py-2.5 rounded-lg transition-colors duration-200 hover:bg-slate-800 ${
                isActive(item.path) ? 'bg-slate-800 text-white' : ''
                }`}
            >
                <item.icon className="w-5 h-5 mr-3" />
                <span>{item.title}</span>
            </Link>
            ))}
        </div>
    </nav>

  );
};

export default Sidebar;