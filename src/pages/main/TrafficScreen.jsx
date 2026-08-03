import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';

/* ==========================================================================
   CSS Themes & Variables (Background #090D14 Compliant)
   ========================================================================== */
const themeStyles = `
  :root {
    --ps-bg: #090D14;
    --ps-bg-2: #0F172A;
    --ps-panel-2: #1E293B;
    --ps-line: #334155;
    --ps-fg: #F8FAFC;
    --ps-mut: #94A3B8;
    --ps-mutb: #64748B;

    --ps-accent: #38BDF8;   /* Cyan / Light Blue */
    --ps-accent-2: #818CF8; /* Indigo */
    --ps-violet: #C084FC;   /* Purple */
    --ps-ok: #4ADE80;       /* Emerald Green */
    --ps-warn: #FBBF24;     /* Amber Yellow */
    --ps-error: #F87171;    /* Rose Red */
  }

  .bg-ps-main { background-color: var(--ps-bg); }
  .bg-panel2 { background-color: rgba(30, 41, 59, 0.7); }
  .bg-bg2 { background-color: rgba(15, 23, 42, 0.8); }
  .border-line { border-color: rgba(51, 65, 85, 0.8); }
  .text-fg { color: var(--ps-fg); }
  .text-mut { color: var(--ps-mut); }
  .text-mutb { color: var(--ps-mutb); }
  .text-acc { color: var(--ps-accent); }
  .text-acc2 { color: var(--ps-accent-2); }
  .text-vio { color: var(--ps-violet); }
  .text-ok { color: var(--ps-ok); }
  .text-warn { color: var(--ps-warn); }
  .text-err { color: var(--ps-error); }
  .bg-acc { background-color: var(--ps-accent); }
  .bg-ok { background-color: var(--ps-ok); }
  .bg-warn { background-color: var(--ps-warn); }
  .bg-err { background-color: var(--ps-error); }

  /* Custom Scrollbar for Logs & Payload Code */
  .ps-scroll::-webkit-scrollbar { width: 6px; height: 6px; }
  .ps-scroll::-webkit-scrollbar-track { background: rgba(15, 23, 42, 0.6); }
  .ps-scroll::-webkit-scrollbar-thumb { background: #334155; border-radius: 3px; }
  .ps-scroll::-webkit-scrollbar-thumb:hover { background: #475569; }
`;

if (typeof document !== 'undefined' && !document.getElementById('ps-theme-vars-monitor')) {
  const styleEl = document.createElement('style');
  styleEl.id = 'ps-theme-vars-monitor';
  styleEl.innerHTML = themeStyles;
  document.head.appendChild(styleEl);
}

/* ==========================================================================
   Fallback Icons & UI Components
   ========================================================================== */
const IconFallback = {
  download: () => <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>,
  filter: () => <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/></svg>,
  copy: () => <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>,
  refresh: () => <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>,
  send: () => <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>,
  bot: () => <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>,
  kafka: ({ className = "w-4 h-4" }) => <span className={`font-mono font-bold text-sky-400 ${className}`}>K</span>
};

const Icon = window.Icon ? { ...IconFallback, ...window.Icon } : IconFallback;

const SectionH = window.SectionH || (({ title, subtitle, children }) => (
  <div className="flex items-center justify-between mb-4">
    <div>
      <h2 className="text-lg font-semibold text-slate-100">{title}</h2>
      {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
    </div>
    <div className="flex items-center gap-2">{children}</div>
  </div>
));

const Pill = window.Pill || (({ children, tone, dot }) => (
  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
    tone === 'ok' ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-400' : 
    tone === 'warn' ? 'bg-amber-950/50 border-amber-500/40 text-amber-400' : 
    tone === 'err' ? 'bg-rose-950/50 border-rose-500/40 text-rose-400' : 
    tone === 'accent' ? 'bg-sky-950/50 border-sky-500/40 text-sky-400' :
    'bg-slate-800/80 border-slate-700 text-slate-300'
  }`}>
    {dot && <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />}
    {children}
  </span>
));

const Btn = window.Btn || (({ children, onClick, kind, size, icon }) => {
  const sizeClasses = size === 'xs' ? 'px-2 py-1 text-[11px]' : size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-xs';
  const kindClasses = kind === 'ghost' 
    ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border-transparent' 
    : kind === 'outline'
    ? 'bg-slate-900/60 hover:bg-slate-800/80 border-slate-700 text-slate-200'
    : 'bg-sky-600 hover:bg-sky-500 border-sky-400 text-white shadow-md shadow-sky-950';
  
  return (
    <button onClick={onClick} className={`inline-flex items-center gap-1.5 font-medium rounded border transition-all cursor-pointer ${sizeClasses} ${kindClasses}`}>
      {icon}
      {children}
    </button>
  );
});

const Stat = window.Stat || (({ label, value, suffix, delta, deltaTone, hint }) => (
  <div className="p-3.5 bg-slate-900/90 border border-slate-800 rounded-lg shadow-sm backdrop-blur">
    <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">{label}</div>
    <div className="text-xl font-mono font-bold text-slate-100 mt-1">
      {value} {suffix && <span className="text-xs text-slate-400 font-normal">{suffix}</span>}
    </div>
    <div className="flex items-center justify-between mt-2">
      <span className="text-[10px] text-slate-500">{hint}</span>
      {delta && <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
        deltaTone === 'ok' ? 'text-emerald-400 bg-emerald-950/60' : 
        deltaTone === 'warn' ? 'text-amber-400 bg-amber-950/60' : 
        deltaTone === 'err' ? 'text-rose-400 bg-rose-950/60' : 'text-slate-400'
      }`}>{delta}</span>}
    </div>
  </div>
));

