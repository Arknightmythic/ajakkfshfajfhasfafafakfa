import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { menu } from "../configs/menu";
import { DatabaseZap, ChevronLeft, ChevronRight } from "lucide-react";

const Sidebar = ({ collapsed, onToggle }) => {
  const [currentPath, setCurrentPath] = useState("");
  const location = useLocation();

  useEffect(() => {
    setCurrentPath(location.pathname);
  }, [location.pathname]);

  const isActive = (path) => {
    return currentPath === path || currentPath.startsWith(path + "/");
  };

  return (
    <nav
      className={`bg-slate-900 text-slate-300 flex flex-col fixed h-full transition-all duration-300 ease-in-out z-20 ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      {/* ── Header: title + toggle button ── */}
      <div
        className={`flex items-center h-20 border-b border-slate-800 px-3 shrink-0 ${
          collapsed ? "justify-center" : "justify-between"
        }`}
      >
        {!collapsed && (
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-2 rounded-lg shrink-0">
              <DatabaseZap className="text-white w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-white whitespace-nowrap">
              syncrono<span className="text-blue-400">.ai</span>
            </h1>
          </div>
        )}

        {collapsed && (
          <div className="bg-blue-600 p-2 rounded-lg">
            <DatabaseZap className="text-white w-5 h-5" />
          </div>
        )}

        <button
          onClick={onToggle}
          className={`text-slate-400 hover:text-white hover:bg-slate-700 rounded-md p-1 transition-colors duration-150 shrink-0 ${
            collapsed
              ? "absolute -right-3 top-7 bg-slate-800 border border-slate-700 rounded-full p-0.5 shadow-md"
              : ""
          }`}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* ── Menu items ── */}
      <span className="flex-1 px-2 py-6 space-y-1 overflow-y-auto overflow-x-hidden sidebar-scroll">
        {menu.map((item) => {
          const active = isActive(item.path);
          return (
            // "group" di sini agar tooltip child bisa pakai group-hover
            <div key={item.path} className="relative group">
              <Link
                to={item.path}
                className={`flex items-center rounded-lg transition-colors duration-200 hover:bg-slate-800 ${
                  collapsed ? "justify-center px-0 py-2.5" : "px-4 py-2.5"
                } ${active ? "bg-slate-800 text-white" : ""}`}
              >
                <item.icon
                  className={`w-5 h-5 shrink-0 ${collapsed ? "" : "mr-3"}`}
                />
                {!collapsed && (
                  <span className="whitespace-nowrap">{item.title}</span>
                )}
              </Link>

              {/* Tooltip — hanya tampil saat collapsed */}
              {collapsed && (
                <div
                  className="absolute left-full top-1/2 -translate-y-1/2 ml-4 bg-slate-700 text-white text-xs font-medium px-2.5 py-1.5 rounded-md whitespace-nowrap shadow-lg border border-slate-600 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 z-50"
                >
                  {item.title}
                  {/* panah kiri tooltip */}
                  <span
                    className="absolute right-full top-1/2 -translate-y-1/2
                                 border-4 border-transparent border-r-slate-700"
                  />
                </div>
              )}
            </div>
          );
        })}
      </span>

      {/* ── Area kosong di bawah menu: klik untuk toggle ── */}
      <div
        className="flex-1 cursor-pointer"
        onClick={onToggle}
        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      />
    </nav>
  );
};

export default Sidebar;
