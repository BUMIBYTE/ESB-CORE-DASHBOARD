import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api from "../api/axios"; // 🔥 pastikan path benar

function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  // 🔥 state user
  const [user, setUser] = useState({
    fullName: "Administrator",
    email: "admin@primakom.co.id",
  });

  // 🔥 cek active menu
  const isActive = (path) => location.pathname === path;

  // 🔥 menu
  const menuItems = [
    { name: "Dashboard", path: "/dashboard", icon: "📊" },
    { name: "Routing", path: "/routing", icon: "🛤️" },
    { name: "ESB Canvas", path: "/canvas", icon: "🎨" },
    { name: "Account", path: "/account", icon: "👤" },
  ];

  // =====================
  // 🔥 GET USER DATA
  // =====================
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get("/auth/verifySessions");

        if (res.data.code === 200) {
          setUser({
            fullName: res.data.data.fullName,
            email: res.data.data.email,
          });
        }
      } catch (err) {
        console.error("Failed get user:", err);
      }
    };

    fetchUser();
  }, []);

  // =====================
  // 🔥 LOGOUT
  // =====================
  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userId");
    navigate("/login");
  };

  return (
    <div className="w-64 h-screen bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 shadow-2xl">
      
      {/* HEADER */}
      <div className="p-6 flex items-center gap-3 border-b border-slate-800/50 mb-4">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white shadow-lg">
          E
        </div>
        <div>
          <h2 className="text-white font-bold text-lg">ESB Middleware</h2>
          <p className="text-[10px] text-slate-500 uppercase">
            by Primacom
          </p>
        </div>
      </div>

      {/* MENU */}
      <nav className="flex-1 px-4 space-y-1">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
              isActive(item.path)
                ? "bg-blue-600/10 text-blue-400 border border-blue-600/20"
                : "hover:bg-slate-800 hover:text-white"
            }`}
          >
            <span className="text-xl">{item.icon}</span>

            <span className="font-medium text-sm">
              {item.name}
            </span>

            {isActive(item.path) && (
              <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-500" />
            )}
          </Link>
        ))}
      </nav>

      {/* FOOTER */}
      <div className="p-4 mt-auto">
        <div className="bg-slate-800/40 rounded-2xl p-4 border border-slate-700/50">
          
          {/* USER */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center text-xs font-bold text-white">
              {user.fullName?.charAt(0) || "A"}
            </div>

            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-white truncate">
                {user.fullName}
              </p>
              <p className="text-[10px] text-slate-500 truncate">
                {user.email}
              </p>
            </div>
          </div>

          {/* LOGOUT */}
          <button
            onClick={handleLogout}
            className="w-full mt-3 text-[11px] font-bold text-rose-400 hover:text-rose-300 transition-colors uppercase tracking-widest pt-2 border-t border-slate-700/50"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;