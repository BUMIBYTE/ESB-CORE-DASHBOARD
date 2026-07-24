import React, { useState, useEffect } from 'react';
import {
  Key,
  Folder,
  GitFork,
  Clock,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Plus,
  X,
  RefreshCw,
  ShieldCheck,
  Server
} from 'lucide-react';
import api from '../../api/axios';

const LicenseManagement = () => {
  // State untuk data lisensi aktif
  const [licenseData, setLicenseData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // State Form Input untuk Generate / Update License baru
  const [durationDays, setDurationDays] = useState(365); // default 1 tahun
  const [maxFolders, setMaxFolders] = useState(2);
  const [maxRoutes, setMaxRoutes] = useState(4);
  const [generateLoading, setGenerateLoading] = useState(false);

  // ==========================================
  // 1. GET: FETCH & VALIDATE CURRENT LICENSE
  // ==========================================
  const fetchLicenseStatus = async () => {
    setLoading(true);
    try {
      const response = await api.get('/License/validated', {
        headers: { accept: '*/*' }
      });
      setLicenseData(response.data);
    } catch (err) {
      console.error('Gagal memuat status lisensi:', err);
      setLicenseData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLicenseStatus();
  }, []);

  // ==========================================
  // 2. POST: GENERATE / UPDATE NEW LICENSE
  // ==========================================
  const handleGenerateLicense = async (e) => {
    e.preventDefault();
    setGenerateLoading(true);
    try {
      const response = await api.post(
        '/License',
        {
          durationDays: parseInt(durationDays, 10),
          maxFolders: parseInt(maxFolders, 10),
          maxRoutes: parseInt(maxRoutes, 10)
        },
        {
          headers: {
            accept: '*/*',
            'Content-Type': 'application/json'
          }
        }
      );

      alert(`Sukses Generate Lisensi Baru!\nKey: ${response.data.licenseKey}`);
      setIsModalOpen(false);
      fetchLicenseStatus(); // Refresh status lisensi
    } catch (err) {
      console.error('Gagal generate lisensi:', err);
      alert(err.response?.data?.message || 'Gagal memperbarui lisensi server.');
    } finally {
      setGenerateLoading(false);
    }
  };

  // Helper format tanggal ISO ke lokal Indonesia
  const formatLocalTargetDate = (isoString) => {
    if (!isoString) return '-';
    return new Date(isoString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen w-full bg-[#090D14] text-slate-300 p-4 sm:p-6 lg:p-8 font-sans flex flex-col justify-between">
      {/* WRAPPER KONTEN UTAMA */}
      <div className="flex-1 flex flex-col max-w-7xl w-full mx-auto">
        
        {/* HEADER & ACTION BAR */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-6 border-b border-slate-800/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-950/40 border border-blue-500/30 text-blue-400 rounded-xl">
              <Key className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-slate-100 tracking-tight">License & Subscription</h3>
                <button
                  onClick={fetchLicenseStatus}
                  className="text-slate-500 hover:text-slate-300 transition-colors p-1"
                  title="Refresh Data"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-400' : ''}`} />
                </button>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">Kelola status aktif lisensi dan alokasi kuota resource server tenant.</p>
            </div>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-all flex items-center gap-2 shadow-lg shadow-blue-600/20 active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>Update / Generate License</span>
          </button>
        </div>

        {/* LOADING STATE */}
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center py-16 bg-[#0d131d]/50 border border-slate-800/60 rounded-2xl">
            <RefreshCw className="w-8 h-8 text-blue-400 animate-spin mb-3" />
            <p className="text-xs text-slate-400 font-mono">Memeriksa status aktivasi server...</p>
          </div>
        ) : licenseData ? (
          /* DISPLAY ACTIVE SUBSCRIPTION INFO */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* CARD UTAMA KEY LISENSI */}
            <div className="md:col-span-2 lg:col-span-3 bg-[#0d131d] border border-slate-800/80 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl transform translate-x-12 -translate-y-12 pointer-events-none" />

              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-6 border-b border-slate-800/60">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono block mb-1">
                    Active Serial Key
                  </span>
                  <div className="flex items-center gap-3">
                    <p className="text-xl sm:text-2xl font-black font-mono text-blue-400 tracking-wider">
                      {licenseData.licenseKey}
                    </p>
                  </div>
                </div>

                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                    licenseData.isValid
                      ? 'bg-emerald-950/50 border-emerald-500/30 text-emerald-400'
                      : 'bg-rose-950/50 border-rose-500/30 text-rose-400'
                  }`}
                >
                  {licenseData.isValid ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                  {licenseData.status || (licenseData.isValid ? 'VALID' : 'EXPIRED')}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-slate-800/60 border border-slate-700/50 text-slate-400 mt-0.5">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Masa Aktif Tersisa</p>
                    <p className="text-sm font-bold text-slate-100 mt-0.5">{licenseData.remainingDays} Hari</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-slate-800/60 border border-slate-700/50 text-amber-400/80 mt-0.5">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Tanggal Kadaluarsa</p>
                    <p className="text-sm font-bold text-amber-400 mt-0.5">{formatLocalTargetDate(licenseData.expiredAt)}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 sm:col-span-1">
                  <div className="p-2 rounded-lg bg-slate-800/60 border border-slate-700/50 text-slate-400 mt-0.5">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Pesan Status</p>
                    <p className="text-xs text-slate-300 italic mt-0.5 font-sans">"{licenseData.message || 'Lisensi Berjalan Normal'}"</p>
                  </div>
                </div>
              </div>
            </div>

            {/* METRICS HARDWARE QUOTA CARD 1 */}
            <div className="bg-[#0d131d] border border-slate-800/80 p-5 rounded-2xl shadow-xl flex items-center gap-4">
              <div className="p-3.5 bg-blue-950/40 border border-blue-500/20 text-blue-400 rounded-xl">
                <Folder className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Folder Quota Max</p>
                <p className="text-2xl font-black text-slate-100 mt-0.5">
                  {licenseData.folderQuota} <span className="text-xs font-normal text-slate-500">Folders</span>
                </p>
              </div>
            </div>

            {/* METRICS HARDWARE QUOTA CARD 2 */}
            <div className="bg-[#0d131d] border border-slate-800/80 p-5 rounded-2xl shadow-xl flex items-center gap-4">
              <div className="p-3.5 bg-indigo-950/40 border border-indigo-500/20 text-indigo-400 rounded-xl">
                <GitFork className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Route Quota Max</p>
                <p className="text-2xl font-black text-slate-100 mt-0.5">
                  {licenseData.routeQuota} <span className="text-xs font-normal text-slate-500">Routes</span>
                </p>
              </div>
            </div>

          </div>
        ) : (
          /* FALLBACK JIKA LISENSI TIDAK TERSEDIA / INVALID */
          <div className="flex-1 flex flex-col items-center justify-center p-8 bg-rose-950/20 border border-rose-500/30 rounded-2xl text-center">
            <div className="p-3 bg-rose-900/40 border border-rose-500/40 text-rose-400 rounded-xl mb-3">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h4 className="text-base font-semibold text-rose-200">Lisensi Server Tidak Valid / Tidak Ditemukan</h4>
            <p className="text-xs text-rose-300/70 max-w-md mt-1 mb-6">
              Sistem tidak menemukan lisensi aktif yang terdaftar. Silakan buat lisensi baru untuk memperbarui hak akses resource server.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-rose-600/20 transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Generate License Baru</span>
            </button>
          </div>
        )}
      </div>

      {/* POP-UP MODAL: GENERATE & UPDATE LICENSE */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-xs" onClick={() => setIsModalOpen(false)} />
          
          <div className="bg-[#0d131d] border border-slate-800 text-slate-300 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative z-10 animate-scaleUp">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-[#111722]">
              <div className="flex items-center gap-2.5">
                <Key className="w-4 h-4 text-blue-400" />
                <h3 className="text-sm font-semibold text-slate-100">Generate / Renew License</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-500 hover:text-slate-300 hover:bg-slate-800 p-1.5 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleGenerateLicense} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Durasi Lisensi (Hari)
                </label>
                <input
                  type="number"
                  value={durationDays}
                  onChange={(e) => setDurationDays(e.target.value)}
                  placeholder="Ex: 365"
                  className="w-full bg-[#161f2c] border border-slate-700/60 rounded-xl p-2.5 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-blue-500/60 transition-colors font-mono"
                  min="1"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Max Folder Allocation
                  </label>
                  <input
                    type="number"
                    value={maxFolders}
                    onChange={(e) => setMaxFolders(e.target.value)}
                    placeholder="Ex: 2"
                    className="w-full bg-[#161f2c] border border-slate-700/60 rounded-xl p-2.5 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-blue-500/60 transition-colors font-mono"
                    min="0"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Max Route Allocation
                  </label>
                  <input
                    type="number"
                    value={maxRoutes}
                    onChange={(e) => setMaxRoutes(e.target.value)}
                    placeholder="Ex: 4"
                    className="w-full bg-[#161f2c] border border-slate-700/60 rounded-xl p-2.5 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-blue-500/60 transition-colors font-mono"
                    min="0"
                    required
                  />
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex gap-3 pt-4 border-t border-slate-800/80 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-1/3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs py-2.5 rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={generateLoading}
                  className="w-2/3 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white font-medium text-xs py-2.5 rounded-xl shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-2"
                >
                  {generateLoading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Generating...</span>
                    </>
                  ) : (
                    <span>Apply & Activate</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LicenseManagement;