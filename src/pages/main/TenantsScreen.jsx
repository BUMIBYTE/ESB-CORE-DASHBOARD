import React, { useState, useEffect } from "react";
import {
  Users,
  Plus,
  Shield,
  Pencil,
  Trash2,
  X,
  ArrowRight,
  Info,
  Sparkles,
  ChevronDown
} from "lucide-react";
import api from "../../api/axios";

const DEFAULT_FORM_STATE = {
  id: null,
  name: "",
  code: "",
  slug: "",
  plan: "Pro",
  env: "Prod",
  region: "ap-southeast-3 (Jakarta)",
  users: 1,
  accent: "Accent",
  description: "",
};

export default function TenantsPage() {
  // --- STATES ---
  const [tenants, setTenants] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create"); // 'create' | 'edit'
  const [formData, setFormData] = useState(DEFAULT_FORM_STATE);

  // --- HANDLERS FOR MODAL ---
  const handleOpenCreateModal = () => {
    setModalMode("create");
    setFormData(DEFAULT_FORM_STATE);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (tenant) => {
    setModalMode("edit");
    setFormData({
      id: tenant.id,
      name: tenant.name,
      code: tenant.code,
      slug: tenant.slug || tenant.name.toLowerCase().replace(/\s+/g, "-"),
      plan: tenant.plan === "ENTERPRISE" ? "Enterprise" : tenant.plan === "PRO" ? "Pro" : "Trial",
      env: tenant.env,
      region: tenant.region || "ap-southeast-3 (Jakarta)",
      users: tenant.users,
      accent: tenant.accent || "Accent",
      description: tenant.description || "",
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData(DEFAULT_FORM_STATE);
  };

  // --- SAVE / SUBMIT TENANT ---
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.code) {
      alert("Tenant Name and Code are required!");
      return;
    }

    const newTenant = {
      name: formData.name,
      code: formData.code.toUpperCase().slice(0, 2),
      slug: formData.name.toLowerCase().replace(/\s+/g, "-"),
      isSuperAdmin: false,
      isActive: false,
      description: formData.description,
      plan: formData.plan.toUpperCase(),
      env: formData.env,
      region: formData.region,
      users: Number(formData.users) || 1,
      accent: formData.accent,
    };
    if (modalMode === "create") {
      await api.post(`/tenant`, newTenant, { headers: { 'Content-Type': 'application/json' } });
      fetchTenants(); // Refresh the tenants list after creation
    } else {
      // Edit Mode
      await api.put(`/tenant/${formData.id}`, newTenant, { headers: { 'Content-Type': 'application/json' } });
      fetchTenants(); // Refresh the tenants list after update
    }

    handleCloseModal();
  };

  // --- DELETE TENANT ---
  const handleDeleteTenant = async (id) => {
    if (window.confirm("Are you sure you want to delete this tenant?")) {
      await api.delete(`/tenant/${id}`);
      fetchTenants(); // Refresh the tenants list after deletion
    }
  };

  // Utility badge styling helper
  const getBadgeStyle = (accent) => {
    switch (accent) {
      case "Accent 2":
        return "bg-cyan-950/80 border-cyan-500/40 text-cyan-300";
      case "Violet":
        return "bg-purple-950/80 border-purple-500/40 text-purple-300";
      case "Amber":
        return "bg-amber-950/80 border-amber-500/40 text-amber-300";
      default:
        return "bg-blue-950/80 border-blue-500/40 text-blue-300";
    }
  };

  const fetchTenants = async () => {
    try {
      const response = await api.get('/tenant');
      setTenants(response.data.data);
    } catch (error) {
      console.error("Error fetching tenants:", error);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  // Total Metrics Calculation
  const totalUsers = tenants.reduce((acc, curr) => acc + curr.users, 0);
  const totalRoutes = tenants.reduce((acc, curr) => acc + curr.routes, 0);

  return (
    <div className="min-h-screen bg-[#06090e] text-slate-300 p-8 font-sans select-none relative">
      {/* PAGE HEADER */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-white tracking-tight">Tenants</h1>
          <p className="text-xs text-slate-500 mt-1">
            Multi-tenant isolation, quotas and billing — metrics derived from the live route catalog
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg border border-slate-800 bg-[#0c1017] hover:bg-[#121824] text-xs font-medium text-slate-300 transition-colors">
            <Shield className="w-3.5 h-3.5 text-slate-400" />
            SSO config
          </button>
          <button
            onClick={handleOpenCreateModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium shadow-md shadow-blue-600/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            Create tenant
          </button>
        </div>
      </div>

      {/* METRICS STATS CARDS */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-[#0b0f17] border border-slate-800/80 rounded-xl p-4">
          <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">
            TENANTS
          </span>
          <div className="text-3xl font-bold text-white mt-1">{tenants.length - 1}</div>
          <span className="text-[10px] text-slate-500 mt-2 block">excl. group / super-admin</span>
        </div>

        <div className="bg-[#0b0f17] border border-slate-800/80 rounded-xl p-4">
          <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">
            ACTIVE USERS
          </span>
          <div className="text-3xl font-bold text-white mt-1">{totalUsers}</div>
        </div>

        <div className="bg-[#0b0f17] border border-slate-800/80 rounded-xl p-4">
          <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">
            ROUTES
          </span>
          <div className="text-3xl font-bold text-white mt-1">{totalRoutes}</div>
          <span className="text-[10px] text-slate-500 mt-2 block">across all tenants</span>
        </div>

        <div className="bg-[#0b0f17] border border-slate-800/80 rounded-xl p-4 relative overflow-hidden">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">
              THROUGHPUT · LIVE
            </span>
            <span className="text-[10px] font-semibold text-emerald-500">all tenants</span>
          </div>
          <div className="text-3xl font-bold text-white mt-1">
            2,694 <span className="text-xs font-normal text-slate-500">msg/s</span>
          </div>
        </div>
      </div>

      {/* TENANTS TABLE */}
      <div className="bg-[#0b0f17] border border-slate-800/80 rounded-xl overflow-hidden shadow-xl">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-800/80 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              <th className="py-3 px-4">TENANT</th>
              <th className="py-3 px-4">PLAN</th>
              <th className="py-3 px-4">ENV</th>
              <th className="py-3 px-4">USERS</th>
              <th className="py-3 px-4">ROUTES</th>
              <th className="py-3 px-4">INSTANCES</th>
              <th className="py-3 px-4">CONNS</th>
              <th className="py-3 px-4">THROUGHPUT</th>
              <th className="py-3 px-4 text-right">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50 text-slate-300">
            {tenants.map((item) => (
              <tr key={item.id} className="hover:bg-[#101622]/60 transition-colors group">
                {/* TENANT INFO */}
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-7 h-7 rounded-md border flex items-center justify-center font-bold text-xs shrink-0 ${getBadgeStyle(
                        item.accent
                      )}`}
                    >
                      {item.code}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white">{item.name}</span>
                        {item.isSuperAdmin && (
                          <span className="bg-purple-950/60 border border-purple-700/50 text-purple-300 text-[9px] font-mono px-1.5 py-0.2 rounded font-semibold uppercase">
                            SUPER-ADMIN
                          </span>
                        )}
                        {item.isActive && (
                          <span className="bg-blue-950/60 border border-blue-700/50 text-blue-300 text-[9px] font-mono px-1.5 py-0.2 rounded font-semibold uppercase">
                            ACTIVE
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 truncate max-w-xs">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </td>

                {/* PLAN */}
                <td className="py-3.5 px-4 font-mono">
                  <span
                    className={`px-2 py-0.5 rounded border text-[10px] font-semibold tracking-wide ${item.plan === "ENTERPRISE"
                      ? "bg-slate-900 border-slate-700 text-purple-300"
                      : item.plan === "PRO"
                        ? "bg-slate-900 border-slate-700 text-blue-300"
                        : "bg-slate-900 border-slate-700 text-slate-400"
                      }`}
                  >
                    {item.plan}
                  </span>
                </td>

                {/* ENV */}
                <td className="py-3.5 px-4 font-mono">
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold border tracking-wider uppercase ${item.env?.toUpperCase() === "PROD"
                      ? "bg-emerald-950/40 border-emerald-800/40 text-emerald-400"
                      : "bg-amber-950/40 border-amber-800/40 text-amber-400"
                      }`}
                  >
                    {item.env}
                  </span>
                </td>

                {/* METRICS COLUMNS */}
                <td className="py-3.5 px-4 font-mono text-slate-200">{item.users}</td>
                <td className="py-3.5 px-4 font-mono text-slate-200">{item.routes}</td>
                <td className="py-3.5 px-4 font-mono text-slate-200">{item.instances}</td>
                <td className="py-3.5 px-4 font-mono text-slate-200">{item.conns}</td>
                <td className="py-3.5 px-4 font-mono text-slate-200">{item.throughput}</td>

                {/* ACTIONS */}
                <td className="py-3.5 px-4 text-right">
                  <div className="flex items-center justify-end gap-2 text-slate-500">
                    {/* <button className="p-1 hover:text-slate-300 transition-colors">
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button> */}
                    <button
                      onClick={() => handleOpenEditModal(item)}
                      className="p-1 hover:text-blue-400 transition-colors"
                      title="Edit Tenant"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteTenant(item.id)}
                      className="p-1 hover:text-rose-400 transition-colors"
                      title="Delete Tenant"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ========================================================================= */}
      {/* CREATE / EDIT TENANT MODAL */}
      {/* ========================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-[#0b1017] border border-slate-800/90 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            {/* MODAL HEADER */}
            <div className="p-5 flex items-start justify-between border-b border-slate-800/80">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#111823] border border-slate-700/50 flex items-center justify-center text-slate-300">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">
                    {modalMode === "create" ? "Create tenant" : "Edit tenant"}
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {modalMode === "create"
                      ? "A new isolated workspace with its own routes, quotas and members"
                      : formData.slug}
                  </p>
                </div>
              </div>
              <button
                onClick={handleCloseModal}
                className="text-slate-500 hover:text-slate-300 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* MODAL FORM BODY */}
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {/* ROW 1: Tenant name & Code */}
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2 space-y-1">
                  <label className="text-[11px] font-medium text-slate-300">Tenant name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Prima Smelting"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-[#111722] border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-300">Code</label>
                  <input
                    type="text"
                    required
                    maxLength={2}
                    placeholder="PR"
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({ ...formData, code: e.target.value.toUpperCase() })
                    }
                    className="w-full bg-[#111722] border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder:text-slate-600 uppercase focus:outline-none focus:border-blue-500 font-mono"
                  />
                  <span className="text-[9px] text-slate-500 block">2 letters</span>
                </div>
              </div>

              {/* ROW 2: Plan & Environment */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-300">Plan</label>
                  <div className="relative">
                    <select
                      value={formData.plan}
                      onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
                      className="w-full bg-[#111722] border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 appearance-none focus:outline-none focus:border-blue-500 pr-8"
                    >
                      <option value="Pro">Pro</option>
                      <option value="Enterprise">Enterprise</option>
                      <option value="Trial">Trial</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-2.5 pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-300">Environment</label>
                  <div className="flex bg-[#111722] p-1 rounded-lg border border-slate-800">
                    {["Dev", "Staging", "Prod"].map((envOpt) => (
                      <button
                        type="button"
                        key={envOpt}
                        onClick={() => setFormData({ ...formData, env: envOpt })}
                        className={`flex-1 py-1 text-[11px] font-medium rounded-md transition-all ${formData.env === envOpt
                          ? "bg-[#1c2638] text-white border border-slate-700/80 shadow-xs"
                          : "text-slate-400 hover:text-slate-200"
                          }`}
                      >
                        {envOpt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* ROW 3: Region & Seats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-300">Region</label>
                  <div className="relative">
                    <select
                      value={formData.region}
                      onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                      className="w-full bg-[#111722] border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 appearance-none focus:outline-none focus:border-blue-500 pr-8"
                    >
                      <option value="ap-southeast-3 (Jakarta)">ap-southeast-3 (Jakarta)</option>
                      <option value="ap-southeast-1 (Singapore)">ap-southeast-1 (Singapore)</option>
                      <option value="us-east-1 (N. Virginia)">us-east-1 (N. Virginia)</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-2.5 pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-300">Seats / users</label>
                  <input
                    type="number"
                    min={1}
                    value={formData.users}
                    onChange={(e) => setFormData({ ...formData, users: e.target.value })}
                    className="w-full bg-[#111722] border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              </div>

              {/* ROW 4: Accent colour */}
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-300">Accent colour</label>
                <div className="flex gap-2">
                  {[
                    { name: "Accent", bg: "bg-blue-500" },
                    { name: "Accent 2", bg: "bg-cyan-400" },
                    { name: "Violet", bg: "bg-purple-500" },
                    { name: "Amber", bg: "bg-amber-500" },
                  ].map((color) => {
                    const isSelected = formData.accent === color.name;
                    return (
                      <button
                        type="button"
                        key={color.name}
                        onClick={() => setFormData({ ...formData, accent: color.name })}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${isSelected
                          ? "bg-[#162030] border-slate-500 text-white"
                          : "bg-[#111722] border-slate-800 text-slate-400 hover:text-slate-200"
                          }`}
                      >
                        <span className={`w-2.5 h-2.5 rounded-full ${color.bg}`} />
                        <span>{color.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ROW 5: Description */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-[11px] font-medium text-slate-300">Description</label>
                  <span className="text-[9px] text-slate-500 font-mono">OPTIONAL</span>
                </div>
                <textarea
                  rows={2}
                  placeholder="What integrations does this tenant own?"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-[#111722] border border-slate-800 rounded-lg p-3 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              {/* INFO BOX */}
              <div className="p-3 bg-[#0c121c] border border-slate-800/80 rounded-xl flex items-start gap-2.5 text-[11px] text-slate-400">
                <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <p className="leading-snug">
                  Routes, instances and connections are assigned per route. A new tenant starts
                  empty — create routes in the Route Builder and tag them to this tenant.
                </p>
              </div>

              {/* FOOTER BUTTONS */}
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800/60">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/20 transition-all"
                >
                  {modalMode === "create" ? "Create tenant" : "Save changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}