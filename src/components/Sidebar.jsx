import React from 'react';
import { Link, useLocation } from "react-router-dom";
// Jika Anda menggunakan Lucide-react atau Heroicons, ini akan lebih cantik. 
// Saya asumsikan Anda ingin tampilan yang bersih dengan Tailwind.

function Sidebar() {
  const location = useLocation();

  // Helper untuk mengecek apakah link sedang aktif
  const isActive = (path) => location.pathname === path;

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: '📊' },
    { name: 'Routing', path: '/routing', icon: '🛤️' },
    { name: 'ESB Canvas', path: '/canvas', icon: '🎨' },
    { name: 'Account', path: '/account', icon: '👤' },
  ];

  return (
    <div className="w-64 h-screen bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 shadow-2xl">
      {/* Brand Header */}
      <div className="p-6 flex items-center gap-3 border-b border-slate-800/50 mb-4">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20">
          E
        </div>
        <div>
          <h2 className="text-white font-bold tracking-tight text-lg leading-tight">ESB Middleware</h2>
          <p className="text-[10px] text-slate-500 uppercase font-semibold tracking-widest">by Primacom</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 space-y-1">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
              isActive(item.path)
                ? 'bg-blue-600/10 text-blue-400 border border-blue-600/20'
                : 'hover:bg-slate-800 hover:text-white'
            }`}
          >
            <span className={`text-xl transition-transform duration-200 ${!isActive(item.path) && 'grayscale group-hover:grayscale-0 group-hover:scale-110'}`}>
              {item.icon}
            </span>
            <span className="font-medium text-sm tracking-wide">
              {item.name}
            </span>
            
            {/* Indikator Aktif (Dot) */}
            {isActive(item.path) && (
              <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
            )}
          </Link>
        ))}
      </nav>

      {/* Footer / User Profile Brief */}
      <div className="p-4 mt-auto">
        <div className="bg-slate-800/40 rounded-2xl p-4 border border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center text-xs font-bold text-white border border-slate-500">
              AD
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-white truncate">Administrator</p>
              <p className="text-[10px] text-slate-500 truncate">admin@primakom.co.id</p>
            </div>
          </div>
          <button onClick={()=> window.location.href = "/login"} className="w-full mt-3 text-[11px] font-bold text-rose-400 hover:text-rose-300 transition-colors uppercase tracking-widest pt-2 border-t border-slate-700/50">
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;