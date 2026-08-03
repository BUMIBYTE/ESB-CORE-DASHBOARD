import React, { useState } from "react";
import {
  Search,
  Plus,
  LayoutGrid,
  List,
  Filter,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  X,
  Code2,
  Play,
  RotateCcw,
  Sparkles,
  ArrowLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize,
  Grid,
  Code,
  History,
  Send,
  Database,
  Globe,
  Radio,
  FileText,
  Sliders,
  ShieldCheck,
  Cpu,
  Layers,
  Zap,
  Terminal
} from "lucide-react";

// --- DUMMY DATA ROUTES ---
const INITIAL_ROUTES = [
  {
    id: "r1",
    name: "fms-dispatch-ingest",
    subtext: "FMS → fms.telemetry",
    group: "MINING",
    status: "Warning",
    deployedOn: ["Gr", "Sa", "Ad"],
    deployCount: "3 · 1!",
    throughput: "800/s",
    owner: "BU",
    ver: "V1.9"
  },
  {
    id: "r2",
    name: "sensor-iot-ingest",
    subtext: "IoT → sensor.iot",
    group: "IOT",
    status: "Errors",
    deployedOn: ["Gr"],
    deployCount: "1",
    throughput: "1,180/s",
    owner: "BU",
    ver: "V2.1"
  },
  {
    id: "r3",
    name: "condition-monitor-ingest",
    subtext: "Vibrasi/Suhu → sensor.iot",
    group: "IOT",
    status: "Warning",
    deployedOn: ["Sa"],
    deployCount: "1",
    throughput: "540/s",
    owner: "BU",
    ver: "V1.4"
  },
  {
    id: "r4",
    name: "weighbridge-ingest",
    subtext: "Weighbridge → weighbridge.events",
    group: "LOGISTICS",
    status: "Warning",
    deployedOn: ["Gr", "Ad"],
    deployCount: "2 · 1!",
    throughput: "35/s",
    owner: "RA",
    ver: "V1.2"
  },
  {
    id: "r5",
    name: "fuel-system-ingest",
    subtext: "Fuel → fuel.events",
    group: "LOGISTICS",
    status: "Draft",
    deployedOn: ["Gr"],
    deployCount: "1",
    throughput: "—",
    owner: "RA",
    ver: "V1.0"
  },
  {
    id: "r6",
    name: "sap-idoc-sink",
    subtext: "sap.outbound → SAP PM",
    group: "ERP",
    status: "Warning",
    deployedOn: ["HQ"],
    deployCount: "1",
    throughput: "90/s",
    owner: "RA",
    ver: "V3.2"
  },
  {
    id: "r7",
    name: "sap-odata-sink",
    subtext: "sap.outbound → SAP ERP",
    group: "ERP",
    status: "Running",
    deployedOn: ["HQ"],
    deployCount: "1",
    throughput: "45/s",
    owner: "RA",
    ver: "V2.4"
  },
  {
    id: "r8",
    name: "dlq-handler",
    subtext: "*.DLQ → audit.dlq",
    group: "PLATFORM",
    status: "Running",
    deployedOn: ["HQ"],
    deployCount: "1",
    throughput: "4/s",
    owner: "DM",
    ver: "V1.1"
  }
];

