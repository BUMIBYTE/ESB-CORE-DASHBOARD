import React, { useCallback, useState, useEffect } from "react";
import ReactFlow, {
  addEdge,
  Controls,
  Background,
  Handle,
  Position,
  useNodesState,
  useEdgesState,
  MarkerType,
  ReactFlowProvider,
  useReactFlow,
} from "reactflow";
import dagre from "dagre";
import "reactflow/dist/style.css";

// Load js-yaml secara dinamis
const loadJsYaml = () => {
  return new Promise((resolve) => {
    if (window.jsyaml) return resolve(window.jsyaml);
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/js-yaml/4.1.0/js-yaml.min.js";
    script.onload = () => resolve(window.jsyaml);
    document.head.appendChild(script);
  });
};

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
  setProperty: { bg: "#e0f7fa", border: "#00acc1", icon: "🔑" },
  setBody: { bg: "#fff9c4", border: "#fbc02d", icon: "📦" },
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
      minWidth: "180px", fontSize: "12px"
    }}>
      <div style={{ fontWeight: "bold", display: "flex", alignItems: "center", gap: "8px" }}>
        <span>{style.icon}</span> {data.label}
      </div>
      <div style={{ fontSize: "10px", color: "#666", marginTop: "2px", overflow: "hidden", textOverflow: "ellipsis" }}>
        ID: {data.config?.id || 'auto'}
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
    <div style={{ display: "flex", justifyContent: "space-between", marginTop: "8px" }}>
      <b style={{ color: "green", fontSize: "9px" }}>WHEN</b>
      <b style={{ color: "red", fontSize: "9px" }}>OTHERWISE</b>
    </div>
    <Handle type="source" position={Position.Bottom} id="true" style={{ left: "25%", background: "green" }} />
    <Handle type="source" position={Position.Bottom} id="false" style={{ left: "75%", background: "red" }} />
  </BaseNode>
);

const nodeTypes = { default: DefaultNode, choiceNode: ChoiceNode };

