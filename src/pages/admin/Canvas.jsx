import React, { useState } from 'react';

function Canvas() {
  const [nodes, setNodes] = useState([
    { id: 1, type: 'Direct', name: 'from-incoming-rest', x: 50, y: 50 },
    { id: 2, type: 'Log', name: 'log-request', x: 250, y: 50 },
  ]);

  return (
    <div className="p-8 bg-slate-50 min-h-screen font-sans">
      {/* Canvas Toolbar */}
      <div className="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between shadow-sm z-10">
        <div className="flex items-center gap-4">
          <h2 className="font-bold text-slate-700">ESB Canvas Builder</h2>
          <div className="h-4 w-[1px] bg-slate-300"></div>
          <span className="text-xs text-slate-500 font-mono italic text-blue-600 font-bold underline">camel-context.yaml</span>
        </div>
        
        <div className="flex items-center gap-2">
          <button className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-md transition-all">
            Clear Canvas
          </button>
          <button className="px-4 py-1.5 bg-blue-900 text-white text-xs font-bold rounded-md shadow-lg shadow-blue-900/20 hover:bg-slate-800 transition-all flex items-center gap-2">
            <span>📥</span> EXPORT YAML
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Components Palette (Left Sidebar) */}
        <div className="w-64 bg-white border-r border-slate-200 p-4 overflow-y-auto">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Components Palette</p>
          
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-700">Endpoints</h4>
            <div className="grid grid-cols-1 gap-2">
              <ComponentItem icon="📥" label="Direct" color="border-blue-400" />
              <ComponentItem icon="🌐" label="Rest" color="border-emerald-400" />
              <ComponentItem icon="📫" label="ActiveMQ" color="border-orange-400" />
            </div>

            <h4 className="text-xs font-bold text-slate-700 mt-6">Processors</h4>
            <div className="grid grid-cols-1 gap-2">
              <ComponentItem icon="📝" label="Log" color="border-slate-400" />
              <ComponentItem icon="🔀" label="Choice" color="border-purple-400" />
              <ComponentItem icon="⚙️" label="SetHeader" color="border-amber-400" />
            </div>
          </div>
        </div>

        {/* Main Canvas Area */}
        <div className="flex-1 relative overflow-hidden bg-slate-50 group">
          {/* Dot Grid Background */}
          <div className="absolute inset-0" 
               style={{ 
                 backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', 
                 backgroundSize: '24px 24px' 
               }}>
          </div>

          {/* Dummy Nodes (Visual Representation) */}
          {nodes.map((node) => (
            <div 
              key={node.id}
              style={{ left: node.x, top: node.y }}
              className="absolute w-48 bg-white border-2 border-slate-200 rounded-xl shadow-md p-3 cursor-move hover:border-blue-500 transition-colors group"
            >
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2 mb-2">
                <span className="text-sm font-bold text-slate-700">{node.type}</span>
                <span className="ml-auto text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded uppercase">Active</span>
              </div>
              <p className="text-[11px] text-slate-500 font-mono truncate">{node.name}</p>
              
              {/* Connection Points */}
              <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-blue-500 rounded-full cursor-crosshair"></div>
              <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-slate-300 rounded-full cursor-crosshair"></div>
            </div>
          ))}

          {/* Empty State Hint */}
          <div className="absolute bottom-8 right-8 bg-white/80 backdrop-blur-sm p-3 rounded-lg border border-slate-200 text-[11px] text-slate-500 shadow-sm">
            💡 Drag components from the left to start building your Camel route.
          </div>
        </div>

        {/* Properties Panel (Right Sidebar - Optional) */}
        <div className="w-72 bg-white border-l border-slate-200 p-4 hidden xl:block">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Properties</p>
          <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
            <p className="text-[11px] text-slate-400 mb-2 italic underline">No node selected</p>
            <p className="text-xs text-slate-500 leading-relaxed">Select a component on the canvas to edit its Camel properties and DSL parameters.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Sub-component untuk Palette Item
function ComponentItem({ icon, label, color }) {
  return (
    <div className={`flex items-center gap-3 p-3 bg-slate-50 border-l-4 ${color} rounded-r-lg hover:bg-white hover:shadow-sm cursor-grab active:cursor-grabbing transition-all border-y border-r border-slate-100`}>
      <span className="text-lg">{icon}</span>
      <span className="text-xs font-bold text-slate-700">{label}</span>
    </div>
  );
}

export default Canvas;