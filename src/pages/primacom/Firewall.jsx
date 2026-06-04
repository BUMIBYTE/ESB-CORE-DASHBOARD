import React, { useState, useEffect } from 'react';
import api from "../../api/axios"; // Gunakan kustom instance Anda secara konsisten
import axios from 'axios';

const FirewallSecurity = ({ ipAddress }) => {
  const baseUrl = ipAddress ? ipAddress.trimEnd('/') : '';
  
  // State Khusus Firewall Security
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

  // Fetch Aturan Firewall UFW dari API .NET Core Tenant
  const fetchFirewallData = async () => {
    if (!baseUrl) return; // Guard clause jika baseUrl belum siap
    setFwLoading(true);
    try {
      // 1. Cek Status ON/OFF
      const statusRes = await axios.get(`${baseUrl}/primacom/firewall-status`);
      setIsFwActive(statusRes.data.is_active); 

      // 2. Cek List Rules Berformat JSON
      const rulesRes = await axios.get(`${baseUrl}/primacom/firewall/rules`);
      
      if (rulesRes.data && Array.isArray(rulesRes.data.rules_list)) {
        setFwRules(rulesRes.data.rules_list);
      } else {
        setFwRules([]);
      }
    } catch (err) {
      console.error("Gagal mengambil data firewall:", err);
      setFwRules([]); 
    } finally {
      setFwLoading(false);
    }
  };

  // Auto-fetch data saat komponen di-mount atau IP Tenant berubah di sidebar
  useEffect(() => {
    fetchFirewallData();
  }, [baseUrl]);

  // Handler ON/OFF Firewall
  const handleToggleFirewall = async () => {
    try {
      const targetStatus = !isFwActive;
      await axios.put(`${baseUrl}/primacom/firewall/toggle?enable=${targetStatus}`);
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

    const endpoint = `${baseUrl}/primacom/firewall/${newRule.action}`; // /allow atau /deny
    try {
      await axios.post(endpoint, {
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
        await axios.delete(`${baseUrl}/primacom/firewall/rules/${id}`);
        fetchFirewallData(); // Refresh list agar nomor urut diperbarui otomatis oleh sistem Ubuntu
      } catch (err) {
        alert("Gagal menghapus aturan.");
      }
    }
  };

  return (
    <div className="p-8 bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden font-sans animate-fadeIn">
      
      {/* Header & Toggle ON/OFF */}
      <div className="flex justify-between items-center mb-6 pb-6 border-b border-slate-100">
        <div>
          <h3 className="text-lg font-bold text-slate-800">UFW Firewall Security</h3>
          <p className="text-xs text-slate-400 mt-0.5">Kelola lalu lintas Inbound & Outbound server Ubuntu Anda.</p>
        </div>
        
        {/* PERBAIKAN: Syntax template ternary className diperbaiki */}
        <button 
          onClick={handleToggleFirewall}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 text-white ${
            isFwActive 
              ? 'bg-emerald-500 shadow-md shadow-emerald-500/20 hover:bg-emerald-600' 
              : 'bg-rose-500 shadow-md shadow-rose-500/20 hover:bg-rose-600'
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
  );
};

export default FirewallSecurity;