import React from 'react';

const Dashboard = () => {
  // Data Mockup (Nanti bisa diganti dengan API)
  const serverSpecs = {
    os: "Ubuntu 22.04 LTS",
    cpu: "Intel(R) Xeon(R) Gold 6248R @ 3.00GHz",
    uptime: "14 days, 6 hours",
    ip: "10.20.30.145",
    serialNumber: "PK-ESB-2024-X99",
    expiryDate: "2025-12-31"
  };

  const stats = [
    { label: "CPU Usage", value: "42%", color: "text-blue-600", bg: "bg-blue-50", icon: "💻" },
    { label: "RAM Usage", value: "12.4 / 32 GB", color: "text-purple-600", bg: "bg-purple-50", icon: "🧠" },
    { label: "Active Routes", value: "128", color: "text-emerald-600", bg: "bg-emerald-50", icon: "🛤️" },
    { label: "Network In", value: "1.2 Gbps", color: "text-orange-600", bg: "bg-orange-50", icon: "🌐" },
  ];

  return (
    <div className="p-8 bg-slate-50 min-h-screen font-sans">
      {/* Header Section */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">System Overview</h1>
          <p className="text-slate-500">Real-time monitoring for ESB Primakom Instance</p>
        </div>
        <div className="text-right">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Server Status</span>
          <div className="flex items-center gap-2 text-emerald-500 font-semibold">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            Operational
          </div>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-5 hover:shadow-md transition-shadow">
            <div className={`w-12 h-12 ${stat.bg} rounded-xl flex items-center justify-center text-2xl`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">{stat.label}</p>
              <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Server Information Card */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-50 bg-slate-50/50">
            <h3 className="font-bold text-slate-700">Server Details & VM Report</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 gap-y-6">
              <div>
                <p className="text-xs text-slate-400 uppercase font-bold mb-1">Operating System</p>
                <p className="text-slate-700 font-medium">{serverSpecs.os}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase font-bold mb-1">IP Address</p>
                <p className="text-slate-700 font-mono font-medium">{serverSpecs.ip}</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-slate-400 uppercase font-bold mb-1">CPU Model</p>
                <p className="text-slate-700 font-medium">{serverSpecs.cpu}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase font-bold mb-1">System Uptime</p>
                <p className="text-slate-700 font-medium">{serverSpecs.uptime}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase font-bold mb-1">Network Out (Peak)</p>
                <p className="text-slate-700 font-medium">850 Mbps</p>
              </div>
            </div>
          </div>
        </div>

        {/* License & Serial Info */}
        <div className="space-y-6">
          <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all"></div>
            <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-4">License Information</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm opacity-60">Serial Number</p>
                <p className="font-mono text-lg font-bold tracking-wider">{serverSpecs.serialNumber}</p>
              </div>
              <div className="pt-4 border-t border-slate-800">
                <p className="text-sm opacity-60 mb-1">Expired Date</p>
                <p className="text-xl font-bold text-orange-400">{serverSpecs.expiryDate}</p>
                <p className="text-[10px] mt-1 text-slate-500 italic">*Contact Primakom support for renewal</p>
              </div>
            </div>
          </div>

          {/* Mini Routing Status */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <h3 className="text-slate-700 font-bold mb-4 text-sm">Routing Health</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Active Sessions</span>
                <span className="font-bold text-emerald-500">98%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full w-[98%]"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;