export default function RoutesPage() {
  const [routes, setRoutes] = useState(INITIAL_ROUTES);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentView, setCurrentView] = useState("list"); // 'list' | 'builder'
  const [activeRoute, setActiveRoute] = useState(null);

  // Form Modal State
  const [modalTab, setModalTab] = useState("General");
  const [newRouteData, setNewRouteData] = useState({
    name: "sap-idoc-ingest",
    group: "ERP",
    env: "Dev",
    description: ""
  });

  // Handler Buka Builder Langsung atau Buat Route
  const handleOpenBuilder = (routeObj) => {
    setActiveRoute(routeObj || {
      name: newRouteData.name || "untitled-route",
      group: newRouteData.group || "ERP",
      env: newRouteData.env || "DEV",
      status: "Draft"
    });
    setIsModalOpen(false);
    setCurrentView("builder");
  };

  const handleCreateRoute = (e) => {
    e.preventDefault();
    const created = {
      id: `r-${Date.now()}`,
      name: newRouteData.name || "new-route",
      subtext: "configured via builder",
      group: newRouteData.group.toUpperCase(),
      status: "Draft",
      deployedOn: ["Dev"],
      deployCount: "1",
      throughput: "0/s",
      owner: "ME",
      ver: "V1.0"
    };

    setRoutes([created, ...routes]);
    handleOpenBuilder(created);
  };

  if (currentView === "builder") {
    return <RouteBuilderPage route={activeRoute} onBack={() => setCurrentView("list")} />;
  }

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-300 font-sans p-6 select-none relative">
      {/* HEADER TOP BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Routes</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {routes.length} routes · 11 deployments across all Camel instances
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Search Bar */}
          <div className="relative w-64">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search routes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0d121d] border border-slate-800/80 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <div className="flex items-center bg-[#0d121d] border border-slate-800/80 rounded-lg p-0.5 text-slate-400">
            <button className="px-2 py-1 rounded bg-[#161f30] text-blue-400 flex items-center gap-1 text-xs font-medium">
              <List className="w-3.5 h-3.5" /> Table
            </button>
            <button className="px-2 py-1 rounded hover:text-slate-200 flex items-center gap-1 text-xs font-medium">
              <LayoutGrid className="w-3.5 h-3.5" /> Board
            </button>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium shadow-md shadow-blue-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            New route
          </button>
        </div>
      </div>

      {/* SUMMARY STATS CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-6">
        <div className="bg-[#0b0f17] border border-slate-800/80 rounded-xl p-4">
          <div className="text-[10.5px] font-semibold text-slate-400 uppercase tracking-wider">TOTAL</div>
          <div className="text-2xl font-bold text-white mt-1 font-mono">{routes.length}</div>
        </div>

        <div className="bg-[#0b0f17] border border-slate-800/80 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-[10.5px] font-semibold text-slate-400 uppercase tracking-wider">RUNNING</div>
            <div className="text-2xl font-bold text-white mt-1 font-mono">2</div>
          </div>
          <span className="text-xs font-mono font-medium text-emerald-400">ok</span>
        </div>

        <div className="bg-[#0b0f17] border border-slate-800/80 rounded-xl p-4">
          <div className="text-[10.5px] font-semibold text-slate-400 uppercase tracking-wider">WARN</div>
          <div className="text-2xl font-bold text-white mt-1 font-mono">4</div>
        </div>

        <div className="bg-[#0b0f17] border border-slate-800/80 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-[10.5px] font-semibold text-slate-400 uppercase tracking-wider">ERRORS</div>
            <div className="text-2xl font-bold text-white mt-1 font-mono">1</div>
          </div>
          <span className="text-[10px] font-medium text-rose-400 bg-rose-950/40 px-1.5 py-0.5 rounded border border-rose-800/30">
            needs attn
          </span>
        </div>

        <div className="bg-[#0b0f17] border border-slate-800/80 rounded-xl p-4">
          <div className="text-[10.5px] font-semibold text-slate-400 uppercase tracking-wider">DEPLOYMENTS</div>
          <div className="text-2xl font-bold text-white mt-1 font-mono">11</div>
          <div className="text-[10px] text-slate-500">on 4 instances</div>
        </div>

        <div className="bg-[#0b0f17] border border-slate-800/80 rounded-xl p-4">
          <div className="text-[10.5px] font-semibold text-slate-400 uppercase tracking-wider">TOTAL THRU</div>
          <div className="text-2xl font-bold text-white mt-1 font-mono">
            2,694 <span className="text-xs font-sans text-slate-500 font-normal">msg/s</span>
          </div>
        </div>
      </div>

      {/* TABLE LIST OF ROUTES */}
      <div className="bg-[#0b0f17] border border-slate-800/80 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800/80 text-[10.5px] font-mono text-slate-500 uppercase tracking-wider bg-[#0d121c]/50">
                <th className="py-3 px-4 font-semibold">ROUTE</th>
                <th className="py-3 px-4 font-semibold">GROUP</th>
                <th className="py-3 px-4 font-semibold">STATUS</th>
                <th className="py-3 px-4 font-semibold">DEPLOYED ON</th>
                <th className="py-3 px-4 font-semibold text-right">THROUGHPUT</th>
                <th className="py-3 px-4 font-semibold text-center">OWNER</th>
                <th className="py-3 px-4 font-semibold text-right">VER</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50 text-xs">
              {routes.map((route) => (
                <tr
                  key={route.id}
                  onClick={() => handleOpenBuilder(route)}
                  className="hover:bg-[#101726]/60 transition-colors cursor-pointer group"
                >
                  {/* Route Name & Subtext */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <Filter className="w-4 h-4 text-blue-400 shrink-0" />
                      <div>
                        <div className="font-mono font-semibold text-white group-hover:text-blue-400 transition-colors">
                          {route.name}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5 font-mono">{route.subtext}</div>
                      </div>
                    </div>
                  </td>

                  {/* Group Tag */}
                  <td className="py-3.5 px-4">
                    <span className="text-[10px] font-mono bg-[#141d2c] border border-slate-700/60 text-blue-300 px-2 py-0.5 rounded font-medium">
                      {route.group}
                    </span>
                  </td>

                  {/* Status Indicator */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5 font-mono text-xs">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          route.status === "Running"
                            ? "bg-emerald-400"
                            : route.status === "Errors"
                            ? "bg-rose-500"
                            : route.status === "Draft"
                            ? "bg-slate-500"
                            : "bg-amber-400"
                        }`}
                      />
                      <span
                        className={
                          route.status === "Running"
                            ? "text-emerald-400"
                            : route.status === "Errors"
                            ? "text-rose-400"
                            : route.status === "Draft"
                            ? "text-slate-400"
                            : "text-amber-400"
                        }
                      >
                        {route.status}
                      </span>
                    </div>
                  </td>

                  {/* Deployed On */}
                  <td className="py-3.5 px-4 font-mono text-slate-400">
                    <div className="flex items-center gap-1.5">
                      {route.deployedOn.map((node, i) => (
                        <span key={i} className="w-5 h-5 rounded-full bg-[#182234] border border-slate-700 text-[9px] flex items-center justify-center font-bold text-slate-300">
                          {node}
                        </span>
                      ))}
                      <span className="text-slate-500 text-[11px] ml-1">{route.deployCount}</span>
                    </div>
                  </td>

                  {/* Throughput */}
                  <td className="py-3.5 px-4 text-right font-mono text-slate-300">{route.throughput}</td>

                  {/* Owner */}
                  <td className="py-3.5 px-4 text-center">
                    <span className="w-6 h-6 rounded-full bg-[#182234] border border-slate-700 text-[10px] font-bold text-blue-300 inline-flex items-center justify-center font-mono">
                      {route.owner}
                    </span>
                  </td>

                  {/* Version */}
                  <td className="py-3.5 px-4 text-right font-mono text-slate-500">{route.ver}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Floating Sphere AI Button */}
      <div className="fixed bottom-6 right-6">
        <button className="flex items-center gap-2 px-3.5 py-2 rounded-full border border-slate-800 bg-[#0c1017] hover:bg-[#121824] text-xs font-medium text-slate-300 shadow-xl transition-all cursor-pointer">
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span>Ask Sphere AI</span>
          <span className="text-[10px] text-slate-600 font-mono">⌘I</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* MODAL CREATE ROUTE (GAMBAR 2) */}
      {/* ========================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-[#0c1017] border border-slate-800/90 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="p-5 flex items-start justify-between border-b border-slate-800/80 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#111823] border border-slate-700/50 flex items-center justify-center text-blue-400">
                  <Filter className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-white">Create route</h3>
                    <span className="text-[9px] font-mono bg-blue-950/60 text-blue-400 border border-blue-800/60 px-1.5 py-0.2 rounded font-bold">
                      NEW
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">Define a new integration pipeline</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Navigation Tabs */}
            <div className="px-5 pt-3 pb-1 border-b border-slate-800/60 bg-[#090d14]">
              <div className="flex items-center gap-2 text-xs">
                {["General", "Pipeline", "Policies", "Deploy"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setModalTab(tab)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                      modalTab === tab
                        ? "bg-[#161f30] text-blue-400 border border-blue-500/30"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleCreateRoute} className="p-5 space-y-4">
              {/* Route Name Input */}
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-300">Route name</label>
                <div className="relative">
                  <Filter className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={newRouteData.name}
                    onChange={(e) => setNewRouteData({ ...newRouteData, name: e.target.value })}
                    placeholder="sap-idoc-ingest"
                    className="w-full bg-[#111722] border border-slate-800 rounded-lg pl-8 pr-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <p className="text-[10px] text-slate-500">lowercase, hyphenated · used as the pipeline identifier</p>
              </div>

              {/* Group & Environment Row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-300">Group</label>
                  <select
                    value={newRouteData.group}
                    onChange={(e) => setNewRouteData({ ...newRouteData, group: e.target.value })}
                    className="w-full bg-[#111722] border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="ERP">ERP</option>
                    <option value="IOT">IOT</option>
                    <option value="MINING">MINING</option>
                    <option value="LOGISTICS">LOGISTICS</option>
                    <option value="PLATFORM">PLATFORM</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-300">Environment</label>
                  <div className="grid grid-cols-3 bg-[#111722] border border-slate-800 rounded-lg p-0.5 text-xs text-slate-400">
                    {["Dev", "Staging", "Prod"].map((env) => (
                      <button
                        key={env}
                        type="button"
                        onClick={() => setNewRouteData({ ...newRouteData, env })}
                        className={`py-1 text-[11px] font-medium rounded ${
                          newRouteData.env === env
                            ? "bg-[#182335] text-slate-100 shadow-xs"
                            : "hover:text-slate-200"
                        }`}
                      >
                        {env}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Description Input */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-medium text-slate-300">Description</label>
                  <span className="text-[10px] text-slate-500">OPTIONAL</span>
                </div>
                <textarea
                  rows="3"
                  value={newRouteData.description}
                  onChange={(e) => setNewRouteData({ ...newRouteData, description: e.target.value })}
                  placeholder="What does this route do, and who owns it?"
                  className="w-full bg-[#111722] border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Modal Actions Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-800/60 shrink-0">
                <button
                  type="button"
                  onClick={() => handleOpenBuilder()}
                  className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
                >
                  <Code2 className="w-3.5 h-3.5" /> Open in builder
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleCreateRoute}
                    className="px-3.5 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
                  >
                    Save as draft
                  </button>
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 rounded-lg text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/20 transition-all cursor-pointer"
                  >
                    Create route
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// =========================================================
// ROUTE BUILDER PAGE (GAMBAR 3 - VISUAL PIPELINE EDITOR)
// =========================================================
function RouteBuilderPage({ route, onBack }) {
  const [selectedNode, setSelectedNode] = useState("transform");
  const [builderTab, setBuilderTab] = useState("Config");

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-300 font-sans flex flex-col select-none">
      {/* TOP BUILDER BAR */}
      <div className="h-12 bg-[#090d14] border-b border-slate-800/80 px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-1 hover:bg-slate-800/80 rounded text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2 font-mono text-xs">
            <Filter className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-white font-semibold">{route?.name || "untitled-route"}</span>
            <span className="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.2 rounded">
              {route?.status || "DRAFT"}
            </span>
            <span className="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.2 rounded">DEV</span>
            <span className="text-slate-500 text-[11px]">editing · {route?.group || "ERP"}</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-[#111722] border border-slate-800 rounded-lg p-0.5 text-xs text-slate-400">
            <button className="px-2.5 py-1 rounded bg-[#182335] text-blue-400 font-medium">Design</button>
            <button className="px-2.5 py-1 rounded hover:text-slate-200">Simulate</button>
            <button className="px-2.5 py-1 rounded hover:text-slate-200">Deploy</button>
          </div>

          <div className="h-4 w-px bg-slate-800 mx-1" />

          <button className="p-1.5 hover:bg-slate-800/80 rounded text-slate-400 hover:text-slate-200">
            <Code className="w-4 h-4" />
          </button>
          <button className="p-1.5 hover:bg-slate-800/80 rounded text-slate-400 hover:text-slate-200">
            <History className="w-4 h-4" />
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-800 bg-[#0e1420] text-xs font-medium text-slate-200 hover:bg-[#131c2d]">
            <Play className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" /> Test run
          </button>
          <button className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium shadow-md shadow-blue-600/20 cursor-pointer">
            <Send className="w-3.5 h-3.5" /> Deploy
          </button>
        </div>
      </div>

      {/* THREE-COLUMN WORKSPACE */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT PALETTE PANEL */}
        <div className="w-60 bg-[#090d14] border-r border-slate-800/80 flex flex-col shrink-0">
          <div className="p-3 border-b border-slate-800/60">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2" />
              <input
                type="text"
                placeholder="Search nodes..."
                className="w-full bg-[#111722] border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-4 custom-scrollbar text-xs">
            {/* SOURCES */}
            <div>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">SOURCES</div>
              <div className="space-y-1">
                {[
                  { label: "Kafka Consumer", icon: Radio },
                  { label: "REST In", icon: Globe },
                  { label: "SAP RFC", icon: Database },
                  { label: "JDBC Poll", icon: Database },
                  { label: "SFTP Watcher", icon: FileText },
                  { label: "MQTT Subscribe", icon: Radio },
                  { label: "File Watcher", icon: FileText }
                ].map((item, idx) => {
                  const IconC = item.icon;
                  return (
                    <div
                      key={idx}
                      className="p-2 bg-[#0d121c] border border-slate-800/80 hover:border-slate-700/80 rounded-lg flex items-center justify-between text-slate-300 hover:text-white cursor-pointer transition-all"
                    >
                      <div className="flex items-center gap-2">
                        <IconC className="w-3.5 h-3.5 text-blue-400" />
                        <span>{item.label}</span>
                      </div>
                      <Plus className="w-3.5 h-3.5 text-slate-500" />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* PROCESS */}
            <div>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">PROCESS</div>
              <div className="space-y-1">
                {[
                  { label: "Transform", icon: Sparkles },
                  { label: "Validate", icon: ShieldCheck },
                  { label: "Mapper", icon: Layers },
                  { label: "AI Processor", icon: Cpu },
                  { label: "Filter", icon: Filter },
                  { label: "Splitter", icon: Sliders }
                ].map((item, idx) => {
                  const IconC = item.icon;
                  return (
                    <div
                      key={idx}
                      className="p-2 bg-[#0d121c] border border-slate-800/80 hover:border-slate-700/80 rounded-lg flex items-center justify-between text-slate-300 hover:text-white cursor-pointer transition-all"
                    >
                      <div className="flex items-center gap-2">
                        <IconC className="w-3.5 h-3.5 text-purple-400" />
                        <span>{item.label}</span>
                      </div>
                      <Plus className="w-3.5 h-3.5 text-slate-500" />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="p-3 border-t border-slate-800/80 bg-[#07090e] text-[10.5px] text-slate-500">
            <span className="font-semibold text-slate-400 block">Drag to canvas</span>
            Combine sources, processors and sinks.
          </div>
        </div>

        {/* CENTER CANVAS */}
        <div className="flex-1 bg-[#06080d] relative overflow-hidden flex flex-col justify-between p-6">
          {/* Canvas Toolbar Top Left */}
          <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-[#0d121d] border border-slate-800 rounded-lg p-1 text-xs text-slate-400">
            <button className="p-1 hover:text-slate-200"><ZoomOut className="w-3.5 h-3.5" /></button>
            <span className="font-mono text-[11px]">100%</span>
            <button className="p-1 hover:text-slate-200"><ZoomIn className="w-3.5 h-3.5" /></button>
            <div className="h-3 w-px bg-slate-800" />
            <button className="px-2 py-0.5 rounded hover:bg-slate-800/60 text-[11px]">Fit</button>
            <button className="px-2 py-0.5 rounded hover:bg-slate-800/60 text-[11px] flex items-center gap-1">
              <Grid className="w-3 h-3" /> Snap
            </button>
          </div>

          {/* Canvas Simulating Status Top Right */}
          <div className="absolute top-4 right-4 z-10 bg-[#0d121d] border border-slate-800 rounded-lg px-3 py-1.5 text-xs flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono text-slate-300 text-[11px]">Simulating</span>
            <span className="text-slate-500 font-mono text-[11px]">throughput 1,240 msg/s · err 0.02%</span>
          </div>

          {/* Visual Canvas Node Flow Representation */}
          <div className="flex-1 flex items-center justify-center gap-12 relative">
            {/* Grid Background Overlay */}
            <div
              className="absolute inset-0 opacity-15"
              style={{
                backgroundImage: "radial-gradient(#3b82f6 1px, transparent 1px)",
                backgroundSize: "20px 20px"
              }}
            />

            {/* NODE 1: REST IN */}
            <div
              onClick={() => setSelectedNode("rest")}
              className={`w-52 bg-[#0b0f17] border rounded-xl p-3.5 shadow-xl relative cursor-pointer z-10 transition-all ${
                selectedNode === "rest" ? "border-blue-500 ring-2 ring-blue-500/20" : "border-slate-800"
              }`}
            >
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-7 h-7 rounded-lg bg-[#141d2c] border border-slate-700/60 flex items-center justify-center text-blue-400">
                  <Globe className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white">REST In</h4>
                  <span className="text-[10px] text-slate-500 font-mono">new source</span>
                </div>
              </div>
              <div className="text-[10px] font-mono text-amber-400 bg-amber-950/40 border border-amber-800/40 px-2 py-0.5 rounded w-max mb-2">
                no connection
              </div>
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> unbound</span>
                <span>3200 msg</span>
              </div>
            </div>

            {/* Connecting Connector Line 1 */}
            <div className="w-12 h-0.5 bg-blue-500/60 relative z-10">
              <span className="w-2 h-2 rounded-full bg-blue-400 absolute right-0 -top-0.75 animate-ping" />
            </div>

            {/* NODE 2: TRANSFORM (SELECTED) */}
            <div
              onClick={() => setSelectedNode("transform")}
              className={`w-56 bg-[#0c121d] border rounded-xl p-3.5 shadow-2xl shadow-blue-500/10 relative cursor-pointer z-10 transition-all ${
                selectedNode === "transform" ? "border-blue-500 ring-2 ring-blue-500/30" : "border-slate-800"
              }`}
            >
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-7 h-7 rounded-lg bg-[#182338] border border-slate-700/60 flex items-center justify-center text-purple-400">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white">Transform</h4>
                  <span className="text-[10px] text-slate-500 font-mono">configure...</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-[10px] font-mono mt-3 pt-2 border-t border-slate-800/80">
                <span className="text-emerald-400 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> running</span>
                <span className="text-slate-400">7725 msg</span>
              </div>
            </div>

            {/* Connecting Connector Line 2 */}
            <div className="w-12 h-0.5 bg-blue-500/60 relative z-10">
              <span className="w-2 h-2 rounded-full bg-blue-400 absolute right-0 -top-0.75 animate-ping" />
            </div>

            {/* NODE 3: KAFKA PRODUCER */}
            <div
              onClick={() => setSelectedNode("kafka")}
              className={`w-52 bg-[#0b0f17] border rounded-xl p-3.5 shadow-xl relative cursor-pointer z-10 transition-all ${
                selectedNode === "kafka" ? "border-blue-500 ring-2 ring-blue-500/20" : "border-slate-800"
              }`}
            >
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-7 h-7 rounded-lg bg-[#141d2c] border border-slate-700/60 flex items-center justify-center text-cyan-400">
                  <Radio className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white">Kafka Producer</h4>
                  <span className="text-[10px] text-slate-500 font-mono">new sink</span>
                </div>
              </div>
              <div className="text-[10px] font-mono text-slate-400 bg-[#121926] border border-slate-800 px-2 py-0.5 rounded w-max mb-2">
                Kafka · edge bro... MTLS
              </div>
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                <span className="text-emerald-400 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> running</span>
                <span>2955 msg</span>
              </div>
            </div>
          </div>

          {/* Bottom Canvas Footer Status */}
          <div className="z-10 bg-[#0d121d] border border-slate-800 rounded-lg px-3 py-1.5 text-[11px] font-mono text-slate-400 flex items-center justify-between w-max">
            <span className="text-emerald-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" /> Route valid
            </span>
            <span className="mx-2">·</span>
            <span>3 nodes</span>
            <span className="mx-2">·</span>
            <span>2 edges</span>
          </div>
        </div>

        {/* RIGHT NODE CONFIGURATION PANEL */}
        <div className="w-80 bg-[#090d14] border-l border-slate-800/80 flex flex-col shrink-0">
          <div className="p-4 border-b border-slate-800/60 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#182338] border border-slate-700/60 flex items-center justify-center text-purple-400">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Transform</h3>
                <span className="text-[10px] font-mono text-slate-500">transform</span>
              </div>
            </div>
          </div>

          {/* Node Config Tabs */}
          <div className="px-4 pt-2 border-b border-slate-800/60 bg-[#07090e]">
            <div className="flex items-center gap-2 text-xs">
              {["Config", "Schema", "Test"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setBuilderTab(tab)}
                  className={`px-3 py-1.5 rounded-t-lg text-xs font-medium transition-colors cursor-pointer ${
                    builderTab === tab
                      ? "bg-[#090d14] text-blue-400 border-t-2 border-blue-500 font-semibold"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Node Settings Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar text-xs">
            <div className="p-2.5 bg-[#0d121c] border border-slate-800/80 rounded-lg text-[11px] text-slate-400 flex items-start gap-2">
              <Zap className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
              <span>This node runs in-process — no external connection required.</span>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-medium text-slate-300">Description</label>
                <span className="text-[10px] text-slate-500">OPTIONAL</span>
              </div>
              <textarea
                rows="3"
                defaultValue="Normalize SAP IDoc INVOIC02 → canonical Invoice v3 schema. Strips whitespace, computes line totals, attaches tenant ID."
                className="w-full bg-[#111722] border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500 leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-300">Language</label>
                <select className="w-full bg-[#111722] border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500">
                  <option value="groovy">Groovy</option>
                  <option value="javascript">JavaScript</option>
                  <option value="python">Python</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-300">Timeout</label>
                <input
                  type="text"
                  defaultValue="30s"
                  className="w-full bg-[#111722] border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Code Script Editor Mock */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>normalize_invoice.groovy</span>
                <span className="text-blue-400 font-bold">42 LINES</span>
              </div>
              <div className="bg-[#05070a] border border-slate-800/80 rounded-lg p-3 font-mono text-[10.5px] text-slate-300 space-y-1 leading-relaxed overflow-x-auto">
                <div className="text-slate-500">// Normalize SAP IDoc to Canonical</div>
                <div>def msg = exchange.in.body</div>
                <div>def out = [</div>
                <div className="pl-3 text-blue-300">invoiceNo: msg.HEAD.INVOICE_NO,</div>
                <div className="pl-3 text-blue-300">vendor: msg.HEAD.VENDOR.padLeft(10, '0'),</div>
                <div className="pl-3 text-blue-300">currency: (msg.CURR ?: 'IDR').toUpperCase(),</div>
                <div className="pl-3 text-blue-300">lines: msg.LINES.collect &#123; l -&gt;</div>
                <div className="pl-6 text-slate-400">[ sku: l.SKU, qty: l.QTY as BigDecimal ]</div>
                <div className="pl-3">&#125;</div>
                <div>]</div>
              </div>
            </div>

            {/* Retry Policy */}
            <div className="space-y-2 pt-2 border-t border-slate-800/60">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Retry Policy</span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="text-[10px] text-slate-500">Max attempts</label>
                  <input type="text" defaultValue="5" className="w-full bg-[#111722] border border-slate-800 rounded-lg px-2 py-1 text-xs font-mono text-slate-200 mt-0.5" />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500">Initial interval</label>
                  <input type="text" defaultValue="500ms" className="w-full bg-[#111722] border border-slate-800 rounded-lg px-2 py-1 text-xs font-mono text-slate-200 mt-0.5" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}