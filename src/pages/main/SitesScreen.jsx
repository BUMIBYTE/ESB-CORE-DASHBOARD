import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Server,
  Plus,
  Activity,
  HardDrive,
  Cpu,
  Layers,
  Network,
  Pencil,
  Trash2,
  X,
  Globe,
  Radio,
  AppWindow,
  Terminal as TerminalIcon,
  CheckCircle2,
  Download,
  Trash,
  Send,
  Key,
  Lock,
  ShieldCheck,
  Eye,
  EyeOff
} from "lucide-react";

// --- INITIAL AVAILABLE CATALOG OF APPS ---
const AVAILABLE_APPS = [
  { id: "docker", name: "Docker Container Engine", version: "24.0.7", size: "385 MB", category: "Runtime" },
  { id: "kafka", name: "Apache Kafka", version: "3.5.1", size: "120 MB", category: "Messaging" },
  { id: "mongodb", name: "MongoDB Enterprise", version: "6.0.8", size: "450 MB", category: "Database" },
  { id: "postgresql", name: "PostgreSQL DB", version: "15.3", size: "280 MB", category: "Database" },
  { id: "redis", name: "Redis In-Memory Cache", version: "7.0.11", size: "45 MB", category: "Cache" },
  { id: "camel", name: "Apache Camel Runtime", version: "4.2.0", size: "85 MB", category: "Integration" },
  { id: "nginx", name: "Nginx Web Server", version: "1.24.0", size: "32 MB", category: "Web" },
  { id: "rabbitmq", name: "RabbitMQ Message Broker", version: "3.12.0", size: "110 MB", category: "Messaging" }
];

// --- DEFAULT INITIAL SITES (Dua site bawaan contoh) ---
const INITIAL_SITES = [
  {
    id: "site-hq",
    name: "HQ Jakarta",
    isHQ: true,
    kind: "Central Hub",
    endpoint: "10.0.0.1:9092",
    desc: "Main Data Center & Control Plane Central Hub",
    location: "Jakarta, ID",
    link: "ok",
    routes: 12,
    rate: "1.2k msg/s",
    instName: "camel-hq-core",
    instId: "inst-000",
    agent: "4.2.0",
    authMethod: "ssh_key",
    sshUser: "root",
    sshPort: "22",
    nodes: [
      { host: "hq-srv-01", cpu: 32, ram: 45, disk: 28, netRx: "12.4 MB/s", netTx: "45.1 MB/s" },
      { host: "hq-srv-02", cpu: 28, ram: 42, disk: 30, netRx: "10.1 MB/s", netTx: "38.2 MB/s" },
    ],
    installedApps: [
      { id: "docker", name: "Docker Container Engine", version: "24.0.7", size: "385 MB" },
      { id: "kafka", name: "Apache Kafka", version: "3.5.1", size: "120 MB" }
    ]
  },
  {
    id: "site-sg",
    name: "Singapore Edge",
    isHQ: false,
    kind: "Cloud VPC",
    endpoint: "192.168.10.12:8080",
    desc: "Regional Edge Proxy for SEA Region",
    location: "Singapore, SG",
    link: "ok",
    routes: 4,
    rate: "450 msg/s",
    instName: "camel-sg-edge",
    instId: "inst-001",
    agent: "4.2.0",
    authMethod: "api_key",
    sshUser: "admin-svc",
    sshPort: "443",
    nodes: [
      { host: "sg-node-01", cpu: 55, ram: 68, disk: 42, netRx: "4.2 MB/s", netTx: "12.8 MB/s" }
    ],
    installedApps: [
      { id: "docker", name: "Docker Container Engine", version: "24.0.7", size: "385 MB" }
    ]
  }
];

