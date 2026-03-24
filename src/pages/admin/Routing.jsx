import React, { useState } from 'react';

const Routing = () => {
  // State untuk Modal (Tambah Rute) dan Drawer (Lihat Rute)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [newYaml, setNewYaml] = useState('');

  // Data Mockup Routing
  const [routes, setRoutes] = useState([
    { 
      id: 'RT-001', name: 'OrderProcessingAPI', status: 'Running', uptime: '12d 4h', type: 'REST to ActiveMQ',
      yaml: "- from:\n    uri: 'rest:post:/order'\n    steps:\n      - log: 'Processing Order'\n      - to: 'activemq:queue:orders'"
    },
    { 
      id: 'RT-002', name: 'InventorySync', status: 'Stopped', uptime: '0s', type: 'SQL to File',
      yaml: "- from:\n    uri: 'timer:sync?period=10s'\n    steps:\n      - to: 'sql:select * from stock'\n      - to: 'file:outbox/inventory'"
    }
  ]);

  const handleAddRoute = () => {
    // Logika sederhana menambah rute baru ke list
    const newId = `RT-00${routes.length + 1}`;
    const newEntry = {
      id: newId,
      name: 'NewDeployedRoute',
      status: 'Stopped',
      uptime: '0s',
      type: 'YAML Custom',
      yaml: newYaml
    };
    setRoutes([...routes, newEntry]);
    setIsModalOpen(false);
    setNewYaml('');
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Running': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Stopped': return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'Suspended': return 'bg-amber-100 text-amber-700 border-amber-200';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="p-8 bg-slate-50 min-h-screen font-sans">
      
      {/* --- HEADER --- */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Routing Management</h1>
          <p className="text-slate-500 text-sm italic">ESB Monitoring by Primakom</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-blue-900/20 transition-all active:scale-95 flex items-center gap-2"
        >
          <span className="text-xl">+</span> ADD NEW ROUTE
        </button>
      </div>

      {/* --- TABLE LIST --- */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[11px] uppercase tracking-widest text-slate-400 font-bold">
              <th className="px-6 py-4">Route Info</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {routes.map((route) => (
              <tr 
                key={route.id} 
                onClick={() => setSelectedRoute(route)}
                className="hover:bg-blue-50/40 cursor-pointer transition-colors group"
              >
                <td className="px-6 py-4">
                  <div className="font-bold text-slate-700 group-hover:text-blue-900">{route.name}</div>
                  <div className="text-[10px] text-slate-400 font-mono uppercase">{route.id} • {route.type}</div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${getStatusStyle(route.status)}`}>
                    {route.status.toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                  <div className="flex justify-end gap-2">
                    <button className="p-1.5 hover:bg-emerald-50 text-emerald-600 rounded text-[10px] font-black">START</button>
                    <button className="p-1.5 hover:bg-rose-50 text-rose-600 rounded text-[10px] font-black">STOP</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- MODAL: ADD NEW ROUTE (YAML INPUT) --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-all">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800 text-lg">Deploy New Route</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-2">✕</button>
            </div>
            <div className="p-6 flex-1 overflow-y-auto">
              <label className="block text-xs font-bold text-slate-400 uppercase mb-3 tracking-widest">Camel YAML DSL Configuration</label>
              <textarea
                className="w-full h-80 p-5 bg-slate-900 text-blue-300 font-mono text-sm rounded-2xl outline-none border-2 border-slate-800 focus:border-blue-500 transition-all shadow-inner"
                placeholder="- from:&#10;    uri: 'direct:start'&#10;    steps:&#10;      - log: 'Message received'"
                value={newYaml}
                onChange={(e) => setNewYaml(e.target.value)}
              />
            </div>
            <div className="p-6 border-t border-slate-50 flex gap-3 justify-end">
              <button onClick={() => setIsModalOpen(false)} className="px-6 py-2 text-sm font-bold text-slate-400">Cancel</button>
              <button 
                onClick={handleAddRoute}
                className="px-8 py-2 bg-blue-900 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-900/20"
              >
                Deploy Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- DRAWER: VIEW DETAIL (VISUAL & CODE) --- */}
      {selectedRoute && (
        <>
          <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-[2px] z-[40]" onClick={() => setSelectedRoute(null)} />
          <div className="fixed inset-y-0 right-0 w-full max-w-2xl bg-white shadow-[-20px_0_50px_rgba(0,0,0,0.1)] z-[50] animate-in slide-in-from-right duration-300 flex flex-col">
            <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex justify-between items-start">
              <div>
                <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded mb-2 inline-block uppercase tracking-widest">Route Detail</span>
                <h3 className="font-bold text-slate-800 text-2xl">{selectedRoute.name}</h3>
                <p className="text-xs text-slate-400 font-mono mt-1">{selectedRoute.id} • {selectedRoute.type}</p>
              </div>
              <button onClick={() => setSelectedRoute(null)} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400">✕</button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-10">
              {/* Visual Flow Section */}
              <div>
                <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-6">Route Visualization</h4>
                <div className="relative py-12 px-6 bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-around overflow-hidden">
                  <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '16px 16px' }}></div>
                  <div className="flex flex-col items-center z-10">
                    <div className="w-16 h-16 bg-blue-600 rounded-2xl shadow-xl shadow-blue-600/20 flex items-center justify-center text-2xl text-white mb-3 italic">IN</div>
                    <span className="text-xs font-bold text-slate-600 uppercase tracking-tighter">Source</span>
                  </div>
                  <div className="flex-1 h-0.5 bg-gradient-to-r from-blue-600 to-indigo-900 mx-4 relative">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white border border-slate-200 px-3 py-1 rounded-full text-[10px] font-bold text-slate-400 shadow-sm">Camel Engine</div>
                  </div>
                  <div className="flex flex-col items-center z-10">
                    <div className="w-16 h-16 bg-indigo-900 rounded-2xl shadow-xl shadow-indigo-900/20 flex items-center justify-center text-2xl text-white mb-3 italic">OUT</div>
                    <span className="text-xs font-bold text-slate-600 uppercase tracking-tighter">Target</span>
                  </div>
                </div>
              </div>

              {/* Code Section */}
              <div>
                <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">YAML Specification</h4>
                <div className="bg-slate-900 rounded-2xl p-6 shadow-2xl relative group">
                  <div className="absolute top-4 right-4 text-[10px] font-bold text-slate-600 bg-slate-800 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">YAML</div>
                  <pre className="text-blue-300 font-mono text-sm leading-relaxed overflow-x-auto">
                    {selectedRoute.yaml}
                  </pre>
                </div>
              </div>
            </div>

            <div className="p-8 border-t border-slate-100 flex gap-4 bg-white">
              <button className="flex-1 bg-blue-900 text-white py-4 rounded-2xl font-bold text-sm tracking-widest hover:bg-slate-800 transition-colors uppercase">Update Configuration</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Routing;