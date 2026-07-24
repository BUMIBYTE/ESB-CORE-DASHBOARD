import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Activity,
  GitBranch,
  Boxes,
  Share2,
  Workflow,
  AppWindow,
  Users,
  ShieldCheck,
  Settings,
  Search,
  ChevronDown,
  ChevronUp,
  Check,
  Code2
} from "lucide-react";
import api from "../api/axios"; // Import API module kamu

function Sidebar() {
  const location = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchWorkspace, setSearchWorkspace] = useState("");
  const [userData, setUserData] = useState(null);

  const dropdownRef = useRef(null);

  // State untuk Workspace/Tenant yang dipilih
  const [selectedWorkspace, setSelectedWorkspace] = useState(null);

  // Grouped Menu Items dengan mapping key permission API
  const menuGroups = [
    {
      title: "OPERATE",
      items: [
        { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard, permissionKey: "dashboard" },
        { name: "Traffic Monitor", path: "/traffic", icon: Activity, badgeDot: true, permissionKey: "traffic" },
        { name: "Sites", path: "/sites", icon: GitBranch, permissionKey: "sites" },
        { name: "Camel Instances", path: "/camel", icon: Boxes, permissionKey: "camel" },
        { name: "Kafka Ops", path: "/kafka", icon: Share2, permissionKey: "kafka" },
      ],
    },
    {
      title: "BUILD",
      items: [
        { name: "Routes", path: "/routes", icon: Workflow, permissionKey: "routes" },
        { name: "Apps & Connections", path: "/apps", icon: AppWindow, permissionKey: "apps" },
      ],
    },
    {
      title: "GOVERN",
      items: [
        { name: "Tenants", path: "/tenants", icon: Users, permissionKey: "tenant" },
        { name: "RBAC & Audit", path: "/rbac", icon: ShieldCheck, permissionKey: "rbac" },
        { name: "Settings", path: "/settings", icon: Settings, permissionKey: "settings" },
      ],
    },
  ];

  const isActive = (path) => location.pathname === path;

  const fetchData = async () => {
    try {
      const res = await api.get("/auth/verifySessions");
      const resData = res.data.data;
      setUserData(resData);

      // Set default selected workspace dari tenant index ke-0 jika ada
      if (resData?.tenant && resData.tenant.length > 0) {
        setSelectedWorkspace(resData.tenant[0]);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();

    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter daftar tenant berdasarkan kata kunci pencarian
  const tenantsList = userData?.tenant || [];
  const filteredWorkspaces = tenantsList.filter((tenant) =>
    tenant.name.toLowerCase().includes(searchWorkspace.toLowerCase()) ||
    tenant.code.toLowerCase().includes(searchWorkspace.toLowerCase())
  );

  // Penanganan 'permisson' (sesuai typo kunci dari JSON response backend)
  const permissions = userData?.permisson || userData?.permission || {};

  return (
    <div className="w-64 h-screen bg-[#090D14] text-slate-400 flex flex-col border-r border-slate-800/60 font-sans select-none relative">
      {/* 1. BRAND HEADER */}
      <div className="px-5 py-4 flex items-center justify-between border-b border-slate-800/40">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <div className="w-2.5 h-2.5 rounded-full bg-[#090D14]" />
          </div>
          <span className="text-white font-semibold text-base tracking-tight">
            PrimaSphere
          </span>
        </div>
        <Code2 className="w-4 h-4 text-slate-500 hover:text-slate-300 cursor-pointer transition-colors" />
      </div>

      {/* 2. WORKSPACE SWITCHER (Tampil jika tenant tersedia) */}
      {tenantsList.length > 0 && selectedWorkspace && (
        <div className="p-3 relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className={`w-full bg-[#111722] hover:bg-[#161f2e] border transition-all duration-150 rounded-xl p-2.5 flex items-center justify-between group ${
              isDropdownOpen ? "border-slate-600 shadow-lg" : "border-slate-800/80"
            }`}
          >
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-7 h-7 rounded-lg bg-purple-950/80 border border-purple-500/30 text-purple-300 flex items-center justify-center font-bold text-xs shrink-0">
                {selectedWorkspace.code}
              </div>
              <div className="flex flex-col text-left overflow-hidden">
                <span className="text-slate-200 text-xs font-medium truncate">
                  {selectedWorkspace.name}
                </span>
                <span className="text-[10px] text-slate-500 truncate">
                  {selectedWorkspace.env} - {selectedWorkspace.region}
                </span>
              </div>
            </div>
            {isDropdownOpen ? (
              <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-500 group-hover:text-slate-300 shrink-0" />
            )}
          </button>

          {/* DROPDOWN MENU TENANTS */}
          {isDropdownOpen && (
            <div className="absolute top-16 left-3 right-3 bg-[#0d131d] border border-slate-700/80 rounded-xl shadow-2xl z-50 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-100">
              {/* Search Bar */}
              <div className="p-2 border-b border-slate-800">
                <div className="flex items-center gap-2 bg-[#161f2c] px-2.5 py-1.5 rounded-lg border border-slate-700/50 focus-within:border-blue-500/50">
                  <Search className="w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Find workspace..."
                    value={searchWorkspace}
                    onChange={(e) => setSearchWorkspace(e.target.value)}
                    className="bg-transparent text-xs text-slate-200 focus:outline-none w-full placeholder:text-slate-500"
                  />
                </div>
              </div>

              {/* List Tenant */}
              <div className="max-h-60 overflow-y-auto p-1.5 space-y-1 custom-scrollbar">
                {filteredWorkspaces.map((ws) => {
                  const isSelected = selectedWorkspace.id === ws.id;
                  const isDev = ws.env?.toLowerCase() === "dev";

                  return (
                    <button
                      key={ws.id}
                      onClick={() => {
                        setSelectedWorkspace(ws);
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-colors ${
                        isSelected
                          ? "bg-[#182232] text-white"
                          : "hover:bg-[#131a26] text-slate-300"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <div className="w-7 h-7 rounded-md bg-purple-900/50 text-purple-300 border border-purple-500/20 flex items-center justify-center text-xs font-semibold shrink-0">
                          {ws.code}
                        </div>
                        <div className="flex flex-col overflow-hidden">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-medium truncate">{ws.name}</span>
                            <span className={`text-[9px] flex items-center gap-1 ${isDev ? 'text-amber-400' : 'text-emerald-400'}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${isDev ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                              {ws.env}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-500 truncate">{ws.region}</span>
                        </div>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-blue-400 shrink-0 ml-1" />}
                    </button>
                  );
                })}
              </div>

              {/* Footer Dropdown */}
              {permissions?.tenant?.read && (
                <div className="p-2 border-t border-slate-800 bg-[#090d14]">
                  <Link
                    to="/tenants"
                    onClick={() => setIsDropdownOpen(false)}
                    className="w-full flex items-center gap-2 text-xs text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800/50 transition-colors"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    <span>Manage tenants</span>
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 3. NAVIGATION MENU (FILTER BERDASARKAN PERMISSION READ) */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-6 custom-scrollbar">
        {menuGroups.map((group, groupIdx) => {
          // Filter item di dalam group yang memiliki permission.read === true
          const allowedItems = group.items.filter(
            (item) => permissions[item.permissionKey]?.read === true
          );

          // Jika tidak ada item yang boleh dibaca pada group ini, sembunyikan group title-nya
          if (allowedItems.length === 0) return null;

          return (
            <div key={groupIdx} className="space-y-1">
              <h3 className="px-3 text-[10px] font-bold text-slate-500 tracking-wider uppercase">
                {group.title}
              </h3>
              <div className="space-y-0.5">
                {allowedItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);

                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`group relative flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 ${
                        active
                          ? "bg-[#131b26] text-slate-100"
                          : "text-slate-400 hover:text-slate-200 hover:bg-[#0e1520]"
                      }`}
                    >
                      {active && (
                        <div className="absolute left-0 top-1.5 bottom-1.5 w-0.5 bg-blue-500 rounded-r-full" />
                      )}

                      <div className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 ${active ? "text-blue-400" : "text-slate-400 group-hover:text-slate-300"}`} />
                        <span>{item.name}</span>
                      </div>

                      {item.badgeDot && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* 4. FOOTER COMMAND BAR */}
      <div className="p-3 border-t border-slate-800/60">
        <button className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-[#0e141f] border border-slate-800/80 text-xs text-slate-400 hover:text-slate-200 hover:border-slate-700 transition-all">
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-slate-500" />
            <span>Command</span>
          </div>
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-slate-800/80 border border-slate-700/60 rounded text-slate-400">
            ⌘K
          </kbd>
        </button>
      </div>
    </div>
  );
}

export default Sidebar;