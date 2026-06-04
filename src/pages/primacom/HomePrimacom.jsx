import React, { useState, useEffect } from 'react';
import DashboardPrimacom from './Dashboard';
import AccountPrimacom from './Account';
import LicenseManagement from './License';
import FirewallSecurity from './Firewall';
import LogsMonitoring from './Log';

const DEFAULT_TENANTS = [
  { 
    id: "1", 
    name: "Primacom Alpha", 
    location: "Jakarta", 
    ip: "http://localhost:5001", 
    desc: "Server utama untuk lingkungan development lokal." 
  },
  { 
    id: "2", 
    name: "Primacom Beta", 
    location: "Surabaya", 
    ip: "http://192.168.1.50:5001", 
    desc: "Server cabang timur untuk testing backup log." 
  }
];

export default function TenantWithDeleteDashboard() {
  const [tenants, setTenants] = useState(() => {
    const savedTenants = localStorage.getItem('primacom_tenants');
    return savedTenants ? JSON.parse(savedTenants) : DEFAULT_TENANTS;
  });

  const [selectedTenant, setSelectedTenant] = useState(() => {
    const savedTenants = localStorage.getItem('primacom_tenants');
    const parsed = savedTenants ? JSON.parse(savedTenants) : DEFAULT_TENANTS;
    return parsed.length > 0 ? parsed[0] : null;
  });

  const [activeTab, setActiveTab] = useState('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // State Form Input Tenant Baru
  const [newTenantName, setNewTenantName] = useState('');
  const [newTenantIp, setNewTenantIp] = useState('');
  const [newTenantLocation, setNewTenantLocation] = useState('');
  const [newTenantDesc, setNewTenantDesc] = useState('');

  useEffect(() => {
    localStorage.setItem('primacom_tenants', JSON.stringify(tenants));
  }, [tenants]);

  const handleDeleteTenant = (e, tenantId) => {
    e.stopPropagation();
    const targetTenant = tenants.find(t => t.id === tenantId);
    if (!window.confirm(`Apakah Anda yakin ingin menghapus ${targetTenant?.name}?`)) {
      return;
    }

    const updatedTenants = tenants.filter(tenant => tenant.id !== tenantId);
    setTenants(updatedTenants);

    if (selectedTenant?.id === tenantId) {
      if (updatedTenants.length > 0) {
        setSelectedTenant(updatedTenants[0]);
      } else {
        setSelectedTenant(null);
      }
    }
  };

  const handleCreateTenant = (e) => {
    e.preventDefault();
    const newTenant = {
      id: Date.now().toString(),
      name: newTenantName,
      ip: newTenantIp.startsWith('http') ? newTenantIp : `http://${newTenantIp}`,
      location: newTenantLocation || 'Global',
      desc: newTenantDesc || 'No description provided.',
    };

    const updatedTenants = [...tenants, newTenant];
    setTenants(updatedTenants);
    setSelectedTenant(newTenant);

    setNewTenantName('');
    setNewTenantIp('');
    setNewTenantLocation('');
    setNewTenantDesc('');
    setIsModalOpen(false);
  };

  useEffect(() => {
    setActiveTab('dashboard');
  }, [selectedTenant]);

  return (
    <div className="flex h-screen bg-slate-900 font-sans overflow-hidden antialiased text-slate-200">

      {/* =========================================================
          S I D E B A R  (P R E M I U M  D A R K)
          ========================================================= */}
      <aside className="w-85 bg-slate-950 flex flex-col border-r border-slate-800/60 shadow-2xl flex-none">
        
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-800/60 bg-slate-950/40 backdrop-blur-md flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <span className="text-white font-black text-lg">P</span>
            </div>
            <div>
              <h1 className="text-sm font-extrabold text-white tracking-wider uppercase">PRIMACOM</h1>
              <p className="text-[10px] text-slate-500 font-medium tracking-tight">Multi-Tenant Gateway</p>
            </div>
          </div>
          <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold animate-pulse">
            Live
          </span>
        </div>

        {/* Action Button */}
        <div className="p-4 flex-none">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs py-3 px-4 rounded-xl transition-all shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30 active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <span className="text-sm">╋</span> Register New Node
          </button>
        </div>

        {/* Dynamic Tenant List */}
        <nav className="flex-1 overflow-y-auto px-4 pb-4 space-y-2.5 custom-scrollbar">
          <div className="flex justify-between items-center px-2 mb-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Connected Nodes</span>
            <span className="text-[10px] font-mono bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">{tenants.length}</span>
          </div>

          {tenants.length === 0 ? (
            <div className="p-6 text-center border border-dashed border-slate-800 rounded-2xl bg-slate-900/20">
              <p className="text-xs text-slate-500 italic">No active server nodes listed.</p>
            </div>
          ) : (
            tenants.map((tenant) => {
              const isSelected = selectedTenant?.id === tenant.id;
              return (
                <div 
                  key={tenant.id} 
                  onClick={() => setSelectedTenant(tenant)} 
                  className={`p-4 rounded-xl cursor-pointer border relative group transition-all duration-300 ${
                    isSelected 
                      ? 'bg-gradient-to-r from-slate-800 to-slate-800/80 border-blue-500/80 text-white shadow-xl shadow-black/40 translate-x-1' 
                      : 'bg-slate-900/40 border-slate-800/60 text-slate-400 hover:bg-slate-900 hover:border-slate-700/60 hover:text-slate-200'
                  }`}
                >
                  {/* Delete Trigger Button */}
                  <button 
                    onClick={(e) => handleDeleteTenant(e, tenant.id)} 
                    className={`absolute top-4 right-4 text-[10px] p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 backdrop-blur-md ${
                      isSelected 
                        ? 'bg-slate-700/50 hover:bg-rose-500 text-slate-300 hover:text-white' 
                        : 'bg-slate-950/80 hover:bg-rose-500 text-slate-500 hover:text-white'
                    }`}
                    title="Remove Node"
                  >
                    🗑️
                  </button>

                  <div className="flex items-start justify-between pr-6">
                    <div>
                      <h3 className={`font-bold text-sm tracking-wide ${isSelected ? 'text-white' : 'text-slate-300'}`}>{tenant.name}</h3>
                      <p className="text-[10px] text-slate-500 mt-0.5 font-medium truncate max-w-[160px]">{tenant.desc}</p>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-2 border-t border-slate-800/40 pt-2.5">
                    <span className={`text-[9px] font-mono font-bold tracking-wider uppercase px-2 py-0.5 rounded ${
                      isSelected ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-slate-800 text-slate-400'
                    }`}>
                      📍 {tenant.location}
                    </span>
                    <span className={`text-[10px] font-mono truncate max-w-[140px] font-medium ${isSelected ? 'text-emerald-400' : 'text-slate-500'}`}>
                      {tenant.ip.replace('http://', '')}
                    </span>
                  </div>
                </div>
              )
            })
          )}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-800/60 bg-slate-950 text-[10px] font-mono text-slate-600 text-center flex-none tracking-tight">
          ENVIRONMENT SECURE CLI v1.2
        </div>
      </aside>

      {/* =========================================================
          M A I N  C O N T E N T  A R E A  (L I G H T / M O D E R N)
          ========================================================= */}
      <main className="flex-1 flex flex-col bg-slate-50 overflow-hidden text-slate-800">
        {selectedTenant ? (
          <>
            {/* Top Glassmorphic Header */}
            <header className="bg-white border-b border-slate-200/80 px-8 py-5 flex justify-between items-center shadow-xs flex-none z-10">
              <div>
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 relative">
                    <span className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-75" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight">{selectedTenant.name}</h2>
                </div>
                <p className="text-xs text-slate-400 font-medium mt-0.5">{selectedTenant.desc}</p>
              </div>

              {/* Server Route Display Badge */}
              <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 p-2 px-3 rounded-xl shadow-2xs">
                <div className="text-left">
                  <span className="text-[9px] font-bold text-slate-400 block uppercase tracking-wider">Gateway Pipeline</span>
                  <code className="text-xs font-bold text-indigo-600 font-mono">{selectedTenant.ip}</code>
                </div>
              </div>
            </header>

            {/* Main Content Workspace Grid */}
            <div className="flex-1 p-8 overflow-y-auto">
              
              <div className="w-full bg-white rounded-2xl shadow-sm border border-slate-200/80 flex flex-col overflow-hidden min-h-[500px]">
                
                {/* ELEGANT SUB-TAB NAVIGATION BAR */}
                <div className="flex border-b border-slate-200/80 bg-slate-50/50 px-4 gap-1 flex-none">
                  {[
                    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
                    { id: 'users', label: 'User Management', icon: '👥' },
                    { id: 'license', label: 'License Key', icon: '🔑' },
                    { id: 'firewall', label: 'Firewall Policy', icon: '🛡️' },
                    { id: 'log', label: 'Audit Logs', icon: '📝' }
                  ].map((tab) => {
                    const isTabActive = activeTab === tab.id;
                    return (
                      <button 
                        key={tab.id} 
                        onClick={() => setActiveTab(tab.id)} 
                        className={`py-4 px-5 font-semibold text-xs tracking-wide transition-all border-b-2 flex items-center gap-2 relative -mb-[1px] ${
                          isTabActive 
                            ? 'border-blue-600 text-blue-600 bg-white font-bold' 
                            : 'border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-100/40'
                        }`}
                      >
                        <span>{tab.icon}</span>
                        {tab.label}
                      </button>
                    );
                  })}
                </div>

                {/* TAB VIEWPORTS */}
                <div className="p-8 flex-1 bg-white">
                  {activeTab === 'dashboard' && <DashboardPrimacom ipAddress={`${selectedTenant.ip}/api/v1`} />}
                  {activeTab === 'users' && <AccountPrimacom ipAddress={`${selectedTenant.ip}/api/v1`} />}
                  {activeTab === 'license' && <LicenseManagement ipAddress={`${selectedTenant.ip}/api/v1`} />}
                  {activeTab === 'firewall' && <FirewallSecurity ipAddress={`${selectedTenant.ip}/api/v1`} />}
                  {activeTab === 'log' && <LogsMonitoring ipAddress={`${selectedTenant.ip}/api/v1`} />}
                </div>

              </div>
              
            </div>
          </>
        ) : (
          /* Empty Workspace Safe Guard UI */
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-slate-50/50">
            <div className="w-16 h-16 rounded-2xl bg-slate-200 border border-slate-300 flex items-center justify-center text-3xl shadow-sm mb-4">
              🗄️
            </div>
            <p className="font-bold text-slate-700 text-base">No Node Connection Selected</p>
            <p className="text-xs text-slate-400 mt-1 max-w-xs text-center">Silahkan pilih server active node di sidebar, atau buat pendaftaran konfigurasi node baru.</p>
          </div>
        )}
      </main>

      {/* =========================================================
          P O P - U P  M O D A L  (S L E E K  M O D E R N)
          ========================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
          {/* Backdrop Blur Layer */}
          <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          
          {/* Modal Container */}
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative z-10 border border-slate-200 animate-scaleUp text-slate-800">
            
            {/* Modal Header */}
            <div className="bg-slate-50 p-5 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="text-base font-bold text-slate-900 tracking-tight">Register Node Endpoint</h3>
                <p className="text-[11px] text-slate-400 font-medium mt-0.5">Daftarkan parameter routing kluster server baru</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 bg-slate-200/50 p-2 rounded-xl text-xs font-bold transition-colors">✕</button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleCreateTenant} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-0.5">Node Cluster Name</label>
                <input type="text" placeholder="e.g. Primacom Gamma" value={newTenantName} onChange={(e) => setNewTenantName(e.target.value)} className="w-full border border-slate-200 p-2.5 rounded-xl text-sm bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium" required />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-0.5">Target Network IP Address</label>
                <input type="text" placeholder="e.g. 192.168.20.10:5001" value={newTenantIp} onChange={(e) => setNewTenantIp(e.target.value)} className="w-full border border-slate-200 p-2.5 rounded-xl font-mono text-sm bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-indigo-600 font-bold" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-0.5">Location Region</label>
                  <input type="text" placeholder="e.g. Balikpapan" value={newTenantLocation} onChange={(e) => setNewTenantLocation(e.target.value)} className="w-full border border-slate-200 p-2.5 rounded-xl text-sm bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-0.5">Node Remarks</label>
                  <input type="text" placeholder="Short description" value={newTenantDesc} onChange={(e) => setNewTenantDesc(e.target.value)} className="w-full border border-slate-200 p-2.5 rounded-xl text-sm bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium" />
                </div>
              </div>

              {/* Modal Actions Footer */}
              <div className="flex gap-3 pt-4 border-t border-slate-100 mt-6">
                <button type="button" onClick={() => setIsModalOpen(true)} className="w-1/3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-3 rounded-xl transition-colors">Cancel</button>
                <button type="submit" className="w-2/3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs py-3 rounded-xl shadow-md shadow-blue-600/10 transition-all">Save Cluster Connection</button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}