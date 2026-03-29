import React, { useCallback, useState } from "react";
import ReactFlow, {
  addEdge,
  Controls,
  Background,
  Handle,
  Position,
  useNodesState,
  useEdgesState,
  MarkerType,
} from "reactflow";
import "reactflow/dist/style.css";

// =====================
// 🎨 THEME & STYLES
// =====================
const theme = {
  timer: { bg: "#e1f5fe", border: "#039be5", icon: "🕒" },
  http: { bg: "#e8f5e9", border: "#43a047", icon: "🌐" },
  log: { bg: "#fff3e0", border: "#fb8c00", icon: "📝" },
  choice: { bg: "#f3e5f5", border: "#8e24aa", icon: "🔀" },
  split: { bg: "#ede7f6", border: "#5e35b1", icon: "✂️" },
  setHeader: { bg: "#fce4ec", border: "#d81b60", icon: "📌" },
  setBody: { bg: "#fff9c4", border: "#fbc02d", icon: "📦" },
  setProperty: { bg: "#f3e5f5", border: "#7b1fa2", icon: "💎" },
  unmarshal: { bg: "#e0f2f1", border: "#00897b", icon: "🔓" },
  default: { bg: "#ffffff", border: "#9e9e9e", icon: "🔹" },
};

// =====================
// ✨ CUSTOM NODES
// =====================
const BaseNode = ({ data, selected, children, type }) => {
  const style = theme[type] || theme.default;
  return (
    <div style={{
      padding: "10px 15px", borderRadius: "8px", background: style.bg,
      border: `2px solid ${selected ? "#2196f3" : style.border}`,
      boxShadow: selected ? "0 0 12px rgba(33, 150, 243, 0.6)" : "0 2px 5px rgba(0,0,0,0.1)",
      minWidth: "160px", fontSize: "12px", transition: "all 0.2s"
    }}>
      <div style={{ fontWeight: "bold", display: "flex", alignItems: "center", gap: "8px" }}>
        <span>{style.icon}</span> {data.label}
      </div>
      <div style={{ fontSize: "10px", color: "#666", marginTop: "2px", fontFamily: "monospace" }}>
        ID: {data.config?.id}
      </div>
      {children}
    </div>
  );
};

const DefaultNode = ({ data, selected }) => (
  <BaseNode data={data} selected={selected} type={data.nodeType}>
    <Handle type="target" position={Position.Top} />
    <Handle type="source" position={Position.Bottom} />
  </BaseNode>
);

const ChoiceNode = ({ data, selected }) => (
  <BaseNode data={data} selected={selected} type="choice">
    <Handle type="target" position={Position.Top} />
    <div style={{ display: "flex", justifyContent: "space-between", marginTop: "10px" }}>
      <b style={{ color: "green", fontSize: "9px" }}>TRUE</b>
      <b style={{ color: "red", fontSize: "9px" }}>FALSE</b>
    </div>
    <Handle type="source" position={Position.Bottom} id="true" style={{ left: "25%", background: "green" }} />
    <Handle type="source" position={Position.Bottom} id="false" style={{ left: "75%", background: "red" }} />
  </BaseNode>
);

const nodeTypes = { default: DefaultNode, choiceNode: ChoiceNode };

