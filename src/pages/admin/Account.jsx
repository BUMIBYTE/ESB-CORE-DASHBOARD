import React, { useState, useEffect } from 'react';
import api from "../../api/axios"; // 🔥 Path axios Anda

const Account = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [snInput, setSnInput] = useState('');

  // State User dari API
  const [accountInfo, setAccountInfo] = useState({
    name: "",
    email: "",
    role: "",
    serialNumber: "PK-ESB-2024-X99-PRO",
    expiryDate: "2026-12-31",
    plan: "Enterprise Edition"
  });

  // ==========================================
  // 🔥 STATE KHUSUS FIREWALL SECURITY
  // ==========================================
  const [fwRules, setFwRules] = useState([]);
  const [isFwActive, setIsFwActive] = useState(false);
  const [fwLoading, setFwLoading] = useState(false);
  
  // Form State Tambah Rule Baru
  const [newRule, setNewRule] = useState({
    port: '',
    ipAddress: '',
    protocol: 'tcp',
    direction: 'in', // 'in' = Inbound, 'out' = Outbound
    action: 'allow'  // 'allow' atau 'deny'
  });

  // GET DATA USER
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get("/auth/verifySessions");
        if (res.data.code === 200) {
          setAccountInfo((prev) => ({
            ...prev,
            name: res.data.data.fullName,
            email: res.data.data.email,
            role: res.data.data.role,
          }));
        }
      } catch (err) {
        console.error("Failed fetch user:", err);
      }
    };
    fetchUser();
  }, []);

  // Fetch Aturan Firewall UFW dari API .NET
  const fetchFirewallData = async () => {
    setFwLoading(true);
    try {
      // 1. Cek Status ON/OFF (Menerima boolean true/false dari backend)
      const statusRes = await api.get("/primacom/firewall-status");
      setIsFwActive(statusRes.data.is_active); 

      // 2. Cek List Rules Berformat JSON
      const rulesRes = await api.get("/primacom/firewall/rules");
      
      // 🔥 FIX: Ambil dari objek rules_list sesuai respons backend Anda
      if (rulesRes.data && Array.isArray(rulesRes.data.rules_list)) {
        setFwRules(rulesRes.data.rules_list);
      } else {
        console.warn("rules_list tidak ditemukan atau bukan array", rulesRes.data);
        setFwRules([]);
      }

    } catch (err) {
      console.error("Gagal mengambil data firewall:", err);
      setFwRules([]); 
    } finally {
      setFwLoading(false);
    }
  };

  // Panggil data jika tab firewall dibuka
  useEffect(() => {
    if (activeTab === 'firewall') {
      fetchFirewallData();
    }
  }, [activeTab]);

  // Handler ON/OFF Firewall
  const handleToggleFirewall = async () => {
    try {
      const targetStatus = !isFwActive;
      await api.put(`/primacom/firewall/toggle?enable=${targetStatus}`);
      setIsFwActive(targetStatus);
      fetchFirewallData(); // Refresh data
    } catch (err) {
      alert("Gagal mengubah status firewall. Pastikan API berjalan dengan sudo.");
    }
  };

  // Handler Tambah Rule Baru (Allow/Deny)
  const handleAddRule = async (e) => {
    e.preventDefault();
    if (!newRule.port && !newRule.ipAddress) {
      alert("Isi minimal Port atau IP Address!");
      return;
    }

    const endpoint = `/primacom/firewall/${newRule.action}`; // /allow atau /deny
    try {
      await api.post(endpoint, {
        port: newRule.port || null,
        ipAddress: newRule.ipAddress || null,
        protocol: newRule.protocol,
        direction: newRule.direction
      });
      
      // Reset Form & Refresh
      setNewRule({ port: '', ipAddress: '', protocol: 'tcp', direction: 'in', action: 'allow' });
      fetchFirewallData();
    } catch (err) {
      alert("Gagal menambahkan aturan firewall.");
    }
  };

  // Handler Hapus Aturan berdasarkan ID/Nomor urut UFW
  const handleDeleteRule = async (id) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus aturan nomor [${id}]?`)) {
      try {
        await api.delete(`/primacom/firewall/rules/${id}`);
        fetchFirewallData(); // Refresh list agar nomor urut diperbarui otomatis oleh sistem Ubuntu
      } catch (err) {
        alert("Gagal menghapus aturan.");
      }
    }
  };

  return (
    <div className="p-8 bg-slate-50 min-h-screen font-sans">
      <div className="max-w-screen-lg mx-auto">

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-800">Account & Subscription</h1>
          <p className="text-slate-500 text-sm">Kelola profil, lisensi ESB, dan keamanan jaringan server Anda.</p>
        </div>

        <div className="flex flex-col md:flex-row gap-8">

          {/* SIDEBAR NAVIGATION */}
          <div className="w-full md:w-64 space-y-1">
            <TabButton label="Update Profile" active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} icon="👤" />
            <TabButton label="License & SN" active={activeTab === 'license'} onClick={() => setActiveTab('license')} icon="🔑" />
            <TabButton label="Firewall Security" active={activeTab === 'firewall'} onClick={() => setActiveTab('firewall')} icon="🛡️" />
            <TabButton label="Billing History" active={activeTab === 'billing'} onClick={() => setActiveTab('billing')} icon="💳" />
          </div>

          {/* MAIN CONTENT CONTAINER */}
          <div className="flex-1 bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">

            {/* TAB PROFILE */}
            {activeTab === 'profile' && (
              <div className="p-8">
                <h3 className="text-lg font-bold text-slate-800 mb-6">Profile Settings</h3>
                <div className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <InputGroup label="Full Name" defaultValue={accountInfo.name} />
                    <InputGroup label="Role" defaultValue={accountInfo.role} disabled />
                  </div>
                  <InputGroup label="Email Address" defaultValue={accountInfo.email} />
                  <div className="pt-4">
                    <button className="bg-blue-900 text-white px-6 py-2.5 rounded-xl font-bold text-sm">Save Changes</button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB LICENSE */}
            {activeTab === 'license' && (
              <div className="p-8">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">License Management</h3>
                    <p className="text-xs text-slate-400 mt-1">Status lisensi ESB Anda.</p>
                  </div>
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-black rounded-full">ACTIVE</span>
                </div>
                <div className="bg-slate-900 rounded-2xl p-6 mb-8 text-white">
                  <p className="text-[10px] text-slate-400 uppercase mb-1">Serial Number</p>
                  <p className="text-xl font-mono text-blue-300">{accountInfo.serialNumber}</p>
                  <div className="mt-6 flex gap-8">
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase">Plan</p>
                      <p className="text-sm font-bold">{accountInfo.plan}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase">Expired</p>
                      <p className="text-sm font-bold text-orange-400">{accountInfo.expiryDate}</p>
                    </div>
                  </div>
                </div>
                <div className="border-t pt-8">
                  <h4 className="text-sm font-bold text-slate-700 mb-4">Update SN</h4>
                  <div className="flex gap-3">
                    <input type="text" value={snInput} onChange={(e) => setSnInput(e.target.value)} className="flex-1 px-4 py-3 border rounded-xl" />
                    <button className="bg-slate-800 text-white px-6 py-3 rounded-xl">Update</button>
                  </div>
                </div>
              </div>
            )}

            {/* 🔥 TAB: FIREWALL SECURITY */}
            {activeTab === 'firewall' && (
              <div className="p-8">
                {/* Header & Toggle ON/OFF */}
                <div className="flex justify-between items-center mb-6 pb-6 border-b border-slate-100">
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">UFW Firewall Security</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Kelola lalu lintas Inbound & Outbound server Ubuntu Anda.</p>
                  </div>
                  <button 
                    onClick={handleToggleFirewall}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                      isFwActive ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20' : 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                    {isFwActive ? 'FIREWALL: ACTIVE' : 'FIREWALL: INACTIVE'}
                  </button>
                </div>

                {/* Form Tambah Aturan Baru */}
                <div className="bg-slate-50 rounded-2xl p-5 mb-8 border border-slate-150">
                  <h4 className="text-sm font-bold text-slate-700 mb-4">➕ Tambah Rule Kebijakan Baru</h4>
                  <form onSubmit={handleAddRule} className="grid grid-cols-2 md:grid-cols-5 gap-3 items-end">
                    
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Tipe</label>
                      <select 
                        value={newRule.action} 
                        onChange={(e) => setNewRule({...newRule, action: e.target.value})}
                        className="w-full p-2 text-xs bg-white border border-slate-200 rounded-xl outline-none"
                      >
                        <option value="allow">ALLOW (Izinkan)</option>
                        <option value="deny">DENY (Blokir)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Arah Trafik</label>
                      <select 
                        value={newRule.direction} 
                        onChange={(e) => setNewRule({...newRule, direction: e.target.value})}
                        className="w-full p-2 text-xs bg-white border border-slate-200 rounded-xl outline-none"
                      >
                        <option value="in">Inbound (Masuk)</option>
                        <option value="out">Outbound (Keluar)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Port</label>
                      <input 
                        type="text" 
                        placeholder="Contoh: 8080"
                        value={newRule.port}
                        onChange={(e) => setNewRule({...newRule, port: e.target.value})}
                        className="w-full p-2 text-xs bg-white border border-slate-200 rounded-xl outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">IP Address</label>
                      <input 
                        type="text" 
                        placeholder="Anywhere / IP spesifik"
                        value={newRule.ipAddress}
                        onChange={(e) => setNewRule({...newRule, ipAddress: e.target.value})}
                        className="w-full p-2 text-xs bg-white border border-slate-200 rounded-xl outline-none"
                      />
                    </div>

                    <div className="col-span-2 md:col-span-1">
                      <button type="submit" className="w-full bg-blue-900 text-white p-2 rounded-xl text-xs font-bold hover:bg-blue-950 transition-colors">
                        Terapkan Rule
                      </button>
                    </div>

                  </form>
                </div>

                {/* Tabel Aturan Aktif */}
                <div>
                  <h4 className="text-sm font-bold text-slate-700 mb-3">🛡️ Daftar Aturan yang Terdaftar</h4>
                  
                  {fwLoading ? (
                    <p className="text-xs text-slate-400 text-center py-6">Memuat konfigurasi server...</p>
                  ) : fwRules.length === 0 ? (
                    <div className="text-center py-8 border border-dashed rounded-2xl border-slate-200">
                      <p className="text-xs text-slate-400">Tidak ada aturan khusus aktif. Server mengikuti kebijakan default.</p>
                    </div>
                  ) : (
                    <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                            <th className="p-4 w-12 text-center">ID</th>
                            <th className="p-4">Target (To)</th>
                            <th className="p-4">Kebijakan</th>
                            <th className="p-4">Sumber (From)</th>
                            <th className="p-4 w-20 text-center">Aksi</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs">
                          {fwRules.map((rule) => (
                            <tr key={rule.id} className="hover:bg-slate-50/50 transition-colors">
                              <td className="p-4 text-center font-mono text-slate-400 bg-slate-50/30">{rule.id}</td>
                              <td className="p-4 font-bold text-slate-700">{rule.to}</td>
                              <td className="p-4">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                                  rule.action.includes("ALLOW") ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                                }`}>
                                  {rule.action}
                                </span>
                              </td>
                              <td className="p-4 text-slate-500 font-mono">{rule.from}</td>
                              <td className="p-4 text-center">
                                <button 
                                  onClick={() => handleDeleteRule(rule.id)}
                                  className="text-rose-600 hover:bg-rose-50 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border border-rose-100 hover:border-rose-200"
                                  title={`Hapus aturan nomor ${rule.id}`}
                                >
                                  🗑️ Hapus
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB BILLING */}
            {activeTab === 'billing' && (
              <div className="p-8">
                <h3 className="text-lg font-bold text-slate-800 mb-6">Billing History</h3>
                <BillingItem date="12 Jan 2025" amount="IDR 52.500.000" status="Paid" inv="INV/2024/001" />
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

// --- Sub-components ---
const TabButton = ({ label, active, onClick, icon }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${
      active ? 'bg-blue-900 text-white shadow-lg shadow-blue-900/20' : 'text-slate-500 hover:bg-slate-200/50'
    }`}
  >
    <span>{icon}</span>{label}
  </button>
);

const InputGroup = ({ label, defaultValue, disabled = false }) => (
  <div className="space-y-1.5">
    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide ml-1">{label}</label>
    <input 
      type="text" defaultValue={defaultValue} disabled={disabled}
      className={`w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all ${
        disabled ? 'bg-slate-50 text-slate-400 cursor-not-allowed' : 'bg-white text-slate-700'
      }`}
    />
  </div>
);

const BillingItem = ({ date, amount, status, inv }) => (
  <div className="flex justify-between items-center p-4 border border-slate-100 rounded-2xl hover:bg-slate-50 transition-colors">
    <div>
      <p className="text-sm font-bold text-slate-700">{inv}</p>
      <p className="text-xs text-slate-400">{date}</p>
    </div>
    <div className="text-right">
      <p className="text-sm font-bold text-slate-700">{amount}</p>
      <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{status}</p>
    </div>
  </div>
);

export default Account;