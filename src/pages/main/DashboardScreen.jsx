import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

/* ==========================================================================
   CSS Themes & Color Variables (Background #090D14 Compliant)
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
`;

/* Inject CSSVariables otomatis ke DOM jika belum ada */
if (typeof document !== 'undefined' && !document.getElementById('ps-theme-vars')) {
  const styleEl = document.createElement('style');
  styleEl.id = 'ps-theme-vars';
  styleEl.innerHTML = themeStyles;
  document.head.appendChild(styleEl);
}

/* ==========================================================================
   UI Kit Fallbacks dengan Tema Neon / Color-Mix Berwarna
   ========================================================================== */
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
    tone === 'err' ? 'bg-rose-950/50 border-rose-500/40 text-rose-400' : 'bg-slate-800/80 border-slate-700 text-slate-300'
  }`}>
    {dot && <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />}
    {children}
  </span>
));

const Btn = window.Btn || (({ children, onClick, kind, size, icon }) => (
  <button onClick={onClick} className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded border transition-all cursor-pointer ${
    kind === 'primary' 
      ? 'bg-sky-600 hover:bg-sky-500 border-sky-400 text-white shadow-md shadow-sky-950' 
      : 'bg-slate-800/80 hover:bg-slate-700/80 border-slate-700 text-slate-200'
  }`}>
    {icon}
    {children}
  </button>
));

