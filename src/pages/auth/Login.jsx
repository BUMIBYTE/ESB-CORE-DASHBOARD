import React, { useState } from "react";
import api from "../../api/axios"; // 🔥 pakai axios instance

const Login = () => {
  const [email, setEmail] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await api.post("/auth/login", {
        email: email,
        pin: pin,
      });

      console.log("LOGIN RESPONSE:", res.data);

      if (res.data.code === 200) {
        // 🔥 simpan token
        localStorage.setItem("accessToken", res.data.accessToken);
        localStorage.setItem("userId", res.data.id);

        // redirect
        window.location.href = "/dashboard";
      } else {
        setError("Opps! Login gagal, periksa kembali akun Anda.");
      }

    } catch (err) {
      console.error(err);

      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Email atau PIN yang Anda masukkan salah.");
      }

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-lg border border-white/20 p-8 rounded-2xl shadow-2xl">
        
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            Primacom <span className="text-blue-400">ESB Monitoring</span>
          </h2>
          <p className="text-slate-300 mt-2 text-sm">Silahkan masuk ke dashboard</p>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-200 text-sm p-3 rounded-lg mb-6 animate-pulse">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-slate-200 text-sm font-medium mb-2">Alamat Email</label>
            <input
              type="email"
              required
              className="w-full bg-slate-800/50 border border-slate-700 text-white p-3 rounded-xl"
              placeholder="nama@perusahaan.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-slate-200 text-sm font-medium mb-2">PIN Keamanan</label>
            <input
              type="password"
              required
              className="w-full bg-slate-800/50 border border-slate-700 text-white p-3 rounded-xl"
              placeholder="••••••"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full flex items-center justify-center py-3 px-4 rounded-xl font-bold text-white ${
              loading 
                ? "bg-blue-800 cursor-not-allowed" 
                : "bg-blue-600 hover:bg-blue-500"
            }`}
          >
            {loading ? "Memproses..." : "Masuk Sekarang"}
          </button>
        </form>

        <p className="text-center text-slate-400 text-xs mt-8">
          &copy; 2026 Enterprise Service Bus Designer. <br/> All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Login;