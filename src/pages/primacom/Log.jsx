import React, { useState, useEffect } from 'react';
import api from "../../api/axios"; // 🔥 Menggunakan kustom instance Axios Anda
import axios from 'axios';

const LogsMonitoring = ({ ipAddress }) => {
  const baseUrl = ipAddress ? ipAddress.trimEnd('/') : '';

  // State untuk menyimpan daftar audit log internal server
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch data logs audit dari API .NET Core Tenant
  const fetchLogsData = async () => {
    if (!baseUrl) return;
    setLoading(true);
    try {
      const response = await axios.get(`${baseUrl}/Logs/logs`, {
        headers: { 'accept': '*/*' }
      });
      
      // Mengambil array berdasarkan respons format 'response.data.data'
      if (response.data && Array.isArray(response.data.data)) {
        // Urutkan berdasarkan tanggal terbaru di posisi teratas (descending)
        const sortedLogs = response.data.data.sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        );
        setLogs(sortedLogs);
      } else {
        setLogs([]);
      }
    } catch (err) {
      console.error("Gagal menarik data audit logs:", err);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  // Trigger fetch ulang setiap kali IP Tenant berganti di sidebar
  useEffect(() => {
    fetchLogsData();
  }, [baseUrl]);

  // Filter pencarian berdasarkan Status Tindakan atau User ID
  const filteredLogs = logs.filter(log => 
    log.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.userId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Helper untuk memformat ISO timestamp menjadi format waktu yang rapi
  const formatLogTime = (isoString) => {
    if (!isoString) return '-';
    return new Date(isoString).toLocaleString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="p-8 bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden font-sans animate-fadeIn">
      
      {/* HEADER SECTION & SEARCH BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-100">
        <div>
          <h3 className="text-lg font-bold text-slate-800">System Activity Logs</h3>
          <p className="text-xs text-slate-400 mt-0.5">Memantau riwayat otentikasi sesi dan operasi sistem secara realtime.</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Input Filter Pencarian */}
          <input 
            type="text"
            placeholder="Cari status / User ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="p-2 px-3 text-xs border border-slate-200 bg-slate-50 focus:bg-white rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-60 transition-all font-medium"
          />
          {/* Tombol Manual Refresh */}
          <button 
            onClick={fetchLogsData}
            className="p-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors border border-slate-200"
            title="Refresh logs data"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* DATA MONITORING TABLE */}
      <div>
        {loading ? (
          <p className="text-xs text-slate-400 text-center py-10 font-mono">Streaming application traces from {baseUrl}...</p>
        ) : filteredLogs.length === 0 ? (
          <div className="text-center py-12 border border-dashed rounded-2xl border-slate-200">
            <span className="text-2xl">📋</span>
            <p className="text-xs text-slate-400 mt-2">Tidak ada log aktivitas sistem yang cocok atau ditemukan.</p>
          </div>
        ) : (
          <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-2xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                  <th className="p-4 pl-6">Timestamp Executed</th>
                  <th className="p-4">Action Status</th>
                  <th className="p-4">Account / User ID Reference</th>
                  <th className="p-4 font-mono">Trace Document ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                    {/* Kolom Waktu */}
                    <td className="p-4 pl-6 text-slate-500 font-normal">
                      {formatLogTime(log.createdAt)}
                    </td>
                    
                    {/* Kolom Status Badge */}
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wide border ${
                        log.status === 'Login' 
                          ? 'bg-blue-50 text-blue-600 border-blue-100' 
                          : 'bg-amber-50 text-amber-600 border-amber-100'
                      }`}>
                        🔑 {log.status}
                      </span>
                    </td>
                    
                    {/* Kolom User ID */}
                    <td className="p-4 font-mono text-[11px] text-slate-600">
                      {log.userId}
                    </td>
                    
                    {/* Kolom Id MongoDB Log */}
                    <td className="p-4 font-mono text-[11px] text-slate-400">
                      {log.id}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* FOOTER METRICS SUMMARY */}
      {!loading && filteredLogs.length > 0 && (
        <div className="mt-4 flex justify-between items-center text-[11px] text-slate-400 px-2 font-medium">
          <p>Showing {filteredLogs.length} activity traces sequentially.</p>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
            <p className="font-mono text-[10px]">Active Node: {baseUrl}</p>
          </div>
        </div>
      )}

    </div>
  );
};

export default LogsMonitoring;