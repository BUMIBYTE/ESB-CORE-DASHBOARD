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
  ShoppingBag,
  Users,
  ShieldCheck,
  Settings,
  Search,
  ChevronDown,
  ChevronUp,
  Check,
  Code2
} from "lucide-react";

function Sidebar() {
  const location = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchWorkspace, setSearchWorkspace] = useState("");
  const dropdownRef = useRef(null);

  // Data Tenant / Workspace
  const [selectedWorkspace, setSelectedWorkspace] = useState({
    id: "pl",
    name: "Prima Logistics",
    badge: "PL",
    env: "prod - ap-southeast-3",
  });

  const workspaces = [
    { id: "pr", name: "Prima Group", badge: "PR", tag: "ALL", sub: "all tenants · 8 routes", color: "bg-blue-900/50 text-blue-300" },
    { id: "pm", name: "Prima Mining", badge: "PM", env: "prod", region: "ap-southeast-1 · 3 routes", color: "bg-cyan-900/50 text-cyan-300" },
    { id: "pl", name: "Prima Logistics", badge: "PL", env: "prod", region: "ap-southeast-3 · 2 routes", color: "bg-purple-900/50 text-purple-300" },
    { id: "pc", name: "Prima Corporate", badge: "PC", env: "prod", region: "ap-southeast-3 · 3 routes", color: "bg-blue-900/50 text-blue-300" },
    { id: "ps", name: "Prima Sandbox", badge: "PS", env: "staging", region: "ap-southeast-3 · 0 routes", color: "bg-amber-900/50 text-amber-300" },
  ];

  // Grouped Menu Items
  const menuGroups = [
    {
      title: "OPERATE",
      items: [
        { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
        { name: "Traffic Monitor", path: "/traffic", icon: Activity, badgeDot: true },
        { name: "Sites", path: "/sites", icon: GitBranch },
        { name: "Camel Instances", path: "/camel", icon: Boxes },
        { name: "Kafka Ops", path: "/kafka", icon: Share2 },
      ],
    },
    {
      title: "BUILD",
      items: [
        { name: "Routes", path: "/routes", icon: Workflow },
        { name: "Apps & Connections", path: "/apps", icon: AppWindow },
        // { name: "Marketplace", path: "/marketplace", icon: ShoppingBag },
      ],
    },
    {
      title: "GOVERN",
      items: [
        { name: "Tenants", path: "/tenants", icon: Users },
        { name: "RBAC & Audit", path: "/rbac", icon: ShieldCheck },
        { name: "Settings", path: "/settings", icon: Settings },
      ],
    },
  ];

  const isActive = (path) => location.pathname === path;

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredWorkspaces = workspaces.filter((ws) =>
    ws.name.toLowerCase().includes(searchWorkspace.toLowerCase())
  );

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

      {/* 2. WORKSPACE SWITCHER */}
      <div className="p-3 relative" ref={dropdownRef}>
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className={`w-full bg-[#111722] hover:bg-[#161f2e] border transition-all duration-150 rounded-xl p-2.5 flex items-center justify-between group ${
            isDropdownOpen ? "border-slate-600 shadow-lg" : "border-slate-800/80"
          }`}
        >
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-7 h-7 rounded-lg bg-purple-950/80 border border-purple-500/30 text-purple-300 flex items-center justify-center font-bold text-xs shrink-0">
              {selectedWorkspace.badge}
            </div>
            <div className="flex flex-col text-left overflow-hidden">
              <span className="text-slate-200 text-xs font-medium truncate">
                {selectedWorkspace.name}
              </span>
              <span className="text-[10px] text-slate-500 truncate">
                {selectedWorkspace.env}
              </span>
            </div>
          </div>
          {isDropdownOpen ? (
            <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-500 group-hover:text-slate-300 shrink-0" />
          )}
        </button>

        {/* DROPDOWN MENU */}
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

            {/* List Item */}
            <div className="max-h-60 overflow-y-auto p-1.5 space-y-1 custom-scrollbar">
              {filteredWorkspaces.map((ws) => {
                const isSelected = selectedWorkspace.id === ws.id;
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
                      <div className={`w-7 h-7 rounded-md ${ws.color} flex items-center justify-center text-xs font-semibold shrink-0`}>
                        {ws.badge}
                      </div>
                      <div className="flex flex-col overflow-hidden">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-medium truncate">{ws.name}</span>
                          {ws.tag && (
                            <span className="text-[9px] bg-slate-800 text-slate-400 px-1 py-0.2 rounded font-mono">
                              {ws.tag}
                            </span>
                          )}
                          {ws.env && (
                            <span className={`text-[9px] flex items-center gap-1 ${ws.env === 'prod' ? 'text-emerald-400' : 'text-amber-400'}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${ws.env === 'prod' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                              {ws.env}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-500 truncate">{ws.sub || ws.region}</span>
                      </div>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-blue-400 shrink-0 ml-1" />}
                  </button>
                );
              })}
            </div>

            {/* Footer Dropdown */}
            <div className="p-2 border-t border-slate-800 bg-[#090d14]">
              <button className="w-full flex items-center gap-2 text-xs text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800/50 transition-colors">
                <Settings className="w-3.5 h-3.5" />
                <span>Manage tenants</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 3. NAVIGATION MENU */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-6 custom-scrollbar">
        {menuGroups.map((group, groupIdx) => (
          <div key={groupIdx} className="space-y-1">
            <h3 className="px-3 text-[10px] font-bold text-slate-500 tracking-wider uppercase">
              {group.title}
            </h3>
            <div className="space-y-0.5">
              {group.items.map((item) => {
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
                    {/* Active Indicator Line */}
                    {active && (
                      <div className="absolute left-0 top-1.5 bottom-1.5 w-0.5 bg-blue-500 rounded-r-full" />
                    )}

                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${active ? "text-blue-400" : "text-slate-400 group-hover:text-slate-300"}`} />
                      <span>{item.name}</span>
                    </div>

                    {/* Live indicator green dot */}
                    {item.badgeDot && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
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