const Stat = window.Stat || (({ label, value, suffix, delta, deltaTone, hint, sparkline }) => (
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
    {sparkline && <div className="mt-2">{sparkline}</div>}
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

const Sparkline = window.Sparkline || (({ data, color = "#38BDF8", height = 26 }) => {
  if (!data || !data.length) return <div className="w-full rounded bg-slate-800" style={{ height: `${height}px` }} />;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * 100},${height - ((v - min) / range) * (height - 4) - 2}`).join(" ");
  return (
    <svg className="w-full overflow-visible" style={{ height: `${height}px` }} preserveAspectRatio="none" viewBox={`0 0 100 ${height}`}>
      <polyline fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" points={pts} />
    </svg>
  );
});

const Tabs = window.Tabs || (() => null);
const Badge = window.Badge || (({ children }) => <span className="px-1.5 py-0.5 text-[10px] bg-slate-800 text-slate-300 rounded border border-slate-700/80 font-mono">{children}</span>);
const StatusDot = window.StatusDot || (({ tone = "ok" }) => <span className={`w-2 h-2 rounded-full inline-block ${tone === "ok" ? "bg-emerald-400" : tone === "warn" ? "bg-amber-400" : "bg-rose-400"}`} />);
const ProgressBar = window.ProgressBar || (({ value }) => <div className="w-full bg-slate-800 h-1.5 rounded overflow-hidden"><div className="bg-sky-400 h-full transition-all" style={{ width: `${value}%` }} /></div>);
const Icon = window.Icon || {};

/* ==========================================================================
   Komponen Visual & Grafik (Original Theme - Neon Dark)
   ========================================================================== */

function MiniSpark({ data, color = "var(--ps-accent)" }) {
  return <Sparkline data={data} color={color} height={28}/>;
}

function RegionMap() {
  const dots = [];
  for (let y = 0; y < 14; y++) {
    for (let x = 0; x < 30; x++) {
      const inN = (y > 2 && y < 7 && ((x > 3 && x < 9) || (x > 13 && x < 19)));
      const inS = (y > 7 && y < 11 && ((x > 6 && x < 9) || (x > 15 && x < 18)));
      const inE = (y > 3 && y < 8 && (x > 19 && x < 27));
      const inA = (y > 8 && y < 12 && (x > 21 && x < 26));
      if (inN || inS || inE || inA) {
        dots.push([x, y, Math.random() > 0.7 ? 0.9 : 0.45]);
      }
    }
  }
  const nodes = [
    { x: 5,  y: 4, label: "us-west", lag: "12ms", tone: "ok" },
    { x: 15, y: 4, label: "eu-west", lag: "31ms", tone: "ok" },
    { x: 22, y: 6, label: "ap-east", lag: "8ms",  tone: "ok" },
    { x: 24, y: 9, label: "ap-southeast-3", lag: "4ms", tone: "accent", primary: true },
    { x: 8,  y: 9, label: "sa-east", lag: "94ms", tone: "warn" },
  ];

  return (
    <div className="relative w-full h-full bg-slate-900/90 rounded-md border border-slate-800 overflow-hidden">
      <svg viewBox="0 0 30 14" preserveAspectRatio="none" className="absolute inset-0 w-full h-full">
        {dots.map((d, i) => (
          <circle key={i} cx={d[0] + 0.5} cy={d[1] + 0.5} r="0.18" fill="currentColor" className="text-slate-600" opacity={d[2]}/>
        ))}
        {nodes.filter(n => !n.primary).map((n, i) => (
          <line key={i} x1={24.5} y1={9.5} x2={n.x + 0.5} y2={n.y + 0.5} stroke="currentColor" className="text-sky-400" strokeWidth="0.05" opacity="0.45"/>
        ))}
      </svg>
      {nodes.map((n, i) => {
        const tones = { ok: "bg-emerald-400", warn: "bg-amber-400", err: "bg-rose-400", accent: "bg-sky-400" };
        return (
          <div key={i} className="absolute -translate-x-1/2 -translate-y-1/2" style={{left: `${(n.x + 0.5) / 30 * 100}%`, top: `${(n.y + 0.5) / 14 * 100}%`}}>
            <div className="relative">
              <div className={`w-2 h-2 rounded-full ${tones[n.tone]}`}>
                <div className={`absolute inset-0 rounded-full ${tones[n.tone]} opacity-50 animate-ping`}/>
              </div>
              <div className={`absolute left-3 top-1/2 -translate-y-1/2 whitespace-nowrap text-[10px] font-mono ${n.primary ? "text-sky-400 font-bold" : "text-slate-400"}`}>
                {n.label} <span className="text-slate-500">{n.lag}</span>
              </div>
            </div>
          </div>
        );
      })}
      <div className="absolute bottom-2 left-2 text-[10px] text-slate-500 font-mono uppercase tracking-wider">5 regions · 28 nodes online</div>
    </div>
  );
}

function TrafficHeatmap() {
  const hours = 24, days = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
  const data = useMemo(() => {
    const rows = [];
    for (let d = 0; d < 7; d++) {
      const r = [];
      for (let h = 0; h < hours; h++) {
        const peak = (d < 5 && h >= 8 && h <= 18) ? 0.7 + Math.random() * 0.3
                   : (d < 5 && (h >= 6 && h < 8)) ? 0.4 + Math.random() * 0.3
                   : 0.05 + Math.random() * 0.35;
        r.push(peak);
      }
      rows.push(r);
    }
    return rows;
  }, []);

  return (
    <div>
      <div className="grid gap-1" style={{gridTemplateColumns: `auto repeat(${hours}, 1fr)`}}>
        <div/>
        {Array.from({length: hours}).map((_, h) => (
          <div key={h} className="text-[9px] text-slate-500 text-center font-mono">{h % 6 === 0 ? `${h.toString().padStart(2,"0")}` : ""}</div>
        ))}
        {data.map((row, di) => (
          <React.Fragment key={di}>
            <div className="text-[10px] text-slate-400 pr-1 flex items-center justify-end font-mono">{days[di]}</div>
            {row.map((v, hi) => (
              <div key={hi} className="rounded-[2px] aspect-square transition-opacity hover:opacity-80 cursor-pointer" title={`${days[di]} ${hi}:00 — ${(v * 12000).toFixed(0)} msg/s`}
                   style={{background: `color-mix(in oklab, var(--ps-accent) ${Math.round(v * 100)}%, var(--ps-panel-2))`}}/>
            ))}
          </React.Fragment>
        ))}
      </div>
      <div className="flex items-center justify-between mt-3 text-[10px] text-slate-500 font-mono">
        <span>UTC+7 · last 7 days</span>
        <div className="flex items-center gap-1">
          <span>low</span>
          {[0.1,0.3,0.5,0.7,0.9].map((v,i) => (
            <span key={i} className="w-3 h-3 rounded-[2px]" style={{background: `color-mix(in oklab, var(--ps-accent) ${v * 100}%, var(--ps-panel-2))`}}/>
          ))}
          <span>high</span>
        </div>
      </div>
    </div>
  );
}

function tnow(offset) {
  const d = new Date(Date.now() + offset * 1000);
  return d.toTimeString().slice(0, 8);
}

function seedEvents() {
  const base = [
    { level: "INFO", route: "sap-idoc-ingest", msg: "delivered 2 messages to topic erp.invoices.v2" },
    { level: "OK",   route: "mining-telemetry", msg: "consumer lag 0 · 18,402 msg/s sustained" },
    { level: "WARN", route: "fms-dispatch-ingest", msg: "retry #2 · upstream 503 from /fms/dispatch" },
    { level: "INFO", route: "weighbridge-ingest", msg: "JDBC poll ok · 412 rows → weighbridge.events" },
    { level: "ERR",  route: "billing-export", msg: "schema validation failed at $.lines[3].amount" },
    { level: "INFO", route: "wa-notifier",   msg: "outbound batch 142 acked" },
    { level: "OK",   route: "kafka-broker-2", msg: "partition rebalance complete (12 partitions)" },
  ];
  return base.map((e, i) => ({...e, id: i, t: tnow(-i * 2)}));
}

function randomEvent() {
  const items = [
    { level: "INFO", route: "sap-idoc-ingest", msg: `consumed offset ${Math.floor(Math.random()*99999)}` },
    { level: "INFO", route: "mining-telemetry", msg: "OPC-UA tag batch flushed" },
    { level: "WARN", route: "INST-GBG-01", msg: "memory pressure 78%" },
    { level: "OK",   route: "kafka-broker-1", msg: "ISR stable · 3/3" },
    { level: "ERR",  route: "billing-export", msg: "DLQ pushed: unknown currency 'XBT'" },
    { level: "INFO", route: "ai-enrichment", msg: "embedding batch (256) → vector.staging" },
  ];
  const e = items[Math.floor(Math.random() * items.length)];
  return { ...e, id: Math.random(), t: tnow(0) };
}

function LiveStream() {
  const [events, setEvents] = useState(() => seedEvents());
  useEffect(() => {
    const t = setInterval(() => {
      setEvents(prev => [randomEvent(), ...prev].slice(0, 50));
    }, 1800);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="font-mono text-[11px] leading-relaxed h-full overflow-auto space-y-1">
      {events.map((e) => (
        <div key={e.id} className="flex gap-3 px-2 py-1 hover:bg-slate-800/60 rounded transition-colors">
          <span className="text-slate-500 shrink-0">{e.t}</span>
          <span className={`shrink-0 w-12 font-bold ${
            e.level === "INFO" ? "text-slate-400" :
            e.level === "WARN" ? "text-amber-400" :
            e.level === "ERR"  ? "text-rose-400"  : "text-emerald-400"
          }`}>{e.level}</span>
          <span className="text-indigo-400 shrink-0">{e.route}</span>
          <span className="text-slate-200 truncate">{e.msg}</span>
        </div>
      ))}
    </div>
  );
}

function ClusterPanel() {
  const brokers = [
    { id: "kafka-01", role: "Controller", state: "Healthy", part: 142, isr: "3/3", cpu: 32, lag: "0", tone: "ok" },
    { id: "kafka-02", role: "Replica",    state: "Healthy", part: 138, isr: "3/3", cpu: 41, lag: "0", tone: "ok" },
    { id: "kafka-03", role: "Replica",    state: "Rebalance", part: 138, isr: "2/3", cpu: 67, lag: "2.1k", tone: "warn" },
  ];
  return (
    <div className="space-y-2">
      {brokers.map(b => (
        <div key={b.id} className="flex items-center gap-3 p-2.5 rounded-md bg-slate-900/60 border border-slate-800">
          <div className="flex flex-col items-center justify-center w-10 h-10 rounded bg-slate-800/80 border border-slate-700">
            <span className="text-xs font-mono font-bold text-sky-400">K</span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-[12.5px] font-semibold text-slate-200">{b.id}</span>
              <Badge>{b.role}</Badge>
              <StatusDot tone={b.tone}/>
              <span className="text-xs text-slate-400">{b.state}</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1 flex gap-3 font-mono">
              <span>part {b.part}</span><span>isr {b.isr}</span><span>lag {b.lag}</span>
            </div>
          </div>
          <div className="w-20 shrink-0 flex flex-col items-end gap-1">
            <span className="font-mono text-[11px] text-slate-400">{b.cpu}%</span>
            <ProgressBar value={b.cpu}/>
          </div>
        </div>
      ))}
    </div>
  );
}

function TopRoutes() {
  const navigate = useNavigate();
  const usePsTenant = typeof window !== 'undefined' && typeof window.usePsTenant === 'function' 
    ? window.usePsTenant 
    : () => "default";
  const tenant = usePsTenant();

  const tones = ["accent", "blue", "vio", "ok", "warn", "err"];
  const toneText = { accent: "text-sky-400", blue: "text-indigo-400", vio: "text-purple-400", ok: "text-emerald-400", warn: "text-amber-400", err: "text-rose-400" };
  const toneVar = { accent: "#38BDF8", blue: "#818CF8", vio: "#C084FC", ok: "#4ADE80", warn: "#FBBF24", err: "#F87171" };
  
  const rows = useMemo(() => {
    if (typeof window === 'undefined' || typeof window.psTenantRoutes !== 'function') {
      return [
        { slug: "sap-idoc-ingest", group: "ERP", thru: 14200, failed: 0, deps: 2, trend: [10,12,14,13,15,18,20,19,22,24] },
        { slug: "mining-telemetry", group: "IOT", thru: 8900, failed: 2, deps: 4, trend: [8,9,8,11,12,10,14,15,16,18] },
        { slug: "billing-export", group: "FINANCE", thru: 4100, failed: 12, deps: 1, trend: [5,6,4,8,7,9,11,10,12,11] },
      ];
    }
    const instances = window.PS_INSTANCE_BY_ID || {};
    return window.psTenantRoutes(tenant).map(r => {
      const thru = (r.deployments || []).reduce((s, d) => s + (d.status === "Started" && instances[d.inst]?.agent === "online" ? d.base : 0), 0);
      const failed = (r.deployments || []).reduce((s, d) => s + (d.failed || 0), 0);
      const trend = Array.from({ length: 12 }, (_, i) => Math.max(0.2, thru * (0.82 + 0.18 * Math.sin(i / 2 + r.slug.length))));
      return { slug: r.slug, group: r.group, thru, failed, deps: (r.deployments || []).length, trend };
    }).sort((a, b) => b.thru - a.thru).slice(0, 6);
  }, [tenant]);

  return (
    <div className="-mx-4 -mb-4 overflow-x-auto">
      <table className="w-full text-[12.5px] border-collapse">
        <thead>
          <tr className="text-slate-400 text-[10.5px] uppercase tracking-wider border-b border-slate-800">
            <th className="text-left font-medium px-4 pb-2">Route</th>
            <th className="text-right font-medium pb-2">Throughput</th>
            <th className="text-right font-medium pb-2">Failed</th>
            <th className="text-right font-medium pb-2">Deploys</th>
            <th className="text-right font-medium px-4 pb-2 w-[140px]">Trend (1h)</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => {
            const tone = tones[i % tones.length];
            return (
              <tr key={r.slug} onClick={() => navigate("/routes")} title="Open in Routes"
                  className="border-t border-slate-800/60 hover:bg-slate-800/40 cursor-pointer transition-colors">
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-2.5">
                    <span className={`w-6 h-6 rounded ${toneText[tone]} bg-slate-800 border border-slate-700 flex items-center justify-center text-[11px] font-semibold uppercase`}>{r.slug[0]}</span>
                    <span className="font-mono text-slate-200">{r.slug}</span>
                    <Badge>{r.group}</Badge>
                  </div>
                </td>
                <td className="text-right font-mono tabular-nums text-slate-200">{r.thru.toLocaleString()} <span className="text-slate-500">/s</span></td>
                <td className={`text-right font-mono tabular-nums ${r.failed > 5 ? "text-rose-400" : r.failed > 0 ? "text-amber-400" : "text-emerald-400"}`}>{r.failed}</td>
                <td className="text-right font-mono tabular-nums text-slate-400">{r.deps}</td>
                <td className="px-4 py-2 w-[140px]"><MiniSpark data={r.trend} color={toneVar[tone]}/></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function AlertsPanel() {
  const alerts = [
    { tone: "err",  title: "Consumer lag spiking on erp.invoices",     time: "2m", body: "Topic lag exceeded 50k on partition 7 · sap-idoc-ingest" },
    { tone: "warn", title: "Instance INST-GBG-01 at 78% RAM",           time: "11m", body: "Auto-scale recommendation available" },
    { tone: "warn", title: "BMKG Weather API near rate limit (84%)",   time: "23m", body: "Throttling kicks in at 90% — rotate API key?" },
    { tone: "info", title: "Schema v3 of erp.invoices ready to publish", time: "1h", body: "Compatibility: BACKWARD · 2 consumers affected" },
  ];
  return (
    <ul className="space-y-2">
      {alerts.map((a, i) => (
        <li key={i} className="flex gap-3 p-3 rounded-md bg-slate-900/60 border border-slate-800">
          <span className="mt-0.5">
            {a.tone === "err" ? <span className="text-rose-400 font-bold">!</span> :
             a.tone === "warn" ? <span className="text-amber-400 font-bold">!</span> :
             <span className="text-sky-400 font-bold">i</span>}
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-[12.5px] font-medium text-slate-200 truncate">{a.title}</span>
              <span className="text-[10.5px] text-slate-500 shrink-0">{a.time}</span>
            </div>
            <div className="text-[11.5px] text-slate-400 mt-0.5">{a.body}</div>
          </div>
        </li>
      ))}
    </ul>
  );
}

function ResourceGauges() {
  const items = [
    { label: "CPU",     pct: 42, hint: "12 cores · avg 5m" },
    { label: "Memory",  pct: 68, hint: "21.4 / 32 GB" },
    { label: "Network", pct: 31, hint: "1.2 Gbps egress" },
    { label: "Disk IO", pct: 57, hint: "412 MB/s peak" },
  ];
  return (
    <div className="grid grid-cols-2 gap-3">
      {items.map(it => (
        <div key={it.label} className="bg-slate-900/60 border border-slate-800 rounded-md p-3">
          <div className="flex items-center justify-between">
            <span className="text-[11.5px] text-slate-400 uppercase tracking-wide font-medium">{it.label}</span>
            <span className="font-mono text-[14px] text-slate-200 font-bold">{it.pct}%</span>
          </div>
          <div className="mt-2"><ProgressBar value={it.pct}/></div>
          <div className="text-[10.5px] text-slate-500 mt-1.5 font-mono">{it.hint}</div>
        </div>
      ))}
    </div>
  );
}

function ThroughputChart() {
  const dataIn  = useMemo(() => Array.from({length: 60}, (_, i) => 28 + Math.sin(i / 5) * 4 + Math.random() * 5), []);
  const dataOut = useMemo(() => Array.from({length: 60}, (_, i) => 24 + Math.sin(i / 5 + 0.7) * 5 + Math.random() * 4), []);
  const w = 600, h = 200, pad = 24;
  const all = [...dataIn, ...dataOut];
  const max = Math.max(...all) * 1.1;
  const path = (d) => {
    const pts = d.map((v, i) => [pad + (i / (d.length - 1)) * (w - pad * 2), h - pad - (v / max) * (h - pad * 2)]);
    const line = pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
    const area = `${line} L${pts[pts.length - 1][0]},${h - pad} L${pts[0][0]},${h - pad} Z`;
    return { line, area };
  };
  const A = path(dataIn);
  const B = path(dataOut);

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full" preserveAspectRatio="none">
      {Array.from({length: 5}).map((_, i) => {
        const y = pad + (i / 4) * (h - pad * 2);
        return <line key={i} x1={pad} y1={y} x2={w - pad} y2={y} stroke="#334155" strokeWidth="0.5"/>;
      })}
      <path d={A.area} fill="#38BDF8" opacity="0.15"/>
      <path d={A.line} fill="none" stroke="#38BDF8" strokeWidth="1.8"/>
      <path d={B.area} fill="#818CF8" opacity="0.10"/>
      <path d={B.line} fill="none" stroke="#818CF8" strokeWidth="1.8" strokeDasharray="4 4"/>
      <text x={pad} y={pad - 6} fontSize="10" fill="#94A3B8" fontFamily="monospace">msg/s</text>
      <text x={w - pad} y={h - 4} fontSize="10" fill="#94A3B8" textAnchor="end" fontFamily="monospace">now</text>
      <text x={pad} y={h - 4} fontSize="10" fill="#94A3B8" fontFamily="monospace">-60m</text>
    </svg>
  );
}

function RetryPanel() {
  const navigate = useNavigate();
  const topics = window.PS_DLQ_TOPICS || [
    { name: "erp.invoices.dlq", route: "sap-idoc-ingest", count: 18 },
    { name: "billing.dlq", route: "billing-export", count: 4 }
  ];
  const attempts = { "erp.invoices.dlq": [4,6,8,9,11,12,14,16,15,12,9,7], "billing.dlq": [2,3,4,4,5,6,5,4,4,3,3,2] };
  const total = topics.reduce((s, t) => s + (t.count || 0), 0);

  return (
    <div className="space-y-3">
      {topics.map(t => (
        <div key={t.name} className="grid grid-cols-12 items-center gap-3 text-[12px]">
          <div className="col-span-5 min-w-0">
            <div className="font-mono text-slate-200 truncate">{t.name}</div>
            <div className="text-[10.5px] text-slate-500 font-mono truncate">route: {t.route}</div>
          </div>
          <div className="col-span-4"><MiniSpark data={attempts[t.name] || [1,2,2,1,2,3,2,1,1,2,2,1]} color="#FBBF24"/></div>
          <span className="col-span-3 text-right tabular-nums font-mono text-rose-400 font-semibold">{t.count} msgs</span>
        </div>
      ))}
      <div className="border-t border-slate-800 pt-3 flex items-center justify-between text-[11px] text-slate-400">
        <span>DLQ backlog: <span className="font-mono text-slate-200 font-bold">{total}</span> messages</span>
        <Btn kind="outline" size="xs" onClick={() => navigate("/kafka")}>Replay DLQ</Btn>
      </div>
    </div>
  );
}

/* ==========================================================================
   Main Dashboard Page Component
   ========================================================================== */

function DashboardPage() {
  const [routeOpen, setRouteOpen] = useState(false);
  
  const usePsTenant = typeof window !== 'undefined' && typeof window.usePsTenant === 'function' 
    ? window.usePsTenant 
    : () => "default";
  const tenant = usePsTenant();

  const kpi = useMemo(() => {
    const getRoutes = typeof window !== 'undefined' && typeof window.psTenantRoutes === 'function' ? window.psTenantRoutes : () => [];
    const getInsts = typeof window !== 'undefined' && typeof window.psBuildInstances === 'function' ? window.psBuildInstances : () => [];
    const getMetrics = typeof window !== 'undefined' && typeof window.psTenantMetrics === 'function' ? window.psTenantMetrics : () => ({ msgsRate: 27200 });

    const routes = getRoutes(tenant);
    const insts = getInsts(tenant);
    const deps = routes.flatMap(r => r.deployments || []);
    const online = insts.filter(i => i.agent === "online").length;
    const dlqTopics = (window.PS_DLQ_TOPICS || [{ count: 22 }]);

    return {
      routes: routes.length || 8,
      deps: deps.length || 12,
      running: deps.filter(d => d.status === "Started").length || 12,
      failed: deps.reduce((s, d) => s + (d.failed || 0), 0) || 4,
      thru: getMetrics(tenant).msgsRate || 27200,
      online: online || 3, 
      insts: insts.length || 3,
      sites: new Set(insts.map(i => i.site)).size || 2,
      dlqTopics,
      dlq: dlqTopics.reduce((s, t) => s + (t.count || 0), 0) || 22,
    };
  }, [tenant]);

  const TenantScopeBarComponent = window.TenantScopeBar || (() => null);
  const RouteModalComponent = window.RouteModal || null;

  return (
    <div className="min-h-screen bg-[#090D14] text-slate-100 p-6 space-y-6 mx-auto" data-screen-label="Dashboard">
      <TenantScopeBarComponent />
      <SectionH title="Overview" subtitle="Real-time pulse across the integration mesh">
        <Pill tone="ok" dot>Cluster healthy · 3/3 brokers online</Pill>
        <Btn kind="outline">Refresh · 5s</Btn>
        <Btn kind="primary" onClick={() => setRouteOpen(true)}>New route</Btn>
      </SectionH>

      {RouteModalComponent && <RouteModalComponent open={routeOpen} route={null} onClose={() => setRouteOpen(false)}/>}

      {/* KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <Stat label="Routes" value={kpi.routes} hint={`${kpi.running}/${kpi.deps} running`} sparkline={<Sparkline data={[5,5,6,6,6,7,7,8,8,8,8]} color="#38BDF8" height={26}/>} />
        <Stat label="Throughput" value={kpi.thru.toLocaleString()} suffix="msg/s" delta="+6%" deltaTone="ok" hint="rolling 1m" sparkline={<Sparkline data={[21,22,23,24,25,25,26,26,27,27,27]} color="#818CF8" height={26}/>} />
        <Stat label="Failed exch." value={kpi.failed} delta={kpi.failed ? "needs attn" : "clean"} deltaTone={kpi.failed ? "warn" : "ok"} hint="last hour" sparkline={<Sparkline data={[8,7,9,10,8,7,6,5,5,4,4]} color="#F87171" height={26}/>} />
        <Stat label="P95 latency" value="48" suffix="ms" delta="+3ms" deltaTone="warn" hint="end-to-end" sparkline={<Sparkline data={[40,42,42,44,45,46,47,47,48,48,48]} color="#FBBF24" height={26}/>} />
        <Stat label="Agents online" value={`${kpi.online} / ${kpi.insts}`} delta="all up" deltaTone="ok" hint={`across ${kpi.sites} sites`} sparkline={<Sparkline data={[4,4,4,4,3,3,3,3,3,3,3]} color="#C084FC" height={26}/>} />
        <Stat label="DLQ messages" value={kpi.dlq.toLocaleString()} delta="replayable" deltaTone="err" hint={`${kpi.dlqTopics.length} DLQ topics`} sparkline={<Sparkline data={[2,2.4,2.8,3.1,3.4,3.7,3.9,4.1,4.3,4.4,4.5]} color="#4ADE80" height={26}/>} />
      </div>

      {/* Row: throughput + cluster */}
      <div className="grid grid-cols-12 gap-4">
        <Card className="col-span-12 lg:col-span-7" title="Kafka throughput" subtitle="msg/s · last 60 minutes">
          <div className="h-[210px]">
            <ThroughputChart/>
          </div>
        </Card>

        <Card className="col-span-12 lg:col-span-5" title="Cluster health" right={<Pill tone="ok" dot>3/3 brokers</Pill>}>
          <ClusterPanel/>
        </Card>
      </div>

      {/* Row: heatmap + alerts + resources */}
      <div className="grid grid-cols-12 gap-4">
        <Card className="col-span-12 lg:col-span-5" title="Traffic heatmap" subtitle="msg/s by hour of day">
          <TrafficHeatmap/>
        </Card>
        <Card className="col-span-12 lg:col-span-4" title="Alerts" right={<Btn kind="outline" size="xs">View all</Btn>}>
          <AlertsPanel/>
        </Card>
        <Card className="col-span-12 lg:col-span-3" title="Resources">
          <ResourceGauges/>
        </Card>
      </div>

      {/* Row: top routes + region map */}
      <div className="grid grid-cols-12 gap-4">
        <Card className="col-span-12 lg:col-span-7" title="Top routes" subtitle="by throughput in last hour">
          <TopRoutes/>
        </Card>
        <Card className="col-span-12 lg:col-span-5" title="Regions" subtitle="latency · 5m avg">
          <div className="h-[230px]"><RegionMap/></div>
        </Card>
      </div>

      {/* Row: live stream + retries */}
      <div className="grid grid-cols-12 gap-4">
        <Card className="col-span-12 lg:col-span-7" title="Live event stream" subtitle="tap row to inspect" right={<Pill tone="ok" dot>streaming</Pill>}>
          <div className="h-[260px]"><LiveStream/></div>
        </Card>
        <Card className="col-span-12 lg:col-span-5" title="Retries & DLQ" subtitle="last 24h">
          <RetryPanel/>
        </Card>
      </div>
    </div>
  );
}

/* Expose global */
if (typeof window !== 'undefined') {
  window.DashboardPage = DashboardPage;
}

export default DashboardPage;