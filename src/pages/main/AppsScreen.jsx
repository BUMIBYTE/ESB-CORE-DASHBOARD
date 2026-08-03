import React, { useState } from "react";
import {
  Search,
  Plus,
  Upload,
  KeyRound,
  RotateCw,
  Edit2,
  Trash2,
  Copy,
  Eye,
  EyeOff,
  X,
  Sparkles,
  TestTube,
  History,
  LayoutGrid,
  List
} from "lucide-react";

// Dummy Data Awal
const INITIAL_CONNECTIONS = [
  {
    id: "1",
    name: "Kafka - central (HQ)",
    endpoint: "kafka-central:9093",
    auth: "mTLS",
    usedBy: 3,
    expiresIn: "in 90d",
    status: "healthy",
    category: "Messaging",
    connector: "Kafka / Redpanda",
    clientId: "kafka-hq-client-01",
    clientSecret: "secret_kafka_hq_9093",
    tokenUrl: "/oauth2/token",
    scopes: "kafka:read kafka:write",
    usedByRoutes: ["hq-ingest-route", "billing-stream-route", "audit-log-route"]
  },
  {
    id: "2",
    name: "Kafka - edge brokers",
    endpoint: "kafka-edge:9093",
    auth: "mTLS",
    usedBy: 5,
    expiresIn: "in 90d",
    status: "healthy",
    category: "Messaging",
    connector: "Kafka / Redpanda",
    clientId: "kafka-edge-client-02",
    clientSecret: "secret_kafka_edge_9093",
    tokenUrl: "/oauth2/token",
    scopes: "kafka:write",
    usedByRoutes: ["edge-sensor-ingest", "site-sync-route", "fleet-telematics"]
  },
  {
    id: "3",
    name: "MQTT - sensor mesh",
    endpoint: "mqtt://iot.prima.id",
    auth: "JWT",
    usedBy: 2,
    expiresIn: "in 14d",
    expiresTone: "warn",
    status: "healthy",
    category: "Messaging",
    connector: "MQTT Broker",
    clientId: "mqtt-mesh-01",
    clientSecret: "secret_mqtt_mesh_iot",
    tokenUrl: "/jwt/token",
    scopes: "sensor:pub sensor:sub",
    usedByRoutes: ["telemetry-route", "alert-dispatcher"]
  },
  {
    id: "4",
    name: "FMS Dispatch API",
    endpoint: "fms.prima.local/api",
    auth: "OAuth2",
    usedBy: 1,
    expiresIn: "in 32d",
    status: "healthy",
    category: "APIs",
    connector: "REST API",
    clientId: "0oa4f9j2kd91PsQ2x5d7",
    clientSecret: "secret_fms_dispatch_api_key_v2",
    tokenUrl: "/oauth2/token",
    scopes: "api full offline_access",
    usedByRoutes: ["fms-dispatch-ingest"]
  },
  {
    id: "5",
    name: "CMMS / Maintenance API",
    endpoint: "cmms.prima.local/api",
    auth: "OAuth2",
    usedBy: 0,
    expiresIn: "in 45d",
    status: "healthy",
    category: "APIs",
    connector: "REST API",
    clientId: "cmms_client_9921",
    clientSecret: "secret_cmms_maint_key",
    tokenUrl: "/oauth2/token",
    scopes: "maintenance:read",
    usedByRoutes: []
  },
  {
    id: "6",
    name: "GPS Telematics API",
    endpoint: "telematics.prima.id/v2",
    auth: "JWT",
    usedBy: 0,
    expiresIn: "in 21d",
    status: "healthy",
    category: "APIs",
    connector: "REST API",
    clientId: "telematics_jwt_client",
    clientSecret: "secret_gps_telematics_v2",
    tokenUrl: "/v2/token",
    scopes: "telematics:read",
    usedByRoutes: []
  },
  {
    id: "7",
    name: "BMKG Weather API",
    endpoint: "api.bmkg.go.id",
    auth: "API Key",
    usedBy: 0,
    expiresIn: "in 9d",
    expiresTone: "warn",
    status: "warn",
    category: "APIs",
    connector: "REST API",
    clientId: "bmkg_api_user",
    clientSecret: "secret_bmkg_key_2026",
    tokenUrl: "",
    scopes: "weather:read",
    usedByRoutes: []
  },
  {
    id: "8",
    name: "MINERBA One Data",
    endpoint: "minerba.esdm.go.id/api",
    auth: "OAuth2",
    usedBy: 0,
    expiresIn: "in 60d",
    status: "healthy",
    category: "APIs",
    connector: "REST API",
    clientId: "minerba_oauth_client",
    clientSecret: "secret_esdm_minerba_data",
    tokenUrl: "/oauth2/token",
    scopes: "esdm:report",
    usedByRoutes: []
  },
  {
    id: "9",
    name: "Weighbridge DB",
    endpoint: "pg-wb.svc:5432",
    auth: "Vault",
    usedBy: 1,
    expiresIn: "rotates daily",
    expiresTone: "warn",
    status: "healthy",
    category: "Databases",
    connector: "PostgreSQL",
    clientId: "pg_weighbridge_user",
    clientSecret: "vault_secret_pg_wb_5432",
    tokenUrl: "",
    scopes: "db:read db:write",
    usedByRoutes: ["weighbridge-sync-route"]
  },
  {
    id: "10",
    name: "Fuel System DB",
    endpoint: "10.32.7.11:1521",
    auth: "Basic",
    usedBy: 1,
    expiresIn: "in 4d",
    expiresTone: "warn",
    status: "warn",
    category: "Databases",
    connector: "Oracle DB",
    clientId: "fuel_system_db_user",
    clientSecret: "secret_fuel_system_1521",
    tokenUrl: "",
    scopes: "db:read",
    usedByRoutes: ["fuel-reconciliation-route"]
  },
  {
    id: "11",
    name: "SAP PM - IDoc",
    endpoint: "sap-pm.prima.local:3300",
    auth: "SAP RFC",
    usedBy: 1,
    expiresIn: "—",
    status: "healthy",
    category: "ERP",
    connector: "SAP RFC / IDoc",
    clientId: "sap_pm_rfc_user",
    clientSecret: "secret_sap_pm_idoc_3300",
    tokenUrl: "",
    scopes: "sap:pm:all",
    usedByRoutes: ["sap-pm-workorder-sync"]
  },
  {
    id: "12",
    name: "SAP ERP - OData",
    endpoint: "sap-erp.prima.local/odata",
    auth: "OAuth2",
    usedBy: 1,
    expiresIn: "in 60d",
    status: "healthy",
    category: "ERP",
    connector: "SAP OData Service",
    clientId: "sap_odata_oauth_client",
    clientSecret: "secret_sap_erp_odata_key",
    tokenUrl: "/sap/bc/sec/oauth2/token",
    scopes: "odata:read odata:write",
    usedByRoutes: ["sap-finance-journal-post"]
  }
];