// =====================
// 🚀 MAIN DESIGNER
// =====================
function Designer() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const { screenToFlowPosition, fitView } = useReactFlow();

  const [showExport, setShowExport] = useState(false);
  const [showLoad, setShowLoad] = useState(false);
  const [yamlInput, setYamlInput] = useState("");
  const [yamlOutput, setYamlOutput] = useState("");

  useEffect(() => { loadJsYaml(); }, []);

  const onLayout = useCallback((currentNodes, currentEdges) => {
    if (currentNodes.length === 0) return;
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));
    dagreGraph.setGraph({ rankdir: 'TB', nodesep: 70, ranksep: 100 });
    currentNodes.forEach((n) => dagreGraph.setNode(n.id, { width: 200, height: 100 }));
    currentEdges.forEach((e) => dagreGraph.setEdge(e.source, e.target));
    dagre.layout(dagreGraph);
    const layouted = currentNodes.map((n) => {
      const pos = dagreGraph.node(n.id);
      return { ...n, position: { x: pos.x - 100, y: pos.y - 50 } };
    });
    setNodes(layouted);
    setEdges(currentEdges);
    setTimeout(() => fitView({ duration: 800 }), 100);
  }, [setNodes, setEdges, fitView]);

  const handleImportYaml = async () => {
    const jsyaml = await loadJsYaml();
    try {
      const doc = jsyaml.load(yamlInput);
      const route = Array.isArray(doc) ? (doc[0].route || doc[0]) : (doc.route || doc);
      let newNodes = [];
      let newEdges = [];

      const startId = `from_${Date.now()}`;
      newNodes.push({
        id: startId, type: 'default', position: { x: 0, y: 0 },
        data: {
          label: 'START',
          nodeType: 'timer',
          config: {
            id: route.id || startId,
            uri: route.from.uri,
            parameters: route.from.parameters
          }
        }
      });

      const parseSteps = (steps, parentId, sourceHandle = null) => {
        let prevId = parentId;
        let prevHandle = sourceHandle;

        steps.forEach((step) => {
          const type = Object.keys(step)[0];
          const rawConfig = step[type];
          const id = rawConfig.id || `${type}_${Math.random().toString(36).substr(2, 5)}`;

          let nodeType = type === 'to' ? 'http' : type;
          let finalConfig = { ...rawConfig, id };

          if (type === 'choice' && rawConfig.when) {
            finalConfig.condition = rawConfig.when[0].simple;
          }

          newNodes.push({
            id, type: type === 'choice' ? 'choiceNode' : 'default',
            position: { x: 0, y: 0 },
            data: { label: nodeType.toUpperCase(), nodeType, config: finalConfig }
          });

          newEdges.push({
            id: `e_${prevId}_${id}`, source: prevId, target: id, sourceHandle: prevHandle,
            label: prevHandle === "true" ? "WHEN" : (prevHandle === "false" ? "OTHERWISE" : ""),
            animated: true, markerEnd: { type: MarkerType.ArrowClosed }
          });

          if (type === 'choice') {
            if (rawConfig.when && rawConfig.when[0].steps) parseSteps(rawConfig.when[0].steps, id, "true");
            if (rawConfig.otherwise && rawConfig.otherwise.steps) parseSteps(rawConfig.otherwise.steps, id, "false");
          } else if (type === 'split' && rawConfig.steps) {
            parseSteps(rawConfig.steps, id);
          }

          prevId = id;
          prevHandle = null;
        });
      };

      if (route.from.steps) parseSteps(route.from.steps, startId);
      onLayout(newNodes, newEdges);
      setShowLoad(false);
    } catch (e) { console.error(e); alert("Gagal import! Pastikan format YAML Camel bener."); }
  };

  const handleExport = async () => {
    const jsyaml = await loadJsYaml();
    const yamlData = buildYamlStructure(nodes, edges);
    // Kita bungkus dalam Array agar hasilnya diawali tanda dash "-"
    setYamlOutput(jsyaml.dump([yamlData], { noRefs: true, lineWidth: -1, quotingType: '"' }));
    setShowExport(true);
  };

  return (
    <div style={{ display: "flex", height: "100vh", width: "100vw", background: "#f0f2f5" }}>
      <div style={{ width: 280, padding: "20px", background: "#fff", borderRight: "1px solid #ddd", display: "flex", flexDirection: "column", zIndex: 10 }}>
        <h2 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "20px" }}>ESB Designer v4</h2>
        <div style={{ flexGrow: 1, overflowY: "auto", display: "grid", gap: "10px", paddingRight: "5px" }}>
          {Object.keys(theme).filter(t => t !== 'default').map(t => (
            <div key={t} draggable onDragStart={(e) => e.dataTransfer.setData("application/reactflow", t)}
              style={{ padding: "12px", background: theme[t].bg, border: `1px solid ${theme[t].border}`, borderRadius: "8px", cursor: "grab", fontSize: "12px", fontWeight: "600" }}>
              {theme[t].icon} {t.toUpperCase()}
            </div>
          ))}
        </div>
        <div style={{ marginTop: "20px", display: "grid", gap: "10px" }}>
          <button onClick={() => onLayout(nodes, edges)} style={{ padding: "10px", cursor: "pointer", borderRadius: "6px", border: "1px solid #ccc", background: "#fff" }}>🪄 Auto Layout</button>
          <button onClick={() => setShowLoad(true)} style={{ padding: "10px", cursor: "pointer", borderRadius: "6px", border: "1px solid #2196f3", color: "#2196f3", background: "#fff" }}>📂 Import YAML</button>
          <button onClick={handleExport} style={{ padding: "12px", cursor: "pointer", borderRadius: "6px", border: "none", background: "#1a1a1a", color: "#fff", fontWeight: "bold" }}>📥 Export YAML</button>
        </div>
      </div>

      <div style={{ flex: 1, position: "relative" }}>
        <ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes}
          onNodesChange={onNodesChange} onEdgesChange={onEdgesChange}
          deleteKeyCode={["Backspace", "Delete"]}
          onConnect={(p) => {
            const label = p.sourceHandle === "true" ? "WHEN" : (p.sourceHandle === "false" ? "OTHERWISE" : "");
            setEdges(eds => addEdge({ ...p, label, animated: true, markerEnd: { type: MarkerType.ArrowClosed } }, eds))
          }}
          onDrop={(e) => {
            e.preventDefault();
            const type = e.dataTransfer.getData("application/reactflow");
            const pos = screenToFlowPosition({ x: e.clientX, y: e.clientY });
            const id = `${type}_${Date.now()}`;
            setNodes(nds => [...nds, { id, type: type === 'choice' ? 'choiceNode' : 'default', position: pos, data: { label: type.toUpperCase(), nodeType: type, config: getDefaultConfig(type, id) } }]);
          }}
          onDragOver={(e) => e.preventDefault()} onNodeClick={(_, n) => setSelectedNodeId(n.id)} onPaneClick={() => setSelectedNodeId(null)} fitView>
          <Background variant="dots" gap={20} />
          <Controls />
        </ReactFlow>
      </div>

      {selectedNodeId && (
        <div style={{ width: 350, background: "#fff", borderLeft: "1px solid #ddd", padding: "20px", zIndex: 10, overflowY: "auto" }}>
          <h3 style={{ marginTop: 0, fontSize: "16px" }}>Properties</h3>
          <ConfigPanel node={nodes.find(n => n.id === selectedNodeId)} onChange={(k, v) => setNodes(nds => nds.map(n => n.id === selectedNodeId ? { ...n, data: { ...n.data, config: { ...n.data.config, [k]: v } } } : n))} />
        </div>
      )}

      {showLoad && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 9999, display: "flex", justifyContent: "center", alignItems: "center" }}>
          <div style={{ background: "#fff", padding: "25px", borderRadius: "12px", width: "700px" }}>
            <h3>Paste Camel YAML</h3>
            <textarea style={{ width: "100%", height: "400px", fontFamily: "monospace", padding: "10px", fontSize: "12px", border: "1px solid #ddd" }} value={yamlInput} onChange={(e) => setYamlInput(e.target.value)} />
            <div style={{ marginTop: "15px", textAlign: "right" }}>
              <button onClick={() => setShowLoad(false)} style={{ marginRight: "10px", padding: "8px 15px", cursor: "pointer", border: "none", background: "#eee" }}>Cancel</button>
              <button onClick={handleImportYaml} style={{ padding: "8px 20px", background: "#2196f3", color: "#fff", border: "none", borderRadius: "4px", fontWeight: "bold" }}>Generate Flow</button>
            </div>
          </div>
        </div>
      )}

      {showExport && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 9999, display: "flex", justifyContent: "center", alignItems: "center" }}>
          <div style={{ background: "#fff", padding: "25px", borderRadius: "12px", width: "800px", position: "relative" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
              <h3 style={{ margin: 0 }}>Export Result</h3>
              <button onClick={() => setShowExport(false)} style={{ border: "none", background: "none", fontSize: "20px", cursor: "pointer" }}>✕</button>
            </div>

            {/* Gunakan ID agar mudah diseleksi untuk fallback */}
            <pre id="yaml-output" style={{ background: "#282c34", color: "#abb2bf", padding: "15px", borderRadius: "6px", overflow: "auto", maxHeight: "500px", fontSize: "12px", whiteSpace: "pre-wrap" }}>
              {yamlOutput}
            </pre>

            <button
              onClick={() => {
                if (navigator.clipboard && navigator.clipboard.writeText) {
                  // Cara Modern (HTTPS/Localhost)
                  navigator.clipboard.writeText(yamlOutput)
                    .then(() => alert("Copied to clipboard!"))
                    .catch(() => alert("Failed to copy. Please select and copy manually."));
                } else {
                  // Cara Fallback (Untuk non-HTTPS/Browser lama)
                  const textArea = document.createElement("textarea");
                  textArea.value = yamlOutput;
                  document.body.appendChild(textArea);
                  textArea.select();
                  try {
                    document.execCommand('copy');
                    alert("Copied to clipboard (Fallback)! balance");
                  } catch (err) {
                    alert("Manual copy required.");
                  }
                  document.body.removeChild(textArea);
                }
              }}
              style={{ marginTop: "15px", width: "100%", padding: "12px", background: "#2196f3", color: "#fff", border: "none", borderRadius: "6px", fontWeight: "bold", cursor: "pointer" }}
            >
              📋 Copy to Clipboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// =====================
// 🛠️ LOGIC FIXES
// =====================
function ConfigPanel({ node, onChange }) {
  if (!node) return null;
  const { nodeType, config } = node.data;
  const iStyle = { width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc", marginBottom: "10px", fontSize: "13px" };
  const tStyle = { ...iStyle, fontFamily: 'monospace', height: '80px' };
  const lStyle = { display: "block", fontSize: "11px", fontWeight: "bold", marginBottom: "4px", color: "#666" };

  return (
    <div>
      <label style={lStyle}>Custom ID</label><input style={iStyle} value={config.id || ""} onChange={(e) => onChange("id", e.target.value)} />
      {nodeType === "timer" && (
        <>
          <label style={lStyle}>URI (ex: timer:tick?period=5000)</label>
          <input style={iStyle} value={config.uri || ""} onChange={(e) => onChange("uri", e.target.value)} />
        </>
      )}
      {nodeType === "log" && <><label style={lStyle}>Message</label><textarea style={tStyle} value={config.message || ""} onChange={(e) => onChange("message", e.target.value)} /></>}
      {nodeType === "http" && <><label style={lStyle}>Target URI</label><input style={iStyle} value={config.uri || ""} onChange={(e) => onChange("uri", e.target.value)} /></>}
      {nodeType === "choice" && <><label style={lStyle}>Simple Condition</label><input style={iStyle} value={config.condition || ""} onChange={(e) => onChange("condition", e.target.value)} /></>}
      {nodeType === "split" && <><label style={lStyle}>Simple Expression</label><input style={iStyle} value={config.simple || ""} onChange={(e) => onChange("simple", e.target.value)} /></>}
      {nodeType === "setProperty" && <><label style={lStyle}>Property Name</label><input style={iStyle} value={config.name || ""} onChange={(e) => onChange("name", e.target.value)} /><label style={lStyle}>Value (Simple)</label><input style={iStyle} value={config.simple || ""} onChange={(e) => onChange("simple", e.target.value)} /></>}
      {nodeType === "setHeader" && <><label style={lStyle}>Header Name</label><input style={iStyle} value={config.name || ""} onChange={(e) => onChange("name", e.target.value)} /><label style={lStyle}>Value (Simple/Constant)</label><input style={iStyle} value={config.simple || config.constant || ""} onChange={(e) => onChange("simple", e.target.value)} /></>}
      {nodeType === "setBody" && <><label style={lStyle}>Body (Simple)</label><textarea style={tStyle} value={config.simple || ""} onChange={(e) => onChange("simple", e.target.value)} /></>}
    </div>
  );
}

function getDefaultConfig(type, id) {
  const base = { id };
  if (type === "timer") return { ...base, uri: "timer:tick?period=5000" };
  if (type === "choice") return { ...base, condition: "${body} != null" };
  if (type === "split") return { ...base, simple: "${body}" };
  if (type === "setProperty") return { ...base, name: "myProp", simple: "${body}" };
  return base;
}

function buildYamlStructure(nodes, edges) {
  const startNode = nodes.find(n => !edges.find(e => e.target === n.id)) || nodes[0];
  if (!startNode) return {};

  const processNodeSteps = (nodeId, processed) => {
    const n = nodes.find(node => node.id === nodeId);
    if (!n || processed.has(nodeId)) return [];
    processed.add(nodeId);

    const type = n.data.nodeType;
    const cfg = n.data.config;
    let currentStep = {};

    // Mapping properties
    if (type === 'log') currentStep.log = { id: cfg.id, message: cfg.message };
    else if (type === 'http') currentStep.to = { id: cfg.id, uri: cfg.uri };
    else if (type === 'setHeader') currentStep.setHeader = { id: cfg.id, name: cfg.name, simple: cfg.simple || cfg.constant };
    else if (type === 'setProperty') currentStep.setProperty = { id: cfg.id, name: cfg.name, simple: cfg.simple };
    else if (type === 'setBody') currentStep.setBody = { id: cfg.id, simple: cfg.simple };
    else if (type === 'unmarshal') currentStep.unmarshal = { id: cfg.id, json: { library: 'Jackson' } };
    else if (type === 'choice') {
      const tE = edges.find(e => e.source === n.id && e.sourceHandle === "true");
      const fE = edges.find(e => e.source === n.id && e.sourceHandle === "false");
      currentStep.choice = {
        id: cfg.id,
        when: [{ simple: cfg.condition, steps: tE ? processNodeSteps(tE.target, new Set(processed)) : [] }],
        otherwise: { steps: fE ? processNodeSteps(fE.target, new Set(processed)) : [] }
      };
      return [currentStep];
    }
    else if (type === 'split') {
      const nextE = edges.find(e => e.source === n.id);
      currentStep.split = { id: cfg.id, simple: cfg.simple, steps: nextE ? processNodeSteps(nextE.target, new Set(processed)) : [] };
      return [currentStep];
    }

    const nextEdge = edges.find(e => e.source === nodeId && !e.sourceHandle);
    const results = [currentStep];
    if (nextEdge) results.push(...processNodeSteps(nextEdge.target, processed));
    return results;
  };

  const routeObj = {
    id: startNode.data.config.id || "route-" + Date.now(),
    from: {
      uri: startNode.data.config.uri,
      steps: processNodeSteps(edges.find(e => e.source === startNode.id)?.target, new Set([startNode.id]))
    }
  };

  // Jika ada parameters di node timer, kita masukkan kembali ke YAML
  if (startNode.data.config.parameters) {
    routeObj.from.parameters = startNode.data.config.parameters;
  }

  return { route: routeObj };
}

export default function App() {
  return (
    <ReactFlowProvider>
      <Designer />
    </ReactFlowProvider>
  );
}