const Card = window.Card || (({ title, subtitle, right, children, className = "" }) => (
  <div className={`p-4 bg-slate-900/80 border border-slate-800/90 rounded-xl shadow-lg backdrop-blur ${className}`}>
    <div className="flex items-center justify-between mb-3">
      <div>
        <h3 className="text-sm font-semibold text-slate-200">{title}</h3>
        {subtitle && <p className="text-[11px] text-slate-400">{subtitle}</p>}
      </div>
      {right && <div>{right}</div>}
    </div>
    {children}
  </div>
));

const Tabs = window.Tabs || (({ items, value, onChange, size }) => (
  <div className="inline-flex p-0.5 bg-slate-950/80 border border-slate-800 rounded-lg">
    {items.map(it => (
      <button
        key={it.id}
        onClick={() => onChange(it.id)}
        className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
          value === it.id 
            ? 'bg-slate-800 text-sky-400 shadow-sm border border-slate-700/60' 
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        {it.label}
      </button>
    ))}
  </div>
));

/* ==========================================================================
   Sub-Components Traffic Observability
   ========================================================================== */

function TimelineChart() {
  const N = 80;
  const data = useMemo(() => Array.from({length: N}, (_, i) => 25 + Math.sin(i / 6) * 5 + Math.random() * 6), []);
  const errs = useMemo(() => Array.from({length: N}, (_, i) => Math.max(0, Math.sin(i / 8 + 1) * 0.6 + Math.random() * 0.4) * (i > 50 ? 2.5 : 1)), []);
  const w = 800, h = 200, pad = 24;
  const max = Math.max(...data) * 1.1;
  const path = data.map((v, i) => {
    const x = pad + (i / (N - 1)) * (w - pad * 2);
    const y = h - pad - (v / max) * (h - pad * 2);
    return `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full" preserveAspectRatio="none">
      {Array.from({length: 5}).map((_, i) => {
        const y = pad + (i / 4) * (h - pad * 2);
        return <line key={i} x1={pad} y1={y} x2={w - pad} y2={y} stroke="#334155" strokeWidth="0.4"/>;
      })}
      <path d={`${path} L${w - pad},${h - pad} L${pad},${h - pad} Z`} fill="#38BDF8" opacity="0.12"/>
      <path d={path} fill="none" stroke="#38BDF8" strokeWidth="1.6"/>

      {/* error bars */}
      {errs.map((v, i) => {
        const x = pad + (i / (N - 1)) * (w - pad * 2);
        return <line key={i} x1={x} y1={h - pad} x2={x} y2={h - pad - v * 30} stroke="#F87171" strokeWidth="2.5" opacity="0.85"/>;
      })}

      {/* annotations */}
      <line x1={pad + 0.7 * (w - pad * 2)} y1={pad} x2={pad + 0.7 * (w - pad * 2)} y2={h - pad} stroke="#FBBF24" strokeWidth="0.8" strokeDasharray="3 3"/>
      <text x={pad + 0.7 * (w - pad * 2) + 6} y={pad + 10} fontSize="10" fill="#FBBF24" fontFamily="monospace">deploy v3.2</text>

      <text x={pad} y={pad - 6} fontSize="10" fill="#94A3B8" fontFamily="monospace">msg/s</text>
      <text x={w - pad} y={h - 4} fontSize="10" fill="#94A3B8" textAnchor="end" fontFamily="monospace">now</text>
    </svg>
  );
}

function TracesTable() {
  const rows = [
    { id: "0xa42e7c", route: "sap-idoc-ingest", op: "POST /idoc",     dur: 312, status: "ok",  errs: 0, ts: "12:04:11" },
    { id: "0xa42e7b", route: "mining-telemetry", op: "MQTT pub",       dur: 8,   status: "ok",  errs: 0, ts: "12:04:11" },
    { id: "0xa42e7a", route: "salesforce-sync",  op: "GET /sobjects",  dur: 1240,status: "err", errs: 1, ts: "12:04:09" },
    { id: "0xa42e79", route: "ocr-pipeline",     op: "scan s3://",     dur: 540, status: "ok",  errs: 0, ts: "12:04:08" },
    { id: "0xa42e78", route: "billing-export",   op: "POST /billing",  dur: 880, status: "warn",errs: 0, ts: "12:04:07" },
    { id: "0xa42e77", route: "wa-notifier",      op: "POST /messages", dur: 92,  status: "ok",  errs: 0, ts: "12:04:07" },
    { id: "0xa42e76", route: "sap-idoc-ingest",  op: "POST /idoc",     dur: 280, status: "ok",  errs: 0, ts: "12:04:06" },
    { id: "0xa42e75", route: "ai-enrichment",    op: "embed.batch",    dur: 1820,status: "ok",  errs: 0, ts: "12:04:04" },
    { id: "0xa42e74", route: "kafka-broker-2",   op: "rebalance",      dur: 4200,status: "warn",errs: 0, ts: "12:04:01" },
  ];

  return (
    <div className="-mx-4 -mb-4 overflow-x-auto">
      <table className="w-full text-[12px] border-collapse">
        <thead>
          <tr className="text-slate-400 text-[10.5px] uppercase tracking-wider border-b border-slate-800">
            <th className="text-left font-medium px-4 py-2">Trace</th>
            <th className="text-left font-medium py-2">Route</th>
            <th className="text-left font-medium py-2">Op</th>
            <th className="text-right font-medium py-2">Duration</th>
            <th className="text-right font-medium px-4 py-2">When</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.id} className={`border-b border-slate-800/60 hover:bg-slate-800/40 transition-colors cursor-pointer ${i === 0 ? "bg-slate-800/30" : ""}`}>
              <td className="px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 rounded-full ${r.status === "ok" ? "bg-emerald-400" : r.status === "err" ? "bg-rose-400" : "bg-amber-400"}`}/>
                  <span className="font-mono text-sky-400 font-semibold">{r.id}</span>
                </div>
              </td>
              <td className="font-mono text-slate-200">{r.route}</td>
              <td className="text-slate-400">{r.op}</td>
              <td className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <div className="w-20 h-1 bg-slate-800 rounded-full overflow-hidden">
                    <div className={`h-full ${r.dur > 1000 ? "bg-rose-400" : r.dur > 500 ? "bg-amber-400" : "bg-sky-400"}`} style={{width: `${Math.min(100, r.dur / 50)}%`}}/>
                  </div>
                  <span className="font-mono tabular-nums w-12 text-right text-slate-200">{r.dur}ms</span>
                </div>
              </td>
              <td className="text-right px-4 font-mono text-slate-400">{r.ts}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TopicsList() {
  const topics = [
    { name: "erp.invoices.v3",  parts: 12, msg: "18.4k", lag: 0,   tone: "ok" },
    { name: "erp.invoices.dlq", parts: 4,  msg: "412",   lag: 0,   tone: "err" },
    { name: "mining.telemetry", parts: 24, msg: "12.1k", lag: 0,   tone: "ok" },
    { name: "billing.events",   parts: 6,  msg: "920",   lag: 2140,tone: "warn" },
    { name: "audit.trail",      parts: 3,  msg: "84",    lag: 0,   tone: "ok" },
  ];

  return (
    <div className="-mx-4 -mb-4 divide-y divide-slate-800">
      {topics.map(t => (
        <div key={t.name} className="px-4 py-3 flex items-center gap-3 hover:bg-slate-800/30 transition-colors">
          <Icon.kafka className="text-sky-400"/>
          <div className="min-w-0 flex-1">
            <div className="font-mono text-[12.5px] text-slate-200 font-semibold">{t.name}</div>
            <div className="text-[10.5px] text-slate-400 font-mono">{t.parts} partitions · {t.msg} msg/s</div>
          </div>
          <div className="font-mono tabular-nums text-[12px]">
            <span className={t.lag > 0 ? "text-amber-400 font-bold" : "text-slate-400"}>{t.lag === 0 ? "—" : t.lag.toLocaleString()}</span>
            <span className="text-slate-500 text-[10.5px] ml-1">lag</span>
          </div>
          <Pill tone={t.tone} dot>{t.tone === "ok" ? "healthy" : t.tone === "warn" ? "lagging" : "errors"}</Pill>
        </div>
      ))}
    </div>
  );
}

function LogsViewer() {
  const lines = [
    { lvl: "INFO", t: "12:04:11.428", svc: "router",   msg: "trace 0xa42e7c routed → sap-idoc-ingest" },
    { lvl: "OK",   t: "12:04:11.430", svc: "validate", msg: "schema invoice.v3 OK · 8 fields" },
    { lvl: "WARN", t: "12:04:11.450", svc: "ai",       msg: "model latency 1.2s (>500ms target)" },
    { lvl: "INFO", t: "12:04:11.612", svc: "kafka",    msg: "produced erp.invoices.v3[7]@204912" },
    { lvl: "ERR",  t: "12:04:09.882", svc: "sf-sync",  msg: "503 from /v55/sobjects · backoff 2s" },
    { lvl: "INFO", t: "12:04:08.011", svc: "ocr",      msg: "scanned 423 objects, 18 enqueued" },
    { lvl: "INFO", t: "12:04:07.711", svc: "billing",  msg: "validated 4 of 4 lines (USD)" },
  ];

  return (
    <div className="font-mono text-[11.5px] leading-relaxed -mx-4 -mb-4 px-4 py-2 max-h-[420px] overflow-auto ps-scroll bg-slate-950/60 rounded-b-xl">
      {lines.map((l, i) => (
        <div key={i} className="flex gap-3 py-1 border-b border-slate-900/60 hover:bg-slate-800/40 px-1 rounded">
          <span className="text-slate-500 shrink-0">{l.t}</span>
          <span className={`shrink-0 w-10 font-bold ${
            l.lvl === "ERR" ? "text-rose-400" : 
            l.lvl === "WARN" ? "text-amber-400" : 
            l.lvl === "OK" ? "text-emerald-400" : "text-slate-400"
          }`}>{l.lvl}</span>
          <span className="shrink-0 w-16 text-indigo-400">{l.svc}</span>
          <span className="text-slate-200">{l.msg}</span>
        </div>
      ))}
    </div>
  );
}

function TraceWaterfall() {
  const spans = [
    { name: "POST /idoc",         start: 0,   dur: 312, color: "#38BDF8", lvl: 0 },
    { name: "router.match",       start: 4,   dur: 6,   color: "#64748B", lvl: 1 },
    { name: "validate (v3)",      start: 12,  dur: 18,  color: "#4ADE80", lvl: 1 },
    { name: "transform.groovy",   start: 30,  dur: 42,  color: "#38BDF8", lvl: 1 },
    { name: "ai.enrich (haiku)",  start: 30,  dur: 248, color: "#C084FC", lvl: 1 },
    { name: "  embed",            start: 38,  dur: 90,  color: "#C084FC", lvl: 2 },
    { name: "  classify",         start: 132, dur: 110, color: "#C084FC", lvl: 2 },
    { name: "kafka.produce",      start: 286, dur: 22,  color: "#38BDF8", lvl: 1 },
  ];
  const total = 312;

  return (
    <div className="space-y-2">
      {spans.map((s, i) => (
        <div key={i} className="grid grid-cols-12 items-center gap-2 text-[11px]">
          <span className="col-span-5 font-mono text-slate-300 truncate" style={{paddingLeft: s.lvl * 12}}>{s.name}</span>
          <div className="col-span-6 relative h-4 bg-slate-800 rounded-sm overflow-hidden">
            <div className="absolute h-full rounded-sm" style={{
              left: `${(s.start / total) * 100}%`,
              width: `${(s.dur / total) * 100}%`,
              backgroundColor: s.color, opacity: 0.85,
            }}/>
          </div>
          <span className="col-span-1 text-right font-mono tabular-nums text-slate-400">{s.dur}ms</span>
        </div>
      ))}
      <div className="border-t border-slate-800 pt-2 mt-3 flex items-center justify-between text-[11px] text-slate-400">
        <span>8 spans · 4 services · 1 region</span>
        <Btn kind="ghost" size="xs">Open full trace →</Btn>
      </div>
    </div>
  );
}

function PartitionLag() {
  const partitions = Array.from({length: 12}, (_, i) => ({
    p: i,
    lag: i === 7 ? 2140 : Math.floor(Math.random() * 50),
    rate: 1200 + Math.floor(Math.random() * 800),
  }));
  const max = Math.max(...partitions.map(p => p.lag), 1000);

  return (
    <div className="space-y-1.5">
      {partitions.map(p => (
        <div key={p.p} className="grid grid-cols-12 items-center gap-2 text-[11.5px]">
          <span className="col-span-2 font-mono text-slate-400">part {p.p.toString().padStart(2,"0")}</span>
          <div className="col-span-7 h-2 bg-slate-800 rounded-full overflow-hidden">
            <div className={`h-full ${p.lag > 1000 ? "bg-rose-400" : p.lag > 100 ? "bg-amber-400" : "bg-sky-400"}`} style={{width: `${(p.lag / max) * 100}%`}}/>
          </div>
          <span className={`col-span-2 font-mono tabular-nums text-right font-medium ${p.lag > 1000 ? "text-rose-400 font-bold" : "text-slate-200"}`}>{p.lag.toLocaleString()}</span>
          <span className="col-span-1 font-mono text-slate-500 text-[10px] text-right">{p.rate}/s</span>
        </div>
      ))}
    </div>
  );
}

function PayloadInspector() {
  const [tab, setTab] = useState("body");

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <Tabs items={[{id:"body",label:"Body"},{id:"headers",label:"Headers"},{id:"meta",label:"Metadata"}]} value={tab} onChange={setTab} size="sm"/>
        <div className="text-[10.5px] text-slate-400 font-mono">trace 0xa42e7c · 1.2 KB</div>
      </div>

      {tab === "body" && (
        <pre className="bg-slate-950/90 border border-slate-800 rounded-md p-3 text-[11.5px] font-mono leading-relaxed text-sky-300 max-h-[280px] overflow-auto ps-scroll"><code>{`{
  "invoiceNo": "INV-20451",
  "vendor":    "0000412005",
  "currency":  "IDR",
  "lines": [
    { "sku": "SKU-100", "qty": 12, "net": 10200000 },
    { "sku": "SKU-220", "qty":  4, "net":  5000000 }
  ],
  "totalNet":  15200000,
  "tenantId":  "prima-mining",
  "_trace":    "0xa42e7c",
  "_routedAt": "2026-05-08T05:04:11.612Z"
}`}</code></pre>
      )}
      {tab === "headers" && (
        <div className="text-[12px] font-mono space-y-2 p-2 bg-slate-950/60 border border-slate-800 rounded-md">
          {[["x-tenant","prima-mining"],["x-trace","0xa42e7c"],["x-route-version","3.2"],["content-type","application/json"],["kafka-key","INV-20451"]].map(([k,v]) => (
            <div key={k} className="flex items-center gap-3 border-b border-slate-900 pb-1">
              <span className="text-slate-400 w-36">{k}</span>
              <span className="text-slate-200">{v}</span>
            </div>
          ))}
        </div>
      )}
      {tab === "meta" && (
        <div className="text-[12px] grid grid-cols-2 gap-2">
          {[["Source","sap-rfc"],["Sink","kafka.erp.invoices.v3[7]"],["Producer","kafka-01"],["Region","ap-southeast-3"],["Tenant","prima-mining"],["Schema","invoice.v3"]].map(([k,v]) => (
            <div key={k} className="bg-slate-950/60 border border-slate-800 rounded-md px-3 py-2">
              <div className="text-[10.5px] uppercase tracking-wider text-slate-400">{k}</div>
              <div className="font-mono text-[12px] text-slate-200 mt-0.5 truncate">{v}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ==========================================================================
   Main Traffic Monitor Page
   ========================================================================== */

function MonitorPage() {
  const [tab, setTab] = useState("traces");

  const usePsTenant = typeof window !== 'undefined' && typeof window.usePsTenant === 'function' 
    ? window.usePsTenant 
    : () => "default";
  const tenant = usePsTenant();

  const kpi = useMemo(() => {
    const getRoutes = typeof window !== 'undefined' && typeof window.psTenantRoutes === 'function' ? window.psTenantRoutes : () => [];
    const getMetrics = typeof window !== 'undefined' && typeof window.psTenantMetrics === 'function' ? window.psTenantMetrics : () => ({ msgsRate: 27200 });

    const routes = getRoutes(tenant);
    return {
      routes: routes.length || 8,
      inflight: routes.reduce((s, r) => s + (r.deployments || []).reduce((a, d) => a + (d.inflight || 0), 0), 0) || 142,
      thru: getMetrics(tenant).msgsRate || 27200,
    };
  }, [tenant]);

  return (
    <div className="min-h-screen bg-[#090D14] text-slate-100 p-6 space-y-5  mx-auto" data-screen-label="Traffic Monitor">
      <SectionH title="Traffic Monitor" subtitle="End-to-end observability across routes, topics and connectors">
        <Pill tone="ok" dot>Live · 2.3s</Pill>
        <Btn kind="outline" size="sm" icon={<Icon.download/>}>Export</Btn>
        <Btn kind="outline" size="sm" icon={<Icon.filter/>}>Filters · 3</Btn>
        <Tabs items={[{id:"5m",label:"5m"},{id:"1h",label:"1h"},{id:"24h",label:"24h"},{id:"7d",label:"7d"}]} value="1h" onChange={()=>{}} size="sm"/>
      </SectionH>

      {/* KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <Stat label="Inflight" value={kpi.inflight.toLocaleString()} suffix="msg" hint={`across ${kpi.routes} routes`}/>
        <Stat label="P50 / P95 / P99" value="14 / 48 / 312" suffix="ms" deltaTone="warn" delta="+3ms"/>
        <Stat label="Error rate" value="0.18%" delta="-0.04" deltaTone="ok"/>
        <Stat label="Consumer lag" value="2,140" delta="+412" deltaTone="warn" hint="erp.invoices · part 7"/>
        <Stat label="Throughput" value={kpi.thru.toLocaleString()} suffix="msg/s" deltaTone="ok" delta="+12%"/>
        <Stat label="Active traces" value="6,210" hint="50% sampled"/>
      </div>

      {/* Big timeline */}
      <Card title="Throughput & errors" subtitle="msg/s · binned 1m" right={
        <div className="flex items-center gap-2">
          <Pill tone="accent" dot>throughput</Pill>
          <Pill tone="err" dot>errors</Pill>
        </div>
      }>
        <div className="h-[200px]"><TimelineChart/></div>
      </Card>

      <div className="grid grid-cols-12 gap-4">
        {/* Traces list */}
        <Card className="col-span-12 lg:col-span-7" title="Distributed traces" right={
          <Tabs items={[{id:"traces",label:"Traces"},{id:"topics",label:"Topics"},{id:"logs",label:"Logs"}]} value={tab} onChange={setTab} size="sm"/>
        }>
          {tab === "traces" && <TracesTable/>}
          {tab === "topics" && <TopicsList/>}
          {tab === "logs" && <LogsViewer/>}
        </Card>

        {/* Trace detail */}
        <div className="col-span-12 lg:col-span-5">
          <Card title="Trace · 0xa42e7c · INV-20451" subtitle="end-to-end · 312ms" right={<Btn kind="ghost" size="xs" icon={<Icon.copy/>}>Copy ID</Btn>}>
            <TraceWaterfall/>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        <Card className="col-span-12 lg:col-span-5" title="Consumer lag" subtitle="by partition · erp.invoices.v3">
          <PartitionLag/>
        </Card>

        <Card className="col-span-12 lg:col-span-7" title="Payload inspector" subtitle="msg key: INV-20451" right={
          <div className="flex items-center gap-1">
            <Btn kind="ghost" size="xs" icon={<Icon.refresh/>}>Replay</Btn>
            <Btn kind="ghost" size="xs" icon={<Icon.send/>}>Forward</Btn>
            <Btn kind="ghost" size="xs" icon={<Icon.bot/>}>Explain</Btn>
          </div>
        }>
          <PayloadInspector/>
        </Card>
      </div>
    </div>
  );
}

/* Global Expose */
if (typeof window !== 'undefined') {
  window.MonitorPage = MonitorPage;
  window.TimelineChart = TimelineChart;
  window.TracesTable = TracesTable;
  window.TopicsList = TopicsList;
  window.LogsViewer = LogsViewer;
  window.TraceWaterfall = TraceWaterfall;
  window.PartitionLag = PartitionLag;
  window.PayloadInspector = PayloadInspector;
}

export default MonitorPage;