// =====================
// 🚀 MAIN APP
// =====================
export default function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  
  // State for Modal
  const [showModal, setShowModal] = useState(false);
  const [generatedYaml, setGeneratedYaml] = useState("");
  const [copySuccess, setCopySuccess] = useState(false);

  const onConnect = useCallback((params) => {
    const isChoice = params.sourceHandle === "true" || params.sourceHandle === "false";
    setEdges((eds) => addEdge({
      ...params, animated: true,
      label: isChoice ? params.sourceHandle : "",
      labelStyle: { fill: params.sourceHandle === "true" ? "green" : "red", fontWeight: 700 },
      markerEnd: { type: MarkerType.ArrowClosed },
    }, eds));
  }, [setEdges]);

  const onDrop = useCallback((event) => {
    event.preventDefault();
    const type = event.dataTransfer.getData("application/reactflow");
    if (!type) return;
    const id = `node_${Date.now()}`;
    const newNode = {
      id, type: type === "choice" ? "choiceNode" : "default",
      position: { x: event.clientX - 400, y: event.clientY - 100 },
      data: { label: type.toUpperCase(), nodeType: type, config: getDefaultConfig(type) },
    };
    setNodes((nds) => [...nds, newNode]);
  }, [setNodes]);

  const updateConfig = (key, value) => {
    setNodes((nds) => nds.map((n) => n.id === selectedNodeId ? 
      { ...n, data: { ...n.data, config: { ...n.data.config, [key]: value } } } : n));
  };

  const handleExport = () => {
    const yaml = buildYaml(nodes, edges);
    setGeneratedYaml(yaml);
    setShowModal(true);
    setCopySuccess(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedYaml);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const selectedNode = nodes.find(n => n.id === selectedNodeId);

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "sans-serif", background: "#f4f7f6" }}>
      {/* SIDEBAR */}
      <div style={{ width: 240, padding: "20px", borderRight: "1px solid #ddd", background: "#fff", zIndex: 10 }}>
        <h3 style={{ margin: "0 0 20px 0", color: "#2c3e50" }}>Camel Designer</h3>
        <div style={{ display: "grid", gap: "10px" }}>
          {["timer", "http", "setHeader", "setProperty", "setBody", "unmarshal", "log", "choice", "split"].map(t => (
            <div key={t} draggable onDragStart={(e) => e.dataTransfer.setData("application/reactflow", t)}
              style={{ padding: "10px", background: theme[t].bg, border: `1px solid ${theme[t].border}`, borderRadius: "6px", cursor: "grab", fontWeight: "500", fontSize: "12px" }}>
              {theme[t].icon} {t.toUpperCase()}
            </div>
          ))}
        </div>
        <button onClick={handleExport} 
          style={{ width: "100%", padding: "12px", marginTop: "30px", background: "#2c3e50", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}>
          📥 EXPORT YAML
        </button>
      </div>

      <div style={{ flex: 1 }}>
        <ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onConnect={onConnect} onDrop={onDrop} onDragOver={(e) => e.preventDefault()} onNodeClick={(_, n) => setSelectedNodeId(n.id)} onPaneClick={() => setSelectedNodeId(null)} fitView>
          <Background variant="dots" gap={20} />
          <Controls />
        </ReactFlow>
      </div>

      <div style={{ width: selectedNodeId ? 320 : 0, transition: "width 0.3s ease", overflow: "hidden", background: "#fff", borderLeft: selectedNodeId ? "1px solid #ddd" : "none" }}>
        {selectedNode && (
          <div style={{ padding: "20px", width: "280px" }}>
            <h4 style={{ marginTop: 0 }}>Configuration</h4>
            <hr style={{ opacity: 0.2 }} />
            <ConfigPanel node={selectedNode} onChange={updateConfig} />
          </div>
        )}
      </div>

      {/* YAML PREVIEW MODAL */}
      {showModal && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", justifyContent: "center", alignItems: "center" }}>
          <div style={{ backgroundColor: "#fff", width: "80%", maxWidth: "800px", borderRadius: "12px", padding: "25px", position: "relative", boxShadow: "0 10px 25px rgba(0,0,0,0.2)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
              <h3 style={{ margin: 0 }}>YAML Preview</h3>
              <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "#999" }}>✕</button>
            </div>
            
            <pre style={{ backgroundColor: "#282c34", color: "#abb2bf", padding: "20px", borderRadius: "8px", overflow: "auto", maxHeight: "400px", fontSize: "13px", lineHeight: "1.5" }}>
              {generatedYaml}
            </pre>

            <div style={{ display: "flex", gap: "10px", marginTop: "20px", justifyContent: "flex-end" }}>
              <button onClick={handleCopy} style={{ padding: "10px 20px", borderRadius: "6px", border: "none", backgroundColor: copySuccess ? "#4caf50" : "#2196f3", color: "white", cursor: "pointer", fontWeight: "bold" }}>
                {copySuccess ? "✓ Copied!" : "📋 Copy to Clipboard"}
              </button>
              <button onClick={() => downloadYaml(generatedYaml)} style={{ padding: "10px 20px", borderRadius: "6px", border: "1px solid #ddd", backgroundColor: "#fff", cursor: "pointer", fontWeight: "bold" }}>
                💾 Download .yaml
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// =====================
// 🛠️ CONFIG PANEL
// =====================
function ConfigPanel({ node, onChange }) {
  const { nodeType, config } = node.data;
  const s = { display: "block", fontSize: "12px", margin: "15px 0 5px", color: "#7f8c8d", fontWeight: "bold" };
  const i = { width: "100%", padding: "10px", border: "1px solid #ccc", borderRadius: "4px", boxSizing: "border-box" };

  return (
    <>
      <label style={s}>Component ID</label>
      <input style={i} value={config.id || ""} onChange={(e) => onChange("id", e.target.value)} />
      
      {nodeType === "setHeader" && (
        <>
          <label style={s}>Header Preset</label>
          <select style={i} value={config.nameType || "CamelHttpMethod"} onChange={(e) => onChange("nameType", e.target.value)}>
             <option value="CamelHttpMethod">HTTP Method</option>
             <option value="Authorization">Authorization</option>
             <option value="Content-Type">Content-Type</option>
             <option value="custom">Custom Header...</option>
          </select>
          {config.nameType === "custom" && <input style={{...i, marginTop: "5px"}} placeholder="Header Name" value={config.customName || ""} onChange={(e) => onChange("customName", e.target.value)} />}
          <label style={s}>Value</label>
          {config.nameType === "CamelHttpMethod" ? (
            <select style={i} value={config.value || "GET"} onChange={(e) => onChange("value", e.target.value)}>
              <option value="GET">GET</option><option value="POST">POST</option><option value="PUT">PUT</option><option value="DELETE">DELETE</option>
            </select>
          ) : <input style={i} value={config.value || ""} onChange={(e) => onChange("value", e.target.value)} />}
        </>
      )}

      {nodeType === "setProperty" && (
        <>
          <label style={s}>Property Name</label>
          <input style={i} placeholder="e.g. originalPayload" value={config.propertyName || ""} onChange={(e) => onChange("propertyName", e.target.value)} />
          <label style={s}>Value (Simple)</label>
          <input style={i} placeholder="${body}" value={config.value || ""} onChange={(e) => onChange("value", e.target.value)} />
        </>
      )}

      {nodeType === "setBody" && (
        <>
          <label style={s}>Body Expression (Simple)</label>
          <textarea style={{...i, fontFamily: 'monospace'}} rows={5} placeholder="${body}" value={config.expression || ""} onChange={(e) => onChange("expression", e.target.value)} />
        </>
      )}

      {nodeType === "log" && <><label style={s}>Message</label><textarea style={i} rows={3} value={config.message || ""} onChange={(e) => onChange("message", e.target.value)} /></>}
      {nodeType === "http" && <><label style={s}>Endpoint URL</label><input style={i} value={config.url || ""} onChange={(e) => onChange("url", e.target.value)} /></>}
      {nodeType === "choice" && <><label style={s}>Condition</label><input style={i} value={config.condition || ""} onChange={(e) => onChange("condition", e.target.value)} /></>}
      {nodeType === "split" && <><label style={s}>Split Expression</label><input style={i} value={config.expression || ""} onChange={(e) => onChange("expression", e.target.value)} /></>}
      {nodeType === "unmarshal" && <><label style={s}>Format</label><select style={i} value={config.format || "json"} onChange={(e) => onChange("format", e.target.value)}><option value="json">JSON</option><option value="csv">CSV</option></select></>}
    </>
  );
}

function getDefaultConfig(type) {
  const id = `${type}-${Math.random().toString(36).slice(-4)}`;
  switch (type) {
    case "setProperty": return { id, propertyName: "myVar", value: "${body}" };
    case "setBody": return { id, expression: "${body}" };
    case "setHeader": return { id, nameType: "CamelHttpMethod", value: "GET" };
    case "timer": return { id, uri: "timer:tick?period=5000" };
    case "http": return { id, url: "https://api.test" };
    case "unmarshal": return { id, format: "json" };
    case "log": return { id, message: "Log: ${body}" };
    case "choice": return { id, condition: "${body} != null" };
    case "split": return { id, expression: "${body}" };
    default: return { id };
  }
}

// =====================
// 🧱 YAML BUILDER
// =====================
function buildYaml(nodes, edges) {
  const startNode = nodes.find(n => !edges.find(e => e.target === n.id));
  const route = {
    route: {
      id: "route-" + Math.floor(Date.now()/1000),
      from: {
        uri: startNode?.data?.config?.uri || "timer:trigger",
        steps: buildSteps(startNode, nodes, edges, new Set())
      }
    }
  };
  return stringifyYaml([route]);
}

function buildSteps(currentNode, nodes, edges, processed) {
  if (!currentNode) return [];
  processed.add(currentNode.id);
  const nextEdges = edges.filter(e => e.source === currentNode.id);
  let steps = [];

  nextEdges.forEach(edge => {
    const nextNode = nodes.find(n => n.id === edge.target);
    if (!nextNode || processed.has(nextNode.id)) return;
    const cfg = nextNode.data.config;
    const type = nextNode.data.nodeType;

    if (type === "split") {
      steps.push({ split: { id: cfg.id, simple: cfg.expression, steps: buildSteps(nextNode, nodes, edges, new Set(processed)) } });
    } else if (type === "choice") {
      const tE = edges.find(e => e.source === nextNode.id && e.label === "true");
      const fE = edges.find(e => e.source === nextNode.id && e.label === "false");
      steps.push({
        choice: {
          id: cfg.id,
          when: [{ simple: cfg.condition, steps: tE ? buildSteps(nodes.find(n => n.id === tE.target), nodes, edges, new Set(processed)) : [] }],
          otherwise: { steps: fE ? buildSteps(nodes.find(n => n.id === fE.target), nodes, edges, new Set(processed)) : [] }
        }
      });
    } else {
      if (type === "setProperty") steps.push({ setProperty: { name: cfg.propertyName, simple: cfg.value } });
      if (type === "setBody") steps.push({ setBody: { id: cfg.id, simple: cfg.expression } });
      if (type === "setHeader") {
        const hName = cfg.nameType === "custom" ? cfg.customName : (cfg.nameType || "CamelHttpMethod");
        steps.push({ setHeader: { name: hName, constant: cfg.value } });
      }
      if (type === "log") steps.push({ log: { id: cfg.id, message: cfg.message } });
      if (type === "http") steps.push({ to: { id: cfg.id, uri: cfg.url } });
      if (type === "unmarshal") steps.push({ unmarshal: { id: cfg.id, [cfg.format || "json"]: { library: "Jackson" } } });
      steps.push(...buildSteps(nextNode, nodes, edges, processed));
    }
  });
  return steps;
}

function stringifyYaml(obj, indent = 0) {
  const s = " ".repeat(indent);
  if (Array.isArray(obj)) return obj.map(v => `${s}- ${stringifyYaml(v, indent + 2).trimStart()}`).join("\n");
  if (obj && typeof obj === "object") {
    return Object.entries(obj).map(([k, v]) => {
      if (v && typeof v === "object") return `${s}${k}:\n${stringifyYaml(v, indent + 2)}`;
      const valStr = String(v);
      const needsQuoting = /[$[\]{}:]/.test(valStr);
      const safeValue = needsQuoting ? `"${valStr.replace(/"/g, '\\"')}"` : valStr;
      return `${s}${k}: ${safeValue}`;
    }).join("\n");
  }
  return String(obj);
}

function downloadYaml(yaml) {
  const blob = new Blob([yaml], { type: "text/yaml" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = `camel-route-${Date.now()}.yaml`; a.click();
}