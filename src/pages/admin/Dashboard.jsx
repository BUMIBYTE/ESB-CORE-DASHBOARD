import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Cpu, Database, Activity, Globe, Server, RefreshCcw, LayoutDashboard, Zap, LucideMemoryStick } from 'lucide-react';
import { BaseUrlTest, BaseUrl, BaseUrlItacha, BaseUrlBB } from '../../api/apiservice';
import { CiFloppyDisk } from 'react-icons/ci';

const Dashboard = () => {
  const [serverSpecs, setServerSpecs] = useState({});
  const [stats, setStats] = useState([]);
  const [jobs, setJobs] = useState([]);

  const [cpuUsed, setCpuUsed] = useState(0);
  const [storageUsed, setStorageUsed] = useState({ used: 0, total: 1 });

  const [rawMem, setRawMem] = useState({ used: 0, total: 1 });

  const BASE_URL = BaseUrlItacha;

  const toGB = (mb) => (mb / 1024).toFixed(2);

  const fetchData = async () => {
    try {
      const [cpuRes, memRes, serverRes,storageRes, jobRes] = await Promise.all([
        axios.get(`${BASE_URL}/primacom/cpu`),
        axios.get(`${BASE_URL}/primacom/memory`),
        axios.get(`${BASE_URL}/primacom/server`),
        axios.get(`${BASE_URL}/primacom/storage`),
        axios.get(`${BASE_URL}/jbang/jobs`)
      ]);

      const cpu = cpuRes.data.data;
      const mem = memRes.data.data;
      const server = serverRes.data.data;
      const storage = storageRes.data.data;
      const jobList = jobRes.data.data;

      setServerSpecs(server);
      setJobs(jobList);
      setCpuUsed(cpu.used);
      setStorageUsed({ used: storage.result.used, total: storage.result.total });
      setRawMem({ used: mem.result.used, total: mem.result.total });

      setStats([
        {
          label: "CPU Usage",
          value: `${cpu.used}%`,
          subValue: `Idle: ${cpu.idle}%`,
          color: "text-blue-600",
          bg: "bg-blue-100",
          icon: <Cpu size={22} />,
          type: "cpu"
        },
        {
          label: "Ram Usage",
          value: `${toGB(mem.result.used)} GB`,
          subValue: `Total ${toGB(mem.result.total)} GB`,
          color: "text-purple-600",
          bg: "bg-purple-100",
          icon: <LucideMemoryStick size={22} />,
          type: "ram"
        },
        {
          label: "Storage Used",
          value: `${storage.result.used} GB`,
          subValue: `Total ${storage.result.total} GB`,
          color: "text-emerald-600",
          bg: "bg-emerald-100",
          icon: <Database size={22} />,
          type: "storage"
        },
        {
          label: "Network Peak",
          value: formatNetworkSpeed(server.networkPeak),
          subValue: "Max transfer rate",
          color: "text-orange-600",
          bg: "bg-orange-100",
          icon: <Globe size={22} />
        }
      ]);
    } catch (err) {
      console.error("Error fetch dashboard:", err);
    }
  };

  function formatNetworkSpeed(mbps) {
    if (!mbps) return "0 Mbps";

    // convert ke number
    let value = typeof mbps === "string"
      ? parseFloat(mbps.replace(",", ".").replace(/[^\d.]/g, ""))
      : mbps;

    if (isNaN(value)) return "0 Mbps";

    if (value >= 1000) {
      return (value / 1000).toFixed(2) + " Gbps";
    }

    return value.toFixed(2) + " Mbps";
  }

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-6 md:p-10 bg-[#f8fafc] min-h-screen font-sans text-slate-900">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 bg-indigo-600 rounded-lg text-white">
              <LayoutDashboard size={24} />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 ml-1">System Monitor</h1>
          </div>
          <div className="flex items-center gap-2 text-slate-500 text-sm font-medium ml-1">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Real-time analytics active
          </div>
        </div>

        <button onClick={fetchData} className="flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 rounded-xl transition-all shadow-sm border border-slate-200 font-bold text-sm">
          <RefreshCcw size={16} /> Force Refresh
        </button>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-slate-100 flex flex-col justify-between group hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105`}>
                {stat.icon}
              </div>
              <span className="text-[10px] font-bold bg-slate-50 text-slate-400 px-2 py-1 rounded-md uppercase tracking-wider italic">Live</span>
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-400 mb-1 uppercase tracking-tight">{stat.label}</p>
              <p className="text-2xl font-black text-slate-800 tracking-tighter">{stat.value}</p>
              {stat.subValue && <p className="text-[11px] text-slate-400 mt-1 font-medium">{stat.subValue}</p>}

              {stat.type === 'cpu' && (
                <div className="w-full bg-slate-100 h-1.5 rounded-full mt-4 overflow-hidden">
                  <div
                    className="bg-blue-500 h-full transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(59,130,246,0.3)]"
                    style={{ width: `${cpuUsed}%` }}
                  ></div>
                </div>
              )}

              {stat.type === 'ram' && (
                <div className="w-full bg-slate-100 h-1.5 rounded-full mt-4 overflow-hidden">
                  <div
                    className="bg-purple-500 h-full transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(168,85,247,0.3)]"
                    style={{ width: `${(rawMem.used / rawMem.total) * 100}%` }}
                  ></div>
                </div>
              )}

              {stat.type === 'storage' && (
                <div className="w-full bg-slate-100 h-1.5 rounded-full mt-4 overflow-hidden">
                  <div
                    className="bg-green-500 h-full transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(168,85,247,0.3)]"
                    style={{ width: `${(storageUsed.used / storageUsed.total) * 100}%` }}
                  ></div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* SERVER INFO */}
        <div className="lg:col-span-1 bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-slate-100 h-fit">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2.5 bg-slate-900 rounded-xl text-white shadow-lg">
              <Server size={20} />
            </div>
            <h3 className="font-bold text-lg text-slate-800 underline decoration-indigo-100 decoration-4 underline-offset-4">Server Identity</h3>
          </div>

          <div className="space-y-6">
            {[
              { label: "OS Environment", val: serverSpecs.operatingSystem },
              { label: "Public IP Address", val: serverSpecs.ipAddress },
              { label: "Processor Model", val: serverSpecs.cpuModel },
              { label: "System Uptime", val: serverSpecs.uptime },
            ].map((item, i) => (
              <div key={i} className="group">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">{item.label}</span>
                <p className="text-slate-700 font-bold truncate group-hover:text-indigo-600 transition-colors uppercase">
                  {item.val || '—'}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* JOBS TABLE WITH SCROLLING */}
        <div className="lg:col-span-2 bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-slate-100 flex flex-col overflow-hidden">
          <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-white z-10">
            <div className="flex items-center gap-2">
              <Zap size={18} className="text-amber-400 fill-amber-400" />
              <h3 className="font-bold text-lg text-slate-800 uppercase tracking-tight">Job Registry</h3>
            </div>
            <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
              {jobs.length} TASKS
            </span>
          </div>

          {/* TABLE CONTAINER DENGAN LIMIT TINGGI & SCROLL */}
          <div className="overflow-y-auto max-h-[450px] scrollbar-thin scrollbar-thumb-slate-200">
            <table className="w-full text-left border-collapse relative">
              <thead className="sticky top-0 bg-slate-50/90 backdrop-blur-md z-20">
                <tr className="text-slate-400 text-[10px] uppercase tracking-[0.2em] font-black border-b border-slate-100">
                  <th className="px-8 py-5">Process ID</th>
                  <th className="px-8 py-5 text-center">Status</th>
                  <th className="px-8 py-5 text-right">Traffic Port</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {jobs.length > 0 ? jobs.map(j => (
                  <tr key={j.id} className="hover:bg-slate-50/50 transition-all group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-indigo-500 transition-colors"></div>
                        <span className="font-mono text-sm font-bold text-slate-600 group-hover:text-indigo-600">#{j.id}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border shadow-sm transition-all ${j.status === "running" ? "bg-emerald-50 text-emerald-600 border-emerald-100 group-hover:bg-emerald-100" :
                        j.status === "failed" ? "bg-rose-50 text-rose-600 border-rose-100 group-hover:bg-rose-100" :
                          "bg-slate-50 text-slate-400 border-slate-100"
                        }`}>
                        {j.status}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right font-black text-slate-500 font-mono tracking-tighter">
                      {j.port}
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="3" className="px-8 py-20 text-center">
                      <p className="text-slate-400 font-bold uppercase tracking-widest text-xs italic">No process found</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* FOOTER TABEL */}
          <div className="p-4 bg-slate-50/30 border-t border-slate-50 text-center">
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-[0.1em]">Scroll to see more jobs</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;