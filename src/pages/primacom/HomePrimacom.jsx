import React, { useState, useEffect } from 'react';
import DashboardPrimacom from './Dashboard';
import AccountPrimacom from './Account';
import LicenseManagement from './License';
import FirewallSecurity from './Firewall';
import LogsMonitoring from './Log';

// DATA AWAL DUMMY TENANT
const INITIAL_TENANTS = [
];

export default function TenantWithDeleteDashboard() {
  // State Utama
  const [tenants, setTenants] = useState(INITIAL_TENANTS);
  const [selectedTenant, setSelectedTenant] = useState(INITIAL_TENANTS[0]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // State Form Input Tenant Baru
  const [newTenantName, setNewTenantName] = useState('');
  const [newTenantIp, setNewTenantIp] = useState('');
  const [newTenantLocation, setNewTenantLocation] = useState('');
  const [newTenantDesc, setNewTenantDesc] = useState('');

  // State Form Fitur & Logs
  const [username, setUsername] = useState('');
  const [licenseKey, setLicenseKey] = useState('');
  const [apiLogs, setApiLogs] = useState([]);

  // ==========================================
  // FUNGSI UNTUK MENGHAPUS TENANT
  // ==========================================
  const handleDeleteTenant = (e, tenantId) => {
    // 1. Mencegah trigger klik pada card tenant (Event Bubbling)
    e.stopPropagation();

    // 2. Konfirmasi penghapusan
    const targetTenant = tenants.find(t => t.id === tenantId);
    if (!window.confirm(`Apakah Anda yakin ingin menghapus ${targetTenant?.name}?`)) {
      return;
    }

    // 3. Filter array untuk membuang tenant yang dipilih
    const updatedTenants = tenants.filter(tenant => tenant.id !== tenantId);
    setTenants(updatedTenants);

    // 4. LOGIKA AMAN: Jika tenant yang didelete adalah tenant yang SEDANG AKTIF dibuka
    if (selectedTenant?.id === tenantId) {
      if (updatedTenants.length > 0) {
        // Alihkan workspace aktif ke tenant pertama yang tersisa
        setSelectedTenant(updatedTenants[0]);
      } else {
        // Jika semua tenant habis di-delete, set jadi null
        setSelectedTenant(null);
      }
    }
  };

  // Fungsi Tambah Tenant Baru
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

  // Helper Tracker Logs
  const logApiHit = (method, endpoint, payload = null) => {
    if (!selectedTenant) return;
    const fullUrl = `${selectedTenant.ip}${endpoint}`;
    const timestamp = new Date().toLocaleTimeString();
    setApiLogs(prev => [{ timestamp, method, fullUrl, payload: payload ? JSON.stringify(payload) : 'None' }, ...prev]);
  };

  useEffect(() => {
    setApiLogs([]);
    setActiveTab('dashboard');
  }, [selectedTenant]);

  return (
    <div className="flex h-screen bg-gray-100 font-sans overflow-hidden relative">

      {/* =========================================================
          S I D E B A R  (K I R I)
          ========================================================= */}
      <aside className="w-80 bg-gray-950 text-gray-200 flex flex-col border-r border-gray-850 shadow-xl overflow-hidden">

        {/* Header Sidebar */}
        <div className="p-5 border-b border-gray-800 bg-gray-900/50 flex-none">
          <h1 className="text-xl font-black text-white tracking-wider flex items-center gap-2">
            <span>🌐</span> TENANT PORTAL
          </h1>
          <p className="text-xs text-gray-500 mt-1">Sistem Multi-Endpoint Router</p>
        </div>

        {/* Tombol Buka Pop-up */}
        <div className="p-4 flex-none">
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-3 px-4 rounded-xl transition-all shadow-lg shadow-blue-900/30 active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <span>➕</span> Register New Tenant
          </button>
        </div>

        {/* LIST TENANT */}
        <nav className="flex-1 overflow-y-auto px-4 pb-4 space-y-3">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block px-1">
            Available Tenants ({tenants.length})
          </span>

          {tenants.length === 0 ? (
            <p className="text-xs text-gray-600 italic px-2 pt-4 text-center">Belum ada tenant terdaftar. Silahkan buat baru.</p>
          ) : (
            tenants.map((tenant) => {
              const isSelected = selectedTenant?.id === tenant.id;
              return (
                <div
                  key={tenant.id}
                  onClick={() => setSelectedTenant(tenant)}
                  className={`p-3.5 rounded-xl cursor-pointer transition-all border relative group ${isSelected
                    ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/10 translate-x-1'
                    : 'bg-gray-900 border-gray-855 text-gray-400 hover:bg-gray-850 hover:text-gray-200'
                    }`}
                >
                  {/* TOMBOL DELETE (MUNCUL SAAT CARD HOVER / AKTIF) */}
                  <button
                    onClick={(e) => handleDeleteTenant(e, tenant.id)}
                    className={`absolute top-3.5 right-3.5 text-xs p-1 rounded-lg transition-all opacity-0 group-hover:opacity-100 ${isSelected
                      ? 'bg-blue-700 text-blue-200 hover:bg-red-600 hover:text-white'
                      : 'bg-gray-950 text-gray-500 hover:bg-red-600 hover:text-white'
                      }`}
                    title="Delete Tenant"
                  >
                    🗑️
                  </button>

                  <div className="flex justify-between items-center pr-6">
                    <h3 className={`font-bold text-sm ${isSelected ? 'text-white' : 'text-gray-200'}`}>{tenant.name}</h3>
                  </div>

                  <div className="flex items-center gap-1.5 mt-1">
                    <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${isSelected ? 'bg-blue-700 text-blue-200' : 'bg-gray-800 text-gray-500'}`}>
                      {tenant.location}
                    </span>
                  </div>

                  <p className={`text-[11px] font-mono mt-2 p-1.5 rounded truncate ${isSelected ? 'bg-blue-700/50 text-blue-100' : 'bg-gray-950 text-emerald-400'
                    }`}>
                    🔗 {tenant.ip}
                  </p>
                </div>
              );
            })
          )}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-gray-800 bg-gray-900 text-[10px] text-gray-500 text-center flex-none">
          Dynamic Environment
        </div>
      </aside>

      {/* =========================================================
          AREA KONTEN UTAMA (KANAN)
          ========================================================= */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {selectedTenant ? (
          <>
            {/* Top Header Workspace */}
            <header className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center shadow-sm flex-none">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <h2 className="text-xl font-bold text-gray-800">{selectedTenant.name} Workspace</h2>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">Description: {selectedTenant.desc}</p>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold text-gray-400 block uppercase">Target IP Route</span>
                <code className="text-xs font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-1 rounded font-mono">
                  {selectedTenant.ip}
                </code>
              </div>
            </header>

            {/* Body Workspace */}
            <div className="flex-1 p-8 overflow-y-auto grid grid-cols-1 lg:grid-cols-2 gap-8">

              {/* TAB BAR BLOCK */}
              <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col overflow-hidden h-fit">
                <div className="flex border-b border-gray-200 bg-gray-50/70">
                  {['dashboard', 'users', 'license', 'firewall', 'log'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`py-4 px-6 font-semibold text-sm transition-all border-b-2 capitalize ${activeTab === tab ? 'border-blue-600 text-blue-600 bg-white' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100/50'
                        }`}
                    >
                      {tab === 'dashboard'
                        ? '📊 Dashboard'
                        : tab === 'users'
                          ? '👥 User Management'
                          : tab === 'license'
                            ? '🔑 License Management'
                            : tab === 'firewall'
                              ? '🛡️ Firewall Security'
                              : '📝 Log Management'}
                    </button>
                  ))}
                </div>

                <div className="p-8">
                  {activeTab === 'dashboard' && (
                    <DashboardPrimacom ipAddress={selectedTenant.ip + "/api/v1"} />
                  )}

                  {activeTab === 'users' && (
                    <AccountPrimacom ipAddress={selectedTenant.ip + "/api/v1"} />

                  )}
                  {activeTab === 'license' && (
                    <LicenseManagement ipAddress={selectedTenant.ip + "/api/v1"} />
                  )}
                  {activeTab === 'firewall' && (
                    <FirewallSecurity ipAddress={selectedTenant.ip + "/api/v1"} />
                  )}
                  {activeTab === 'log' && (
                    <LogsMonitoring ipAddress={selectedTenant.ip + "/api/v1"} />
                  )}
                </div>
              </div>

            </div>
          </>
        ) : (
          /* Tampilan Khusus jika semua tenant habis didelete */
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
            <span className="text-5xl mb-3">📁</span>
            <p className="font-medium">Tidak ada tenant aktif.</p>
            <p className="text-xs text-gray-400 mt-1">Silahkan tambah tenant baru terlebih dahulu di menu sidebar kiri.</p>
          </div>
        )}
      </main>

      {/* =========================================================
          P O P - U P   M O D A L   (REGISTER)
          ========================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative z-10 border border-gray-100">
            <div className="bg-gray-50 p-5 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Register New Tenant</h3>
                <p className="text-xs text-gray-500">Tambahkan target server internal baru</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 bg-gray-200/50 hover:bg-gray-200 p-1.5 rounded-lg text-sm">✕</button>
            </div>

            <form onSubmit={handleCreateTenant} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Nama Tenant</label>
                <input type="text" placeholder="Contoh: Tenant Gamma" value={newTenantName} onChange={(e) => setNewTenantName(e.target.value)} className="w-full border border-gray-300 p-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" required />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">IP Address / URL Endpoint</label>
                <input type="text" placeholder="Contoh: 192.168.10.25:5000" value={newTenantIp} onChange={(e) => setNewTenantIp(e.target.value)} className="w-full border border-gray-300 p-2.5 rounded-xl font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Lokasi Cabang</label>
                  <input type="text" placeholder="Contoh: Jakarta" value={newTenantLocation} onChange={(e) => setNewTenantLocation(e.target.value)} className="w-full border border-gray-300 p-2.5 rounded-xl text-sm focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Deskripsi</label>
                  <input type="text" placeholder="Keterangan singkat" value={newTenantDesc} onChange={(e) => setNewTenantDesc(e.target.value)} className="w-full border border-gray-300 p-2.5 rounded-xl text-sm focus:outline-none" />
                </div>
              </div>
              <div className="flex gap-3 pt-2 border-t border-gray-100 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="w-1/3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-sm py-2.5 rounded-xl">Batal</button>
                <button type="submit" className="w-2/3 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm py-2.5 rounded-xl shadow-md shadow-blue-600/20">Simpan Tenant</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}