export default function AppsAndConnections() {
  const [connections, setConnections] = useState(INITIAL_CONNECTIONS);
  const [selectedId, setSelectedId] = useState("4");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSecret, setShowSecret] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Form State untuk Modal Add/Edit
  const [formData, setFormData] = useState({
    id: "",
    category: "Messaging",
    connector: "Kafka / Redpanda",
    auth: "mTLS",
    name: "",
    endpoint: "",
    clientId: "",
    clientSecret: "",
    tokenUrl: "/oauth2/token",
    scopes: "api full offline_access"
  });

  const selectedConnection = connections.find((c) => c.id === selectedId) || connections[0];

  // Hitung Kategori & Statistik
  const categories = ["All", "ERP", "Databases", "Messaging", "APIs", "Cloud"];
  
  const getCategoryCount = (cat) => {
    if (cat === "All") return connections.length;
    if (cat === "Cloud") return connections.filter((c) => c.category === "Cloud").length;
    return connections.filter((c) => c.category === cat).length;
  };

  const healthyCount = connections.filter((c) => c.status === "healthy").length;
  const expiringCount = connections.filter((c) => c.expiresTone === "warn" || c.expiresIn.includes("rotates") || c.expiresIn.includes("in 4d") || c.expiresIn.includes("in 9d") || c.expiresIn.includes("in 14d")).length;
  const avgUsage = (connections.reduce((acc, curr) => acc + curr.usedBy, 0) / connections.length).toFixed(1);

  // Filter List Connections
  const filteredConnections = connections.filter((conn) => {
    const matchesCategory =
      selectedCategory === "All" || conn.category === selectedCategory;
    const matchesSearch =
      conn.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conn.endpoint.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Handler CRUD
  const handleOpenAddModal = () => {
    setIsEditing(false);
    setFormData({
      id: String(Date.now()),
      category: "Messaging",
      connector: "Kafka / Redpanda",
      auth: "mTLS",
      name: "",
      endpoint: "",
      clientId: `client_${Math.random().toString(36).substring(7)}`,
      clientSecret: `secret_${Math.random().toString(36).substring(7)}`,
      tokenUrl: "/oauth2/token",
      scopes: "api full offline_access"
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = () => {
    if (!selectedConnection) return;
    setIsEditing(true);
    setFormData({
      id: selectedConnection.id,
      category: selectedConnection.category || "APIs",
      connector: selectedConnection.connector || "REST API",
      auth: selectedConnection.auth || "OAuth2",
      name: selectedConnection.name,
      endpoint: selectedConnection.endpoint,
      clientId: selectedConnection.clientId || "",
      clientSecret: selectedConnection.clientSecret || "",
      tokenUrl: selectedConnection.tokenUrl || "/oauth2/token",
      scopes: selectedConnection.scopes || ""
    });
    setIsModalOpen(true);
  };

  const handleDeleteConnection = (id) => {
    if (window.confirm("Are you sure you want to delete this connection?")) {
      const nextConnections = connections.filter((c) => c.id !== id);
      setConnections(nextConnections);
      if (nextConnections.length > 0) {
        setSelectedId(nextConnections[0].id);
      }
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.endpoint) {
      alert("Display name and Host/endpoint are required!");
      return;
    }

    if (isEditing) {
      setConnections(
        connections.map((c) =>
          c.id === formData.id
            ? {
                ...c,
                name: formData.name,
                endpoint: formData.endpoint,
                category: formData.category,
                connector: formData.connector,
                auth: formData.auth,
                clientId: formData.clientId,
                clientSecret: formData.clientSecret,
                tokenUrl: formData.tokenUrl,
                scopes: formData.scopes
              }
            : c
        )
      );
    } else {
      const newConnection = {
        ...formData,
        usedBy: 0,
        expiresIn: "in 90d",
        status: "healthy",
        usedByRoutes: []
      };
      setConnections([newConnection, ...connections]);
      setSelectedId(newConnection.id);
    }
    setIsModalOpen(false);
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-300 font-sans p-6 select-none relative">
      {/* HEADER PAGE */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Apps & Connections</h1>
          <p className="text-xs text-slate-500 mt-0.5">Reusable connection credentials shared across every route</p>
        </div>

        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-800 bg-[#0d121d] hover:bg-[#131b2b] text-xs font-medium text-slate-300 transition-all cursor-pointer">
            <Upload className="w-3.5 h-3.5 text-slate-400" />
            Import OpenAPI
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-800 bg-[#0d121d] hover:bg-[#131b2b] text-xs font-medium text-slate-300 transition-all cursor-pointer">
            <KeyRound className="w-3.5 h-3.5 text-slate-400" />
            Vault
          </button>
          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium shadow-md shadow-blue-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            New connection
          </button>
        </div>
      </div>

      {/* FILTER CATEGORIES & SEARCH BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1">
          {categories.map((cat) => {
            const count = getCategoryCount(cat);
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all shrink-0 cursor-pointer ${
                  isSelected
                    ? "bg-blue-600/20 text-blue-400 border border-blue-500/40"
                    : "bg-[#0d121d] border border-slate-800/80 text-slate-400 hover:text-slate-200 hover:border-slate-700"
                }`}
              >
                {cat} <span className="text-[10px] opacity-70 ml-1">{count}</span>
              </button>
            );
          })}
        </div>

        {/* Search & View Toggle */}
        <div className="flex items-center gap-2">
          <div className="relative w-full md:w-64">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search connections..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0d121d] border border-slate-800/80 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
          <div className="flex items-center bg-[#0d121d] border border-slate-800/80 rounded-lg p-0.5 text-slate-400">
            <button className="p-1 rounded bg-[#161f30] text-blue-400">
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button className="p-1 rounded hover:text-slate-200">
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* TOP SUMMARY STATS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="bg-[#0b0f17] border border-slate-800/80 rounded-xl p-4">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Connections</div>
          <div className="text-2xl font-bold text-white mt-1 font-mono">{connections.length}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">all categories</div>
        </div>

        <div className="bg-[#0b0f17] border border-slate-800/80 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Healthy</div>
            <div className="text-2xl font-bold text-white mt-1 font-mono">
              {healthyCount}/{connections.length}
            </div>
          </div>
          <span className="text-xs font-mono font-medium text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/30">
            {Math.round((healthyCount / connections.length) * 100)}%
          </span>
        </div>

        <div className="bg-[#0b0f17] border border-slate-800/80 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Expiring (30D)</div>
            <div className="text-2xl font-bold text-white mt-1 font-mono">{expiringCount}</div>
          </div>
          <span className="text-[11px] font-medium text-amber-400">rotate soon</span>
        </div>

        <div className="bg-[#0b0f17] border border-slate-800/80 rounded-xl p-4">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Avg Usage</div>
          <div className="text-2xl font-bold text-white mt-1 font-mono">
            {avgUsage} <span className="text-xs font-sans text-slate-500 font-normal">routes/conn</span>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT GRID (GRID CARDS & RIGHT DETAIL PANEL) */}
      <div className="grid grid-cols-12 gap-5">
        {/* CARDS LISTING (LEFT 8 COLS ON DESKTOP) */}
        <div className="col-span-12 lg:col-span-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 auto-rows-max">
          {filteredConnections.length === 0 ? (
            <div className="col-span-full py-12 text-center text-slate-500 text-xs bg-[#0b0f17] border border-slate-800/80 rounded-xl">
              No connection found matching filter.
            </div>
          ) : (
            filteredConnections.map((item) => {
              const isSelected = item.id === selectedId;
              const isWarn = item.status === "warn" || item.expiresTone === "warn";

              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedId(item.id)}
                  className={`bg-[#0b0f17] border rounded-xl p-3.5 transition-all cursor-pointer relative flex flex-col justify-between h-[138px] ${
                    isSelected
                      ? "border-blue-500 bg-[#0e1522] shadow-md shadow-blue-500/10 ring-1 ring-blue-500"
                      : "border-slate-800/80 hover:border-slate-700/80 hover:bg-[#0d121c]"
                  }`}
                >
                  {/* Card Header */}
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#141b28] border border-slate-700/50 flex items-center justify-center font-bold text-blue-400 font-mono shrink-0">
                      {item.name.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1 pr-3">
                      <h3 className="text-xs font-semibold text-white truncate">{item.name}</h3>
                      <p className="text-[10.5px] font-mono text-slate-500 truncate mt-0.5">{item.endpoint}</p>
                    </div>
                    {/* Status Dot */}
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        isWarn ? "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]" : "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]"
                      }`}
                    />
                  </div>

                  {/* Card Footer Metadata */}
                  <div className="grid grid-cols-3 gap-1 pt-3 border-t border-slate-800/50 text-[10px] font-mono text-slate-500">
                    <div>
                      <div className="text-[9px] uppercase tracking-wider text-slate-600">Auth</div>
                      <div className="text-slate-300 truncate mt-0.5 font-semibold">{item.auth}</div>
                    </div>
                    <div>
                      <div className="text-[9px] uppercase tracking-wider text-slate-600">Used By</div>
                      <div className="text-slate-300 truncate mt-0.5 font-semibold">
                        {item.usedBy} route{item.usedBy !== 1 ? "s" : ""}
                      </div>
                    </div>
                    <div>
                      <div className="text-[9px] uppercase tracking-wider text-slate-600">Expires</div>
                      <div className={`truncate mt-0.5 font-semibold ${isWarn ? "text-amber-400" : "text-slate-300"}`}>
                        {item.expiresIn}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* CONNECTION DETAIL PANEL (RIGHT 4 COLS ON DESKTOP) */}
        <div className="col-span-12 lg:col-span-4">
          {selectedConnection && (
            <div className="bg-[#0b0f17] border border-slate-800/80 rounded-xl p-5 shadow-xl sticky top-6 space-y-5">
              {/* Detail Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#141d2d] border border-slate-700/60 flex items-center justify-center font-bold text-blue-400 text-sm font-mono shrink-0">
                    {selectedConnection.name.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-white">{selectedConnection.name}</h2>
                    <p className="text-[11px] font-mono text-slate-500 mt-0.5">{selectedConnection.endpoint}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteConnection(selectedConnection.id)}
                  className="text-slate-600 hover:text-rose-400 p-1 transition-colors cursor-pointer"
                  title="Delete Connection"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Status Badges */}
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Healthy
                </span>
                <span className="text-[10px] font-mono uppercase bg-[#141c2b] text-slate-400 border border-slate-800 px-2 py-0.5 rounded">
                  {selectedConnection.auth}
                </span>
                <span className="text-[10px] font-mono uppercase bg-[#141c2b] text-slate-400 border border-slate-800 px-2 py-0.5 rounded">
                  API
                </span>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2">
                <button className="flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-slate-800/80 bg-[#0e1420] hover:bg-[#131c2d] text-xs text-slate-300 font-medium transition-colors cursor-pointer">
                  <TestTube className="w-3.5 h-3.5 text-slate-400" /> Test
                </button>
                <button className="flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-slate-800/80 bg-[#0e1420] hover:bg-[#131c2d] text-xs text-slate-300 font-medium transition-colors cursor-pointer">
                  <RotateCw className="w-3.5 h-3.5 text-slate-400" /> Rotate
                </button>
                <button className="flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-slate-800/80 bg-[#0e1420] hover:bg-[#131c2d] text-xs text-slate-300 font-medium transition-colors cursor-pointer">
                  <History className="w-3.5 h-3.5 text-slate-400" /> History
                </button>
                <button
                  onClick={handleOpenEditModal}
                  className="flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-slate-800/80 bg-[#0e1420] hover:bg-[#131c2d] text-xs text-slate-300 font-medium transition-colors cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5 text-slate-400" /> Edit
                </button>
              </div>

              {/* Credentials Section */}
              <div className="space-y-3 pt-2">
                <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Credentials</h3>

                <div className="space-y-2.5">
                  <div>
                    <label className="text-[10.5px] font-medium text-slate-500 block mb-1">Client ID</label>
                    <div className="flex items-center bg-[#0e1420] border border-slate-800/80 rounded-lg px-3 py-1.5">
                      <span className="text-xs font-mono text-slate-200 flex-1 truncate">{selectedConnection.clientId || "N/A"}</span>
                      <button onClick={() => handleCopy(selectedConnection.clientId)} className="text-slate-500 hover:text-slate-300 ml-2">
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10.5px] font-medium text-slate-500 block mb-1">Client Secret</label>
                    <div className="flex items-center bg-[#0e1420] border border-slate-800/80 rounded-lg px-3 py-1.5">
                      <span className="text-xs font-mono text-slate-200 flex-1 truncate">
                        {showSecret ? selectedConnection.clientSecret : "••••••••••••••••••••"}
                      </span>
                      <button onClick={() => setShowSecret(!showSecret)} className="text-slate-500 hover:text-slate-300 text-[10px] mr-2">
                        {showSecret ? <EyeOff className="w-3.5 h-3.5" /> : "show"}
                      </button>
                      <button onClick={() => handleCopy(selectedConnection.clientSecret)} className="text-slate-500 hover:text-slate-300">
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10.5px] font-medium text-slate-500 block mb-1">Token URL</label>
                    <div className="flex items-center bg-[#0e1420] border border-slate-800/80 rounded-lg px-3 py-1.5">
                      <span className="text-xs font-mono text-slate-200 flex-1 truncate">{selectedConnection.tokenUrl || "—"}</span>
                      <button onClick={() => handleCopy(selectedConnection.tokenUrl)} className="text-slate-500 hover:text-slate-300 ml-2">
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10.5px] font-medium text-slate-500 block mb-1">Scopes</label>
                    <div className="flex items-center bg-[#0e1420] border border-slate-800/80 rounded-lg px-3 py-1.5">
                      <span className="text-xs font-mono text-slate-200 flex-1 truncate">{selectedConnection.scopes || "—"}</span>
                      <button onClick={() => handleCopy(selectedConnection.scopes)} className="text-slate-500 hover:text-slate-300 ml-2">
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Used by Routes Section */}
              <div className="space-y-2 pt-2 border-t border-slate-800/60">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-slate-400 uppercase tracking-wider">Used by Routes</span>
                  <span className="font-mono text-slate-500">{selectedConnection.usedBy} route</span>
                </div>

                {selectedConnection.usedByRoutes && selectedConnection.usedByRoutes.length > 0 ? (
                  <div className="space-y-1">
                    {selectedConnection.usedByRoutes.map((routeName, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 rounded-lg hover:bg-[#0e1420] text-xs text-blue-400 font-mono transition-colors group cursor-pointer">
                        <span>{routeName}</span>
                        <span className="text-slate-600 group-hover:text-blue-400 transition-colors">→</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-slate-600 italic py-1">Not used by any route yet.</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODAL NEW / EDIT CONNECTION */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-[#0c1017] border border-slate-800/90 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="p-5 flex items-start justify-between border-b border-slate-800/80 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#111823] border border-slate-700/50 flex items-center justify-center text-blue-400">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">
                    {isEditing ? "Edit connection" : "New connection"}
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Reusable across every route — bind it from the Route Builder
                  </p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-slate-300 transition-colors cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleFormSubmit} className="p-5 space-y-4 overflow-y-auto custom-scrollbar flex-1">
              {/* Category selector */}
              <div>
                <label className="text-[11px] font-medium text-slate-300 block mb-1.5">Category</label>
                <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1">
                  {["ERP", "Databases", "Messaging", "APIs", "Cloud"].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setFormData({ ...formData, category: cat })}
                      className={`px-3 py-1 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                        formData.category === cat
                          ? "bg-blue-950/60 border-blue-500/80 text-blue-300"
                          : "bg-[#111722] border-slate-800 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Connector & Auth Row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-medium text-slate-300 block mb-1">Connector</label>
                  <select
                    value={formData.connector}
                    onChange={(e) => setFormData({ ...formData, connector: e.target.value })}
                    className="w-full bg-[#111722] border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="Kafka / Redpanda">Kafka / Redpanda</option>
                    <option value="REST API">REST API</option>
                    <option value="MQTT Broker">MQTT Broker</option>
                    <option value="PostgreSQL">PostgreSQL</option>
                    <option value="SAP RFC / IDoc">SAP RFC / IDoc</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-medium text-slate-300 block mb-1">Auth</label>
                  <select
                    value={formData.auth}
                    onChange={(e) => setFormData({ ...formData, auth: e.target.value })}
                    className="w-full bg-[#111722] border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="mTLS">mTLS</option>
                    <option value="OAuth2">OAuth2</option>
                    <option value="JWT">JWT</option>
                    <option value="API Key">API Key</option>
                    <option value="Basic">Basic</option>
                    <option value="Vault">Vault</option>
                  </select>
                </div>
              </div>

              {/* Display Name */}
              <div>
                <label className="text-[11px] font-medium text-slate-300 block mb-1">Display name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Messaging connection"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-[#111722] border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Host / Endpoint */}
              <div>
                <label className="text-[11px] font-medium text-slate-300 block mb-1">Host / endpoint</label>
                <input
                  type="text"
                  required
                  placeholder="host:port or URL"
                  value={formData.endpoint}
                  onChange={(e) => setFormData({ ...formData, endpoint: e.target.value })}
                  className="w-full bg-[#111722] border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Vault Secret Warning Note */}
              <div className="bg-[#0e1420] border border-slate-800/80 rounded-lg p-3 text-[11px] text-slate-400 flex items-start gap-2">
                <KeyRound className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                <span>
                  Secrets are stored in <strong className="text-slate-200">Vault</strong> and never written to route YAML — routes reference this connection by ID.
                </span>
              </div>

              {/* Footer Modal Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-800/60 shrink-0">
                <button
                  type="button"
                  className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                >
                  <RotateCw className="w-3.5 h-3.5" /> Test connection
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/20 transition-all cursor-pointer"
                  >
                    {isEditing ? "Save changes" : "Create connection"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}