import React, { useState, useEffect } from 'react';
import axios from 'axios';

const LicenseManagement = ({ ipAddress }) => {
  // Gunakan IP dinamis atau fallback ke endpoint lokal kamu
  const baseUrl = ipAddress ? ipAddress.trimEnd('/') : 'http://0.0.0.0:5001';

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
      const response = await axios.get(`${baseUrl}/License/validated`, {
        headers: { 'accept': '*/*' }
      });
      setLicenseData(response.data);
    } catch (err) {
      console.error("Gagal memuat status lisensi:", err);
      setLicenseData(null);
    } finally {
      setLoading(true);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLicenseStatus();
  }, [baseUrl]);

  // ==========================================
  // 2. POST: GENERATE / UPDATE NEW LICENSE
  // ==========================================
  const handleGenerateLicense = async (e) => {
    e.preventDefault();
    setGenerateLoading(true);
    try {
      const response = await axios.post(
        `${baseUrl}/License`,
        {
          durationDays: parseInt(durationDays),
          maxFolders: parseInt(maxFolders),
          maxRoutes: parseInt(maxRoutes)
        },
        {
          headers: {
            'accept': '*/*',
            'Content-Type': 'application/json'
          }
        }
      );

      alert(`Sukses Generate Lisensi Baru!\nKey: ${response.data.licenseKey}`);
      setIsModalOpen(false);
      fetchLicenseStatus(); // Refresh tampilan status lisensi utama
    } catch (err) {
      console.error("Gagal generate lisensi:", err);
      alert(err.response?.data?.message || "Gagal memperbarui lisensi server.");
    } finally {
      setGenerateLoading(false);
    }
  };

  // Helper untuk format tanggal ISO ke lokal Indonesia
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
    <div className="p-6 bg-slate-50 min-h-screen font-sans">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* HEADER & ACTION BAR */}
        <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div>
            <h1 className="text-xl font-bold text-slate-800">License & Subscription</h1>
            <p className="text-xs text-slate-400 mt-1">
              Endpoint Target: <code className="text-red-500 font-mono bg-red-50 px-1 rounded">{baseUrl}</code>
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-3 px-5 rounded-xl transition-all shadow-md active:scale-[0.98] flex items-center gap-2"
          >
            <span>🔑</span> Update / Generate License
          </button>
        </div>

        {/* LOADING STATE */}
        {loading ? (
          <div className="text-center py-12 text-xs text-slate-400 font-mono">Pinging activation server...</div>
        ) : licenseData ? (
          /* DISPLAY ACTIVE SUBSCRIPTION INFO */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* CARD UTAMA KEY LISENSI */}
            <div className="md:col-span-3 bg-slate-900 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl transform translate-x-8 -translate-y-8" />
              
              <div className="flex justify-between items-start mb-6">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">Active License Serial Key</p>
                  <p className="text-2xl font-black font-mono text-blue-400 mt-1 tracking-wide">{licenseData.licenseKey}</p>
                </div>
                <span className={`px-3 py-1 text-[10px] font-black rounded-full border ${
                  licenseData.isValid 
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
                    : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                }`}>
                  {licenseData.status}
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 pt-4 border-t border-slate-800 text-sm">
                <div>
                  <p className="text-[10px] text-slate-500 uppercase font-semibold">Remaining Period</p>
                  <p className="font-bold text-slate-200 mt-0.5">{licenseData.remainingDays} Days Left</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase font-semibold">Expiration Date</p>
                  <p className="font-bold text-orange-400 mt-0.5">{formatLocalTargetDate(licenseData.expiredAt)}</p>
                </div>
                <div className="col-span-2 md:col-span-1">
                  <p className="text-[10px] text-slate-500 uppercase font-semibold">Status Message</p>
                  <p className="text-xs text-slate-300 italic mt-0.5">"{licenseData.message}"</p>
                </div>
              </div>
            </div>

            {/* METRICS HARDWARE QUOTA QUOTA CARD 1 */}
            <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-xl shadow-2xs">📁</div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Folder Quota Max</p>
                <p className="text-xl font-black text-slate-800 mt-0.5">{licenseData.folderQuota} <span className="text-xs text-slate-400 font-normal">Folders</span></p>
              </div>
            </div>

            {/* METRICS HARDWARE QUOTA CARD 2 */}
            <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-xl shadow-2xs">⚡</div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Route Quota Max</p>
                <p className="text-xl font-black text-slate-800 mt-0.5">{licenseData.routeQuota} <span className="text-xs text-slate-400 font-normal">Routes</span></p>
              </div>
            </div>

          </div>
        ) : (
          /* FALLBACK JIKA SERVER LIHAT TIDAK ADA LISENSI */
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-8 text-center text-rose-900">
            <span className="text-3xl">⚠️</span>
            <p className="font-bold mt-2">Lisensi Server Tidak Valid / Tidak Ditemukan</p>
            <p className="text-xs text-rose-700/70 mt-1">Silakan klik tombol di kanan atas untuk membuat registrasi lisensi baru ke sistem.</p>
          </div>
        )}

      </div>

      {/* =========================================================
          POP-UP MODAL: GENERATE & UPDATE LICENSE
          ========================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setIsModalOpen(false)} />
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative z-10 border border-slate-100 animate-scaleUp">
            
            <div className="bg-slate-50 p-5 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="text-base font-bold text-slate-900">Generate / Renew License</h3>
                <p className="text-xs text-slate-400 mt-0.5">Inject token parameter pembatasan resource</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 bg-slate-200/50 p-1.5 rounded-lg text-xs">✕</button>
            </div>

            <form onSubmit={handleGenerateLicense} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Duration (Days)</label>
                <input 
                  type="number" 
                  value={durationDays}
                  onChange={(e) => setDurationDays(e.target.value)}
                  placeholder="e.g. 365"
                  className="w-full border border-slate-200 p-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  min="1"
                  required 
                />
              </div>

              {/* <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Max Folders Allocation</label>
                  <input 
                    type="number" 
                    value={maxFolders}
                    onChange={(e) => setMaxFolders(e.target.value)}
                    placeholder="e.g. 5"
                    className="w-full border border-slate-200 p-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    min="0"
                    required 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Max Routes Allocation</label>
                  <input 
                    type="number" 
                    value={maxRoutes}
                    onChange={(e) => setMaxRoutes(e.target.value)}
                    placeholder="e.g. 10"
                    className="w-full border border-slate-200 p-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    min="0"
                    required 
                  />
                </div>
              </div> */}

              <div className="flex gap-3 pt-4 border-t border-slate-100 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="w-1/3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs py-3 rounded-xl">Batal</button>
                <button 
                  type="submit" 
                  disabled={generateLoading}
                  className="w-2/3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold text-xs py-3 rounded-xl shadow-md shadow-blue-600/10 transition-all"
                >
                  {generateLoading ? 'Generating...' : 'Apply & Activate'}
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