import React, { useState } from 'react';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Login Primakom ESB:', { email, password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 font-sans">
      <div className="max-w-md w-full">
        {/* Logo Primakom / ESB Placeholder */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-blue-900 rounded-xl flex items-center justify-center shadow-lg mb-4">
            <span className="text-white font-bold text-2xl">ESB</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">
            ESB MONITORING
          </h1>
          <p className="text-slate-500 text-sm">Powered by Primacom</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100 p-8">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-slate-800">Login</h2>
            <p className="text-sm text-slate-500">Gunakan kredensial akun untuk mengakses dashboard.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                Email Address
              </label>
              <input
                type="email"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-900 focus:bg-white focus:border-transparent outline-none transition-all placeholder:text-slate-400"
                placeholder="user@primakom.co.id"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                  Password
                </label>
                <a href="#" className="text-xs font-semibold text-blue-800 hover:text-blue-600">
                  Lupa Password?
                </a>
              </div>
              <input
                type="password"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-900 focus:bg-white focus:border-transparent outline-none transition-all placeholder:text-slate-400"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="flex items-center">
              <input
                id="remember"
                type="checkbox"
                className="h-4 w-4 text-blue-900 focus:ring-blue-900 border-slate-300 rounded cursor-pointer"
              />
              <label htmlFor="remember" className="ml-2 block text-sm text-slate-600 cursor-pointer">
                Tetap login di perangkat ini
              </label>
            </div>

            <button
              // type="submit"
              onClick={()=> window.location.href = "/dashboard"}
              className="w-full bg-blue-900 hover:bg-slate-800 text-white font-bold py-3 rounded-lg shadow-md shadow-blue-900/20 transition-all active:scale-[0.98]"
            >
              MASUK KE DASHBOARD
            </button>
          </form>
        </div>

        {/* Support Footer */}
        <p className="mt-8 text-center text-xs text-slate-400 uppercase tracking-widest">
          &copy; {new Date().getFullYear()} Primacom. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default LoginScreen;