export default function SitesPage() {
  const [sites, setSites] = useState(() => {
    const saved = localStorage.getItem("ps_sites_data");
    return saved ? JSON.parse(saved) : INITIAL_SITES;
  });

  const [picked, setPicked] = useState(null);

  // Modal Site CRUD
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [showPassword, setShowPassword] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    endpoint: "",
    desc: "",
    kind: "On-Premises",
    authMethod: "ssh_key",
    sshUser: "root",
    sshPort: "22",
    privateKey: "",
    passphrase: "",
    password: "",
    apiKey: ""
  });

  // Modal Add App
  const [isAddAppModalOpen, setIsAddAppModalOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem("ps_sites_data", JSON.stringify(sites));
  }, [sites]);

  useEffect(() => {
    setPicked(prev => (sites.find(s => s.id === prev) ? prev : (sites[0] && sites[0].id)) || null);
  }, [sites]);

  const site = sites.find(s => s.id === picked) || sites[0];
  const spokeSites = useMemo(() => sites.filter(s => s.kind !== "Central Hub"), [sites]);

  const linksUp = spokeSites.filter(s => s.link !== "down").length;
  const totalRoutes = sites.reduce((a, s) => a + (s.routes || 0), 0);

  // --- HANDLERS SITE ---
  const handleOpenAddModal = () => {
    setModalMode("add");
    setFormData({
      id: "",
      name: "",
      endpoint: "",
      desc: "",
      kind: "On-Premises",
      authMethod: "ssh_key",
      sshUser: "root",
      sshPort: "22",
      privateKey: "",
      passphrase: "",
      password: "",
      apiKey: ""
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (targetSite) => {
    setModalMode("edit");
    setFormData({
      id: targetSite.id,
      name: targetSite.name,
      endpoint: targetSite.endpoint || "",
      desc: targetSite.desc || "",
      kind: targetSite.kind || "On-Premises",
      authMethod: targetSite.authMethod || "ssh_key",
      sshUser: targetSite.sshUser || "root",
      sshPort: targetSite.sshPort || "22",
      privateKey: targetSite.privateKey || "",
      passphrase: targetSite.passphrase || "",
      password: targetSite.password || "",
      apiKey: targetSite.apiKey || ""
    });
    setIsModalOpen(true);
  };

  const handleSaveSite = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.endpoint) {
      alert("Nama Site dan IP/Endpoint wajib diisi!");
      return;
    }

    const isCentral = formData.kind === "Central Hub";

    if (modalMode === "add") {
      const newId = `site-${Date.now()}`;
      const newSite = {
        ...formData,
        id: newId,
        isHQ: isCentral,
        location: isCentral ? "Central DC" : "Branch Site",
        link: "ok",
        routes: 2,
        rate: "100 msg/s",
        instName: `camel-${formData.name.toLowerCase().replace(/\s+/g, '-')}`,
        instId: `inst-${Math.floor(100 + Math.random() * 900)}`,
        agent: "4.2.0",
        installedApps: [
          { id: "docker", name: "Docker Container Engine", version: "24.0.7", size: "385 MB" }
        ],
        nodes: [
          {
            host: `${formData.name.toLowerCase().replace(/\s+/g, '-')}-vm-01`,
            cpu: Math.floor(Math.random() * 40) + 20,
            ram: Math.floor(Math.random() * 50) + 30,
            disk: Math.floor(Math.random() * 30) + 15,
            netRx: "2.1 MB/s",
            netTx: "5.4 MB/s"
          }
        ]
      };
      setSites(prev => [...prev, newSite]);
      setPicked(newId);
    } else {
      setSites(prev =>
        prev.map(s => (s.id === formData.id ? { ...s, ...formData, isHQ: isCentral } : s))
      );
    }

    setIsModalOpen(false);
  };

  const handleDeleteSite = (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus site ini?")) {
      setSites(prev => prev.filter(s => s.id !== id));
    }
  };

  // --- HANDLERS APPS ---
  const handleInstallApp = (appToInstall) => {
    if (!site) return;

    setSites(prev =>
      prev.map(s => {
        if (s.id === site.id) {
          const currentApps = s.installedApps || [];
          if (currentApps.some(a => a.id === appToInstall.id)) return s;
          return {
            ...s,
            installedApps: [...currentApps, appToInstall]
          };
        }
        return s;
      })
    );
    setIsAddAppModalOpen(false);
  };

  const handleUninstallApp = (appId) => {
    if (!site) return;
    if (window.confirm("Apakah Anda yakin ingin mencopot aplikasi ini?")) {
      setSites(prev =>
        prev.map(s => {
          if (s.id === site.id) {
            return {
              ...s,
              installedApps: (s.installedApps || []).filter(a => a.id !== appId)
            };
          }
          return s;
        })
      );
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#06090e] text-slate-300 p-8 font-sans select-none relative space-y-8">
      {/* HEADER PAGE */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white tracking-tight">
            Sites Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Physical locations, topology layout, authentication policies, and node resources
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium shadow-md shadow-blue-600/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add site
        </button>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="Total Sites" value={sites.length} hint="incl. Central & Spokes" icon={<Globe className="w-4 h-4 text-blue-400" />} />
        <StatCard label="Links Up" value={`${linksUp}/${spokeSites.length}`} hint={spokeSites.length === 0 ? "No spoke nodes" : linksUp < spokeSites.length ? "Degraded" : "All connected"} icon={<Radio className="w-4 h-4 text-emerald-400" />} />
        <StatCard label="Routes Deployed" value={totalRoutes} hint="across all sites" icon={<Layers className="w-4 h-4 text-cyan-400" />} />
      </div>

      {/* TOPOLOGY & DETAIL SECTION */}
      {sites.length === 0 ? (
        <div className="py-16 text-center text-slate-500 text-xs bg-[#0b0f17] border border-slate-800/80 rounded-xl space-y-3">
          <Globe className="w-8 h-8 text-slate-600 mx-auto stroke-1" />
          <p className="text-sm font-semibold text-slate-400">Belum ada site yang terdaftar</p>
          <p className="text-slate-600 max-w-xs mx-auto text-[11px]">
            Tambahkan site baru. Pilih tipe <strong className="text-blue-400 font-mono">Central Hub</strong> untuk menjadikannya site utama di sebelah kiri topologi.
          </p>
          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add First Site
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-12 gap-5">
            {/* Topology Column */}
            <div className="col-span-12 lg:col-span-7 bg-[#0b0f17] border border-slate-800/80 rounded-xl p-5 shadow-xl">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800/60">
                <div>
                  <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Site Topology
                  </h2>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Central Hubs (Left) connected to Branch Spokes (Right)
                  </p>
                </div>
              </div>
              <Topology sites={sites} picked={picked} onPick={setPicked} />
            </div>

            {/* Site Detail Column */}
            <div className="col-span-12 lg:col-span-5 space-y-5">
              {site && (
                <SiteDetail
                  s={site}
                  onEdit={() => handleOpenEditModal(site)}
                  onDelete={() => handleDeleteSite(site.id)}
                />
              )}
            </div>
          </div>

          {/* SECTION DUA KOLOM BAWAH: APP LIST & LIVE TERMINAL */}
          <div className="grid grid-cols-12 gap-5 pt-2">
            {/* COLUMN 1: INSTALLED APPS */}
            <div className="col-span-12 lg:col-span-6 bg-[#0b0f17] border border-slate-800/80 rounded-xl p-5 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800/60">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-[#141d2d] border border-slate-700/60 flex items-center justify-center text-blue-400">
                      <AppWindow className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                        Installed Applications
                      </h2>
                      <p className="text-[10px] text-slate-500 font-mono">
                        Target site: {site?.name} ({site?.endpoint})
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsAddAppModalOpen(true)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-600/90 hover:bg-blue-500 text-white text-[11px] font-medium transition-all cursor-pointer shadow-sm"
                  >
                    <Plus className="w-3 h-3" />
                    Add App
                  </button>
                </div>

                {/* APP LIST */}
                <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1 custom-scrollbar">
                  {(!site?.installedApps || site.installedApps.length === 0) ? (
                    <div className="py-8 text-center text-xs text-slate-500">
                      Belum ada aplikasi terinstall pada site ini.
                    </div>
                  ) : (
                    site.installedApps.map(app => (
                      <div
                        key={app.id}
                        className="p-3 bg-[#0e1420] border border-slate-800/80 hover:border-slate-700/80 rounded-xl flex items-center justify-between transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-[#141c2c] border border-slate-700/50 flex items-center justify-center text-emerald-400">
                            <CheckCircle2 className="w-4 h-4" />
                          </div>
                          <div>
                            <h3 className="text-xs font-semibold text-white flex items-center gap-2">
                              {app.name}
                              <span className="text-[9px] bg-emerald-950/60 text-emerald-400 border border-emerald-800/40 px-1.5 py-0.2 rounded font-mono">
                                installed
                              </span>
                            </h3>
                            <div className="flex items-center gap-2 mt-0.5 text-[10.5px] font-mono text-slate-500">
                              <span>Version: <strong className="text-slate-300">{app.version}</strong></span>
                              <span>·</span>
                              <span>Size: <strong className="text-slate-300">{app.size}</strong></span>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => handleUninstallApp(app.id)}
                          className="flex items-center gap-1 px-2 py-1 rounded bg-rose-950/40 border border-rose-800/40 text-rose-300 hover:bg-rose-900/60 text-[10px] font-mono transition-colors cursor-pointer"
                        >
                          <Trash className="w-3 h-3" />
                          Uninstall
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* COLUMN 2: SITE TERMINAL ACCESS */}
            <div className="col-span-12 lg:col-span-6 bg-[#0b0f17] border border-slate-800/80 rounded-xl p-5 shadow-xl flex flex-col">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800/60">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#141d2d] border border-slate-700/60 flex items-center justify-center text-emerald-400">
                    <TerminalIcon className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                      Live Terminal Access
                    </h2>
                    <p className="text-[10px] text-slate-500 font-mono">
                      SSH connection to {site?.sshUser || "root"}@{site?.endpoint || "127.0.0.1"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-mono text-emerald-400">Connected</span>
                </div>
              </div>

              {/* TERMINAL UI */}
              <TerminalConsole site={site} />
            </div>
          </div>
        </>
      )}

      {/* MODAL CREATE / EDIT SITE */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-[#0b1017] border border-slate-800/90 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 flex items-center justify-between border-b border-slate-800/80 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#111823] border border-slate-700/50 flex items-center justify-center text-blue-400">
                  <Server className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">
                    {modalMode === "add" ? "Add New Site" : "Edit Site Details"}
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Configure endpoint location & connection credentials
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSite} className="p-5 space-y-4 overflow-y-auto custom-scrollbar flex-1">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1 col-span-2 sm:col-span-1">
                  <label className="text-[11px] font-medium text-slate-300">Site Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Surabaya Branch"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-[#111722] border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1 col-span-2 sm:col-span-1">
                  <label className="text-[11px] font-medium text-slate-300">Type / Environment</label>
                  <select
                    value={formData.kind}
                    onChange={e => setFormData({ ...formData, kind: e.target.value })}
                    className="w-full bg-[#111722] border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                  >
                    <option value="Central Hub">Central Hub (Utama/Kiri)</option>
                    <option value="On-Premises">On-Premises (Cabang)</option>
                    <option value="Cloud VPC">Cloud VPC (Cabang)</option>
                    <option value="Edge Gateway">Edge Gateway (Cabang)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1 col-span-2">
                  <label className="text-[11px] font-medium text-slate-300">IP / Host Endpoint *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 192.168.1.100"
                    value={formData.endpoint}
                    onChange={e => setFormData({ ...formData, endpoint: e.target.value })}
                    className="w-full bg-[#111722] border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-300">SSH Port</label>
                  <input
                    type="text"
                    required
                    placeholder="22"
                    value={formData.sshPort}
                    onChange={e => setFormData({ ...formData, sshPort: e.target.value })}
                    className="w-full bg-[#111722] border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* AUTHENTICATION METHOD SELECTION */}
              <div className="space-y-2 pt-1 border-t border-slate-800/60">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Authentication Method
                </label>

                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "ssh_key", label: "SSH Key", icon: Key },
                    { id: "basic_auth", label: "Password", icon: Lock },
                    { id: "api_key", label: "API Token", icon: ShieldCheck }
                  ].map(method => {
                    const IconComp = method.icon;
                    const isSelected = formData.authMethod === method.id;

                    return (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, authMethod: method.id })}
                        className={`flex items-center justify-center gap-1.5 p-2 rounded-lg border text-[11px] font-medium transition-all cursor-pointer ${
                          isSelected
                            ? "bg-blue-950/60 border-blue-500 text-blue-300 shadow-sm"
                            : "bg-[#111722] border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700"
                        }`}
                      >
                        <IconComp className="w-3.5 h-3.5" />
                        <span>{method.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* AUTHENTICATION FIELDS CONDITIONALLY RENDERED */}
              <div className="bg-[#0e1420] border border-slate-800/80 rounded-xl p-3.5 space-y-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-300">SSH / Service Username</label>
                  <input
                    type="text"
                    placeholder="e.g. root or admin"
                    value={formData.sshUser}
                    onChange={e => setFormData({ ...formData, sshUser: e.target.value })}
                    className="w-full bg-[#090d14] border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>

                {formData.authMethod === "ssh_key" && (
                  <>
                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-slate-300">Private Key (RSA/Ed25519)</label>
                      <textarea
                        rows="3"
                        placeholder="-----BEGIN OPENSSH PRIVATE KEY-----..."
                        value={formData.privateKey}
                        onChange={e => setFormData({ ...formData, privateKey: e.target.value })}
                        className="w-full bg-[#090d14] border border-slate-800 rounded-lg px-3 py-1.5 text-[11px] text-slate-200 font-mono focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-slate-300">Passphrase (Optional)</label>
                      <input
                        type="password"
                        placeholder="Key Passphrase if encrypted"
                        value={formData.passphrase}
                        onChange={e => setFormData({ ...formData, passphrase: e.target.value })}
                        className="w-full bg-[#090d14] border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </>
                )}

                {formData.authMethod === "basic_auth" && (
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-slate-300">Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Server Root Password"
                        value={formData.password}
                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                        className="w-full bg-[#090d14] border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500 pr-8"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2.5 top-2 text-slate-500 hover:text-slate-300"
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                )}

                {formData.authMethod === "api_key" && (
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-slate-300">API Gateway Bearer Token / Key</label>
                    <input
                      type="password"
                      placeholder="e.g. ps_live_secret_key_8f3a..."
                      value={formData.apiKey}
                      onChange={e => setFormData({ ...formData, apiKey: e.target.value })}
                      className="w-full bg-[#090d14] border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-blue-500"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-300">Description</label>
                <textarea
                  rows="2"
                  placeholder="Additional information about this site..."
                  value={formData.desc}
                  onChange={e => setFormData({ ...formData, desc: e.target.value })}
                  className="w-full bg-[#111722] border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800/60 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/20 transition-all cursor-pointer"
                >
                  {modalMode === "add" ? "Save Site" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL INSTALL APPLICATION */}
      {isAddAppModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-[#0b1017] border border-slate-800/90 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
            <div className="p-5 flex items-center justify-between border-b border-slate-800/80 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#111823] border border-slate-700/50 flex items-center justify-center text-blue-400">
                  <AppWindow className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">
                    App Catalog Marketplace
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Select application to install on {site?.name}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddAppModalOpen(false)}
                className="text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar">
              {AVAILABLE_APPS.map(app => {
                const isAlreadyInstalled = (site?.installedApps || []).some(a => a.id === app.id);

                return (
                  <div
                    key={app.id}
                    className="p-3.5 bg-[#0e1420] border border-slate-800/80 rounded-xl flex items-center justify-between"
                  >
                    <div>
                      <h4 className="text-xs font-semibold text-white flex items-center gap-2">
                        {app.name}
                        <span className="text-[9px] bg-blue-950/60 text-blue-300 border border-blue-800/60 px-1.5 py-0.2 rounded font-mono">
                          {app.category}
                        </span>
                      </h4>
                      <div className="flex items-center gap-2 mt-0.5 text-[10.5px] font-mono text-slate-500">
                        <span>v{app.version}</span>
                        <span>·</span>
                        <span>{app.size}</span>
                      </div>
                    </div>

                    {isAlreadyInstalled ? (
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 px-2.5 py-1 rounded border border-emerald-800/30 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Installed
                      </span>
                    ) : (
                      <button
                        onClick={() => handleInstallApp(app)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-medium transition-all cursor-pointer shadow-sm"
                      >
                        <Download className="w-3 h-3" />
                        Install
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- TERMINAL CONSOLE COMPONENT ---
function TerminalConsole({ site }) {
  const [logs, setLogs] = useState([
    `[SSH] Connecting to ${site?.sshUser || "root"}@${site?.endpoint || "127.0.0.1"}:${site?.sshPort || "22"}...`,
    `[SSH] Auth Method: ${site?.authMethod === "basic_auth" ? "Password" : site?.authMethod === "api_key" ? "API Token" : "SSH Key Pair"}.`,
    `Welcome to Linux Ubuntu 22.04 LTS (${site?.name || "Target Host"})`,
    `Type 'help' for available CLI commands.`
  ]);
  const [inputVal, setInputVal] = useState("");
  const logsEndRef = useRef(null);

  useEffect(() => {
    setLogs([
      `[SSH] Connecting to ${site?.sshUser || "root"}@${site?.endpoint || "127.0.0.1"}:${site?.sshPort || "22"}...`,
      `[SSH] Auth Method: ${site?.authMethod === "basic_auth" ? "Password" : site?.authMethod === "api_key" ? "API Token" : "SSH Key Pair"}.`,
      `Welcome to Linux Ubuntu 22.04 LTS (${site?.name || "Target Host"})`,
      `Type 'help' for available CLI commands.`
    ]);
  }, [site]);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const handleCommandSubmit = (e) => {
    e.preventDefault();
    if (!inputVal.trim()) return;

    const cmd = inputVal.trim().toLowerCase();
    const userPrompt = `${site?.sshUser || "root"}@${site?.name ? site.name.toLowerCase().replace(/\s+/g, '-') : "node"}:~#`;
    const newLogs = [...logs, `${userPrompt} ${inputVal}`];

    if (cmd === "help") {
      newLogs.push("Available commands: help, status, docker ps, uname -a, clear, top");
    } else if (cmd === "status") {
      newLogs.push(`Node Status: OK | Host: ${site?.endpoint}:${site?.sshPort || "22"} | Camel: ${site?.instName}`);
    } else if (cmd === "docker ps") {
      newLogs.push("CONTAINER ID   IMAGE                 STATUS         PORTS");
      newLogs.push("a8f910c82a1b   apache/camel:latest   Up 4 hours     8080->8080/tcp");
    } else if (cmd === "uname -a") {
      newLogs.push("Linux node-host 5.15.0-88-generic #98-Ubuntu SMP Mon Oct 2 15:18:56 UTC 2023 x86_64");
    } else if (cmd === "clear") {
      setLogs([]);
      setInputVal("");
      return;
    } else {
      newLogs.push(`bash: ${inputVal}: command not found`);
    }

    setLogs(newLogs);
    setInputVal("");
  };

  return (
    <div className="bg-[#05080e] border border-slate-800 rounded-xl p-3 font-mono text-[11px] flex flex-col h-[300px]">
      <div className="flex-1 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
        {logs.map((log, idx) => (
          <div
            key={idx}
            className={`${
              log.includes(":~#")
                ? "text-blue-400 font-semibold"
                : log.startsWith("[SSH]")
                ? "text-emerald-400"
                : "text-slate-300"
            } leading-relaxed break-all`}
          >
            {log}
          </div>
        ))}
        <div ref={logsEndRef} />
      </div>

      <form onSubmit={handleCommandSubmit} className="mt-2 pt-2 border-t border-slate-800/80 flex items-center gap-2">
        <span className="text-emerald-400 shrink-0 font-semibold">
          {site?.sshUser || "root"}@{site?.name ? site.name.toLowerCase().replace(/\s+/g, '-') : "node"}:~#
        </span>
        <input
          type="text"
          value={inputVal}
          onChange={e => setInputVal(e.target.value)}
          placeholder="type command..."
          className="flex-1 bg-transparent text-white focus:outline-none placeholder:text-slate-700"
        />
        <button type="submit" className="text-slate-500 hover:text-slate-300 transition-colors">
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
}

// --- STAT CARD COMPONENT ---
function StatCard({ label, value, hint, icon }) {
  return (
    <div className="bg-[#0b0f17] border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-400">{label}</span>
        {icon}
      </div>
      <div className="mt-2">
        <div className="text-xl font-semibold text-white font-mono">{value}</div>
        <div className="text-[11px] text-slate-500 mt-0.5">{hint}</div>
      </div>
    </div>
  );
}

// --- TOPOLOGY COMPONENT (DINAMIS CENTRAL HUB DI KIRI & CABANG DI KANAN) ---
const ROW_H = 88, GAP = 12, SVG_W = 96;

function Topology({ sites, picked, onPick }) {
  // Ambil semua site yang bertipe 'Central Hub'
  const centralSites = sites.filter(s => s.kind === "Central Hub");
  // Semua site selain Central Hub dimasukkan sebagai cabang (spokes)
  const spokeSites = sites.filter(s => s.kind !== "Central Hub");

  const numCentral = centralSites.length;
  const numSpokes = spokeSites.length;

  // Menentukan tinggi canvas topologi secara fleksibel
  const height = Math.max(
    numCentral * ROW_H + Math.max(0, numCentral - 1) * GAP,
    numSpokes * ROW_H + Math.max(0, numSpokes - 1) * GAP,
    100
  );

  const leftCenterY = height / 2;
  const rowY = (i) => i * (ROW_H + GAP) + ROW_H / 2;

  return (
    <div className="grid" style={{ gridTemplateColumns: `220px ${SVG_W}px 1fr` }}>
      {/* KANAN/KIRI : KOLOM CENTRAL HUBS (KIRI) */}
      <div className="flex flex-col justify-center" style={{ height, gap: GAP }}>
        {numCentral === 0 ? (
          <div className="p-4 rounded-xl border border-dashed border-slate-800/80 bg-[#0e1420]/30 text-center">
            <Globe className="w-5 h-5 text-slate-600 mx-auto mb-1 stroke-1" />
            <span className="text-[11px] text-slate-500 block">Belum ada Central Hub</span>
            <span className="text-[9px] text-slate-600">Tambah site berkategori 'Central Hub'</span>
          </div>
        ) : (
          centralSites.map(hqSite => (
            <button
              key={hqSite.id}
              onClick={() => onPick(hqSite.id)}
              className={`w-full text-left rounded-xl border p-3.5 transition-all cursor-pointer ${
                picked === hqSite.id
                  ? "border-blue-500/80 bg-[#0e1420] shadow-md shadow-blue-500/10"
                  : "border-slate-800/80 bg-[#0e1420]/60 hover:border-slate-700"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#162032] border border-slate-700/50 flex items-center justify-center text-blue-400 shrink-0">
                  <Globe className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                    {hqSite.name}
                    <span className="text-[9px] bg-blue-950/60 text-blue-300 border border-blue-800/60 px-1 rounded font-mono">
                      Hub Utama
                    </span>
                  </div>
                  <div className="text-[10.5px] font-mono text-slate-500 truncate">{hqSite.endpoint}</div>
                </div>
              </div>
            </button>
          ))
        )}
      </div>

      {/* SVG CONNECTOR LINES */}
      <svg width={SVG_W} height={height} className="overflow-visible">
        {numCentral > 0 && spokeSites.map((s, i) => {
          const y2 = rowY(i);
          const isWarn = s.link === "warn";
          const isDown = s.link === "down";
          const strokeColor = isDown ? "#f43f5e" : isWarn ? "#f59e0b" : "#3b82f6";
          const d = `M0,${leftCenterY} C${SVG_W / 2},${leftCenterY} ${SVG_W / 2},${y2} ${SVG_W},${y2}`;

          return (
            <g key={s.id}>
              <path
                d={d}
                stroke={strokeColor}
                strokeWidth={picked === s.id ? 2.5 : 1.5}
                fill="none"
                opacity={isDown ? 0.3 : 0.6}
              />
            </g>
          );
        })}
      </svg>

      {/* KANAN : KOLOM CABANG / SPOKES (KANAN) */}
      <div className="flex flex-col justify-center" style={{ height, gap: GAP }}>
        {numSpokes === 0 ? (
          <div className="p-4 rounded-xl border border-dashed border-slate-800/80 bg-[#0e1420]/30 text-center">
            <Server className="w-5 h-5 text-slate-600 mx-auto mb-1 stroke-1" />
            <span className="text-[11px] text-slate-500 block">Belum ada site cabang</span>
            <span className="text-[9px] text-slate-600">Tambah site tipe On-Prem/VPC/Edge</span>
          </div>
        ) : (
          spokeSites.map(s => (
            <SiteRow key={s.id} s={s} active={picked === s.id} onClick={() => onPick(s.id)} />
          ))
        )}
      </div>
    </div>
  );
}

function SiteRow({ s, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{ height: ROW_H }}
      className={`text-left bg-[#0e1420]/60 border rounded-xl px-3.5 py-2.5 transition-all flex items-center gap-3 cursor-pointer ${
        active
          ? "border-blue-500/80 bg-[#0e1420] shadow-md shadow-blue-500/10"
          : "border-slate-800/80 hover:border-slate-700"
      }`}
    >
      <div className="w-8 h-8 rounded-lg bg-[#162032] border border-slate-700/50 flex items-center justify-center text-slate-300 shrink-0">
        <Server className="w-4 h-4 text-blue-400" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-white">{s.name}</span>
          <span className="text-[10px] bg-[#141b2a] border border-slate-800 text-slate-400 px-1.5 py-0.5 rounded">
            {s.kind}
          </span>
        </div>
        <div className="flex items-center gap-2 mt-1 text-[11px] font-mono text-slate-500">
          <span className="text-slate-400">{s.endpoint || "N/A"}</span>
          <span>·</span>
          <span>{s.routes || 0} routes</span>
          <span>·</span>
          <span>{s.rate}</span>
        </div>
      </div>
    </button>
  );
}

// --- SITE DETAIL COMPONENT ---
function SiteDetail({ s, onEdit, onDelete }) {
  if (!s) return null;

  return (
    <div className="space-y-5">
      <div className="bg-[#0b0f17] border border-slate-800/80 rounded-xl p-5 shadow-xl space-y-4">
        <div className="flex items-start justify-between pb-3 border-b border-slate-800/60">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-white">{s.name}</h2>
              {s.kind === "Central Hub" && (
                <span className="text-[10px] bg-blue-950/60 text-blue-300 border border-blue-800/60 px-1.5 py-0.5 rounded font-mono">
                  Central Hub (Utama)
                </span>
              )}
            </div>
            <p className="text-[11px] font-mono text-slate-500 mt-0.5">
              {s.kind} · {s.endpoint}:{s.sshPort || "22"}
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={onEdit}
              className="p-1.5 hover:bg-slate-800/80 rounded text-slate-400 hover:text-blue-400 transition-colors cursor-pointer"
              title="Edit Site"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onDelete}
              className="p-1.5 hover:bg-slate-800/80 rounded text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
              title="Delete Site"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* AUTH POLICY BADGE */}
        <div className="flex items-center justify-between text-xs bg-[#0e1420] border border-slate-800/80 p-2.5 rounded-lg font-mono">
          <span className="text-slate-500 flex items-center gap-1.5">
            <Key className="w-3.5 h-3.5 text-blue-400" /> Auth Method:
          </span>
          <span className="text-blue-300 bg-blue-950/60 border border-blue-800/60 px-2 py-0.5 rounded text-[10.5px]">
            {s.authMethod === "basic_auth" ? "Password Auth" : s.authMethod === "api_key" ? "API Token" : "SSH Key Pair"}
          </span>
        </div>

        {s.desc && (
          <p className="text-xs text-slate-400 bg-[#0e1420] border border-slate-800/80 rounded-lg p-3 leading-relaxed">
            {s.desc}
          </p>
        )}

        {/* METRICS NODES */}
        <div className="space-y-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Node Resources & Metrics
          </span>

          {(s.nodes || []).map((nd, idx) => (
            <div key={idx} className="bg-[#0e1420] border border-slate-800/80 rounded-xl p-3.5 space-y-3">
              <div className="flex items-center justify-between text-xs border-b border-slate-800/50 pb-2">
                <span className="font-mono text-slate-200 font-semibold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  {nd.host}
                </span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-800/30">
                  Operational
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <MetricBar label="CPU" percent={nd.cpu} icon={<Cpu className="w-3 h-3 text-slate-500" />} />
                <MetricBar label="RAM" percent={nd.ram} icon={<Activity className="w-3 h-3 text-slate-500" />} />
                <MetricBar label="DISK" percent={nd.disk || 25} icon={<HardDrive className="w-3 h-3 text-slate-500" />} color="bg-blue-500" />
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono bg-[#090d14] px-2.5 py-1.5 rounded-lg border border-slate-800/60 text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Network className="w-3 h-3 text-slate-500" /> Network Traffic
                </span>
                <span>
                  Rx: <span className="text-emerald-400">{nd.netRx || "2.4 MB/s"}</span> | Tx: <span className="text-blue-400">{nd.netTx || "10.1 MB/s"}</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MetricBar({ label, percent, icon, color }) {
  const getBarColor = () => {
    if (color) return color;
    if (percent > 75) return "bg-rose-500";
    if (percent > 50) return "bg-amber-500";
    return "bg-blue-500";
  };

  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
        <span className="flex items-center gap-1">{icon} {label}</span>
        <span className="text-slate-200">{percent}%</span>
      </div>
      <div className="w-full bg-[#080c14] h-1.5 rounded-full overflow-hidden border border-slate-800/60">
        <div className={`h-full rounded-full transition-all duration-300 ${getBarColor()}`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}