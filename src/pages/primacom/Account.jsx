import React, { useState, useEffect } from 'react';
import axios from 'axios';

const UserManagement = ({ ipAddress }) => {
  // Gunakan IP Address dinamis dari props, atau fallback ke http://0.0.0.0:5001 jika kosong
  const baseUrl = ipAddress ? ipAddress.trimEnd('/') : 'http://0.0.0.0:5001';
  // State List & UI
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdateMode, setIsUpdateMode] = useState(false);

  // State Form Input
  const [selectedUserId, setSelectedUserId] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [pin, setPin] = useState('');

  // Config Headers Axios
  const getHeaders = (contentType = 'application/json') => ({
    headers: {
      'accept': '*/*',
      'Content-Type': contentType,
      // 'Authorization': `Bearer ${bearerToken}`
    }
  });

  // ==========================================
  // 1. GET: FETCH LIST USER
  // ==========================================
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${baseUrl}/User/User`, {
        headers: { 'accept': '*/*' }
      });
      
      // Sesuaikan jika respons berupa objek pembungkus (misal response.data.data)
      if (Array.isArray(response.data)) {
        setUsers(response.data);
      } else if (response.data && Array.isArray(response.data.data)) {
        setUsers(response.data.data);
      } else {
        setUsers([]);
      }
    } catch (err) {
      console.error("Gagal mengambil list user:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data saat pertama kali komponen di-mount atau IP berubah
  useEffect(() => {
    fetchUsers();
  }, [baseUrl]);

  // ==========================================
  // 2. POST / PUT: SAVE USER (REGISTER / UPDATE)
  // ==========================================
  const handleSaveUser = async (e) => {
    e.preventDefault();
    try {
      if (isUpdateMode) {
        // ---- METHOD PUT (UPDATE) ----
        // Menembak ke endpoint RESTful standar /User/{id}
        await axios.put(`${baseUrl}/User/${selectedUserId}`, {
          fullName,
          email,
          pin: pin || undefined // kirim pin jika diisi saat update
        }, getHeaders());
        
        alert('User berhasil diperbarui!');
      } else {
        // ---- METHOD POST (REGISTER) ----
        await axios.post(`${baseUrl}/User/register`, {
          pin,
          fullName,
          email
        }, getHeaders());
        
        alert('User baru berhasil diregistrasi!');
      }

      closeAndResetModal();
      fetchUsers(); // Refresh data table
    } catch (err) {
      console.error("Gagal menyimpan data user:", err);
      alert(err.response?.data?.message || "Terjadi kesalahan sistem.");
    }
  };

  // ==========================================
  // 3. DELETE: HAPUS USER
  // ==========================================
  const handleDeleteUser = async (id, name) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus akun [${name}]?`)) {
      try {
        await axios.delete(`${baseUrl}/User/${id}`, getHeaders('/*'));
        alert('User berhasil dihapus!');
        fetchUsers(); // Refresh list
      } catch (err) {
        console.error("Gagal menghapus user:", err);
        alert("Gagal menghapus user dari server.");
      }
    }
  };

  // Helper buka modal untuk edit mode
  const openEditModal = (user) => {
    setSelectedUserId(user.id || user._id);
    setFullName(user.fullName || user.name);
    setEmail(user.email);
    setPin(''); // Kosongkan pin demi keamanan, isi hanya jika mau diganti
    setIsUpdateMode(true);
    setIsModalOpen(true);
  };

  // Helper reset form modal
  const closeAndResetModal = () => {
    setIsModalOpen(false);
    setIsUpdateMode(false);
    setSelectedUserId('');
    setFullName('');
    setEmail('');
    setPin('');
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* TOP BAR MANAGEMENT */}
        <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div>
            <h1 className="text-xl font-bold text-slate-800">User Account Management</h1>
            <p className="text-xs text-slate-400 mt-1">Mengelola data user direktori pada endpoint: <code className="text-red-500 font-mono bg-red-50 px-1 rounded">{baseUrl}</code></p>
          </div>
          <button
            onClick={() => { setIsUpdateMode(false); setIsModalOpen(true); }}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-3 px-5 rounded-xl transition-all shadow-md active:scale-[0.98] flex items-center gap-2"
          >
            <span>➕</span> Add New User
          </button>
        </div>

        {/* DATA TABLE USERS */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse text-sm text-slate-600">
            <thead className="bg-slate-50 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="p-4 pl-6">Profile Info</th>
                <th className="p-4">Email</th>
                <th className="p-4 text-center w-40">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {loading ? (
                <tr>
                  <td colSpan="3" className="text-center py-12 text-slate-400 font-mono text-xs">Fetching records from .NET Core Web API...</td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="3" className="text-center py-12 text-slate-400 italic text-xs">Tidak ada data user yang ditemukan di endpoint database ini.</td>
                </tr>
              ) : (
                users.map((user, index) => (
                  <tr key={user.id || index} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 font-black text-xs flex items-center justify-center uppercase">
                          {(user.fullName || "U").charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{user.fullName || user.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono">ID: {user.id || 'N/A'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-slate-500 font-normal">{user.email}</td>
                    <td className="p-4 text-center space-x-2">
                      <button
                        onClick={() => openEditModal(user)}
                        className="text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 py-1.5 px-3 rounded-lg transition-colors shadow-2xs"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id, user.fullName)}
                        className="text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 py-1.5 px-3 rounded-lg transition-colors shadow-2xs"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* =========================================================
          POP-UP MODAL FORM: ADD / EDIT USER
          ========================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs" onClick={closeAndResetModal} />
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative z-10 border border-slate-100 animate-scaleUp">
            
            <div className="bg-slate-50 p-5 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="text-base font-bold text-slate-900">{isUpdateMode ? '✏️ Update User Data' : '👤 Register Account'}</h3>
                <p className="text-xs text-slate-400 mt-0.5">Isi payload parameters sesuai skema JSON swagger</p>
              </div>
              <button onClick={closeAndResetModal} className="text-slate-400 hover:text-slate-600 bg-slate-200/50 p-1.5 rounded-lg text-xs">✕</button>
            </div>

            <form onSubmit={handleSaveUser} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Full Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Primacom Admin"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full border border-slate-200 p-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  required 
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Email Address</label>
                <input 
                  type="email" 
                  placeholder="admin@primacom.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-slate-200 p-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  required 
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  PIN Password {isUpdateMode && <span className="text-[10px] text-amber-500 font-normal lowercase">(kosongkan jika tidak ingin diubah)</span>}
                </label>
                <input 
                  type="password" 
                  placeholder="••••••"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  className="w-full border border-slate-200 p-2.5 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  required={!isUpdateMode} 
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-100 mt-6">
                <button type="button" onClick={closeAndResetModal} className="w-1/3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs py-3 rounded-xl transition-colors">Batal</button>
                <button type="submit" className="w-2/3 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs py-3 rounded-xl shadow-md shadow-blue-600/10 transition-all">
                  {isUpdateMode ? 'Update Account' : 'Register Account'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;