import React, { useState } from 'react';
import { 
  ShieldCheck, Download, CheckCircle2, Terminal, X, Sparkles 
} from 'lucide-react';

export default function RecommendedAppsSection({ site, wsRef }) {
  const [isOpen, setIsOpen] = useState(false);

  // JSON Data Step Install Terminal (Otomatis Sekali Klik)
  const recommendedAppsJson = [
    {
      id: "docker",
      name: "Docker Engine",
      description: "Container runtime environment & Docker Compose",
      version: "24.0+",
      command: "curl -fsSL https://get.docker.com | sh && sudo usermod -aG docker $USER"
    },
    {
      id: "java",
      name: "Java OpenJDK 17",
      description: "Java Development Kit (Required for Camel & Kafka)",
      version: "17 LTS",
      command: "sudo apt-get update && sudo apt-get install -y openjdk-17-jdk"
    },
    {
      id: "camel-jbang",
      name: "Camel JBang",
      description: "Apache Camel CLI integration engine",
      version: "4.x",
      command: "curl -s https://jbang.dev/install.sh | bash && source ~/.bashrc && jbang app install camel@apache/camel"
    },
    {
      id: "kafka",
      name: "Apache Kafka",
      description: "Enterprise event streaming platform (KRaft mode)",
      version: "3.7.0",
      command: "wget https://downloads.apache.org/kafka/3.7.0/kafka_2.13-3.7.0.tgz && tar -xzf kafka_2.13-3.7.0.tgz && mv kafka_2.13-3.7.0 /opt/kafka"
    }
  ];

  // Handler Sekali Klik: Kirim Command & Tutup Modal
  const handleInstallOneClick = (app) => {
    if (wsRef?.current && wsRef.current.readyState === WebSocket.OPEN) {
      // 1. Kirim perintah terminal via WebSocket
      wsRef.current.send(`${app.command}\n`);
      
      // 2. Tutup modal agar user bisa langsung lihat proses install di terminal
      setIsOpen(false);
    } else {
      alert(`Terminal SSH tidak terhubung ke site: ${site?.name || 'Target'}`);
    }
  };

  return (
    <>
      {/* FLOATING ACTION BUTTON (FAB) */}
      <div className="absolute bottom-6 right-6 z-20">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="group relative flex items-center gap-2 px-4 py-2.5 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-950/60 transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer border border-purple-400/30"
        >
          <Sparkles className="w-4 h-4 text-purple-200 animate-pulse" />
          <span className="text-xs font-semibold tracking-wide">
            Recommended Apps
          </span>
          <span className="ml-1 flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-300 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-200"></span>
          </span>
        </button>
      </div>

      {/* FLOATING MODAL OVERLAY */}
      {isOpen && (
        <div className="absolute inset-0 z-30 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-[#0b0f17] border border-slate-800 rounded-2xl p-5 shadow-2xl shadow-purple-950/40 relative flex flex-col">
            
            {/* Header Modal */}
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-purple-950/80 border border-purple-700/60 flex items-center justify-center text-purple-400">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    Core Stack Recommendations
                  </h2>
                  <p className="text-[10px] text-slate-400 font-mono">
                    1-Click Auto Install via Terminal SSH
                  </p>
                </div>
              </div>
              
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Application List */}
            <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1 custom-scrollbar">
              {recommendedAppsJson.map((app) => {
                const isInstalled = site?.installedApps?.some(
                  (installed) =>
                    installed.name.toLowerCase().includes(app.id.toLowerCase()) ||
                    installed.name.toLowerCase().includes(app.name.toLowerCase())
                );

                return (
                  <div
                    key={app.id}
                    className="p-3 bg-[#0e1420] border border-slate-800/80 hover:border-slate-700/80 rounded-xl flex items-center justify-between transition-all"
                  >
                    <div className="flex items-center gap-3 pr-2">
                      <div
                        className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 ${
                          isInstalled
                            ? 'bg-emerald-950/40 border-emerald-800/50 text-emerald-400'
                            : 'bg-[#181325] border-purple-800/40 text-purple-400'
                        }`}
                      >
                        {isInstalled ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : (
                          <Terminal className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-xs font-semibold text-white flex items-center gap-2">
                          {app.name}
                          <span className="text-[9px] bg-slate-800 text-slate-400 border border-slate-700 px-1.5 py-0.2 rounded font-mono">
                            v{app.version}
                          </span>
                        </h3>
                        <p className="text-[10px] font-mono text-slate-500 mt-0.5 line-clamp-1">
                          {app.description}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0">
                      {isInstalled ? (
                        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/50 border border-emerald-800/40 px-2 py-1 rounded">
                          Installed
                        </span>
                      ) : (
                        <button
                          onClick={() => handleInstallOneClick(app)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-[10.5px] font-medium transition-all cursor-pointer shadow-md shadow-purple-950/50 active:scale-95"
                        >
                          <Download className="w-3 h-3" />
                          Install
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer Modal Info */}
            <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-500 font-mono">
              <span>Target: {site?.sshUser}@{site?.endpoint}</span>
              <span className="text-purple-400">WebSocket Direct Execution</span>
            </div>

          </div>
        </div>
      )}
    </>
  );
}