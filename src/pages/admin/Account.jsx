import React, { useState, useEffect } from 'react';
import api from "../../api/axios"; // 🔥 pastikan path benar

const Account = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [snInput, setSnInput] = useState('');

  // 🔥 STATE USER DARI API
  const [accountInfo, setAccountInfo] = useState({
    name: "",
    email: "",
    role: "",
    serialNumber: "PK-ESB-2024-X99-PRO",
    expiryDate: "2026-12-31",
    plan: "Enterprise Edition"
  });

  // =====================
  // 🔥 GET DATA USER
  // =====================
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

  return (
    <div className="p-8 bg-slate-50 min-h-screen font-sans">
      <div className="max-w-screen-lg mx-auto">

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-800">Account & Subscription</h1>
          <p className="text-slate-500 text-sm">Kelola profil, lisensi ESB, dan informasi tagihan Primakom Anda.</p>
        </div>

        <div className="flex flex-col md:flex-row gap-8">

          <div className="w-full md:w-64 space-y-1">
            <TabButton 
              label="Update Profile" 
              active={activeTab === 'profile'} 
              onClick={() => setActiveTab('profile')} 
              icon="👤"
            />
            <TabButton 
              label="License & SN" 
              active={activeTab === 'license'} 
              onClick={() => setActiveTab('license')} 
              icon="🔑"
            />
            <TabButton 
              label="Billing History" 
              active={activeTab === 'billing'} 
              onClick={() => setActiveTab('billing')} 
              icon="💳"
            />
          </div>

          <div className="flex-1 bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">

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
                    <button className="bg-blue-900 text-white px-6 py-2.5 rounded-xl font-bold text-sm">
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'license' && (
              <div className="p-8">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">License Management</h3>
                    <p className="text-xs text-slate-400 mt-1">Status lisensi ESB Anda.</p>
                  </div>
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-black rounded-full">
                    ACTIVE
                  </span>
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
                    <input 
                      type="text"
                      value={snInput}
                      onChange={(e) => setSnInput(e.target.value)}
                      className="flex-1 px-4 py-3 border rounded-xl"
                    />
                    <button className="bg-slate-800 text-white px-6 py-3 rounded-xl">
                      Update
                    </button>
                  </div>
                </div>
              </div>
            )}

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
    <span>{icon}</span>
    {label}
  </button>
);

const InputGroup = ({ label, defaultValue, disabled = false }) => (
  <div className="space-y-1.5">
    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide ml-1">{label}</label>
    <input 
      type="text" 
      defaultValue={defaultValue}
      disabled={disabled}
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