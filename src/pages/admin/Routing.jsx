import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import {
  FolderPlus, Folder, Plus, X, Trash2, Search,
  FileCode, Layers, Monitor, HardDrive, Loader2,
  Terminal, Activity, Play, Square, Save, XCircle,
  Eye, Code2, TerminalIcon, ChevronDown
} from 'lucide-react';
import { BaseUrlTest, BaseUrlBB, BaseUrlItacha } from '../../api/apiservice';

const Routing = () => {
  const BASE_URL = BaseUrlItacha
   + "/jbang";

  // --- STATE DATA ---
  const [folders, setFolders] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [files, setFiles] = useState([]);
  const [activeJobs, setActiveJobs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // --- STATE UI & TABS ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [loadingAction, setLoadingAction] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('code'); // 'code' | 'visual'

  // --- STATE EDITOR & VERSIONING ---
  const [editingFile, setEditingFile] = useState(null);
  const [editorContent, setEditorContent] = useState('');
  const [liveContent, setLiveContent] = useState('');
  const [versions, setVersions] = useState([]);
  const [isVersionsLoading, setIsVersionsLoading] = useState(false);
  const [previewVersion, setPreviewVersion] = useState(null);

  // --- STATE FORM ---
  const [newFileName, setNewFileName] = useState('');
  const [newFolderName, setNewFolderName] = useState('');

  // --- STATE LOGS & TERMINAL ---
  const [showTerminal, setShowTerminal] = useState(false);
  const [terminalLogs, setTerminalLogs] = useState([]);
  const [activeLogId, setActiveLogId] = useState(null);
  const [activeLogFileName, setActiveLogFileName] = useState('');
  const [lastActivity, setLastActivity] = useState(null);
  const scrollRef = useRef(null);
  const isAutoScrollEnabled = useRef(true); // Flag untuk cek apakah user sedang scroll manual

  // 1. DATA FETCHING
  const fetchFolders = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/folders`);
      const data = res.data.data || [];
      const filtered = data.filter(f => f.name !== '.versions');
      setFolders(filtered);
      if (filtered.length > 0 && !selectedFolder) {
        handleSelectFolder(filtered[0].name);
      }
    } catch (err) { console.error("Error folders:", err); }
  };

  const fetchJobs = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/jobs`);
      setActiveJobs(res.data.data || []);
    } catch (err) { console.error("Error jobs:", err); }
  };

  const fetchFiles = async (folderName) => {
    try {
      const res = await axios.get(`${BASE_URL}/folder?path=${folderName}`);
      setFiles(res.data.data.files || []);
    } catch (err) { setFiles([]); }
  };

  const fetchFileVersions = async (filePath) => {
    setIsVersionsLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/file/versions?path=${encodeURIComponent(filePath)}`);
      setVersions(res.data.data || []);
    } catch (err) { setVersions([]); }
    finally { setIsVersionsLoading(false); }
  };

  // --- LOG FETCHING LOGIC ---
  const fetchLogs = async (jobId) => {
    try {
      const res = await axios.get(`${BASE_URL}/logs/${jobId}`);
      setTerminalLogs(res.data || []);
    } catch (err) {
      console.error("Error logs:", err);
    }
  };

  // --- HELPER: COLORIZE LOGS ---
  const renderLogLine = (log) => {
    if (log.toLowerCase().includes('error') || log.toLowerCase().includes('exception')) {
      return <span className="text-rose-400 font-bold">{log}</span>;
    }
    if (log.toLowerCase().includes('warn')) {
      return <span className="text-amber-300">{log}</span>;
    }
    if (log.toLowerCase().includes('info')) {
      return <span className="text-emerald-400">{log}</span>;
    }
    // Highlight URIs or Paths
    return <span className="text-slate-300">{log}</span>;
  };

  const handleOpenTerminal = (job) => {
    setActiveLogId(job.id);
    setActiveLogFileName(job.filePath.split('/').pop());
    setShowTerminal(true);
    setTerminalLogs(["Initializing connection to shell..."]);
    isAutoScrollEnabled.current = true; // Reset auto-scroll saat buka baru
  };

  const handleSelectFolder = (name) => {
    setSelectedFolder(name);
    fetchFiles(name);
    fetchJobs();
    setEditingFile(null);
  };

  // 2. FOLDER & FILE ACTIONS
  const handleCreateFolder = async () => {
    if (!newFolderName) return;
    try {
      await axios.post(`${BASE_URL}/folder?name=${newFolderName}`);
      setNewFolderName('');
      setIsFolderModalOpen(false);
      fetchFolders();
    } catch (err) { alert("Gagal membuat folder."); }
  };

  const handleDeleteFolder = async (e, folderName) => {
    e.stopPropagation();
    if (!window.confirm(`Hapus workspace "${folderName}"?`)) return;
    try {
      await axios.delete(`${BASE_URL}/folder?path=${folderName}`);
      if (selectedFolder === folderName) setSelectedFolder(null);
      fetchFolders();
    } catch (err) { alert("Gagal menghapus folder."); }
  };

  const handleDeleteFile = async (e, fileName) => {
    e.stopPropagation();
    const fullPath = `${selectedFolder}/${fileName}`;
    if (activeJobs.some(j => j.filePath === fullPath)) {
      alert("⚠️ Rute sedang aktif! Matikan (STOP) rute sebelum menghapus file.");
      return;
    }
    if (!window.confirm(`Apakah Anda yakin ingin menghapus file ${fileName}?`)) return;
    try {
      await axios.delete(`${BASE_URL}/file?path=${fullPath}`);
      if (editingFile?.name === fileName) setEditingFile(null);
      fetchFiles(selectedFolder);
    } catch (err) { alert("Gagal menghapus file."); }
  };

  const handleReadFile = async (fileName) => {
    const fullPath = `${selectedFolder}/${fileName}`;
    try {
      const res = await axios.get(`${BASE_URL}/read?path=${encodeURIComponent(fullPath)}`);
      if (res.data.code === 200) {
        const content = res.data.data.content || '';
        setEditingFile({ name: fileName, path: fullPath });
        setEditorContent(content);
        setLiveContent(content);
        setPreviewVersion(null);
        setActiveTab('code');
        fetchFileVersions(fullPath);
      }
    } catch (err) { alert("Gagal membaca file."); }
  };

  const handleSaveFile = async () => {
    if (!editingFile) return;
    setIsSaving(true);
    try {
      await axios.put(
        `${BASE_URL}/file?path=${encodeURIComponent(editingFile.path)}`,
        editorContent,
        { headers: { 'Content-Type': 'application/json' } }
      );
      setLiveContent(editorContent);
      fetchFileVersions(editingFile.path);
      alert("✅ Saved!");
    } catch (err) { alert("Gagal menyimpan."); }
    finally { setIsSaving(false); }
  };

  // 3. VERSIONING LOGIC
  const handlePreviewVersion = async (versionName) => {
    if (previewVersion === versionName) return;
    try {
      const res = await axios.get(`${BASE_URL}/file/read-version?path=${encodeURIComponent(editingFile.path)}&version=${versionName}`);
      if (res.data.code === 200) {
        setPreviewVersion(versionName);
        setEditorContent(res.data.data.content || '');
      }
    } catch (err) { alert("Gagal memuat versi."); }
  };

  const handleExitPreview = () => {
    setPreviewVersion(null);
    setEditorContent(liveContent);
  };

  const handleRestoreVersion = async (versionName) => {
    if (!window.confirm(`Restore ke versi ${versionName}?`)) return;
    try {
      const res = await axios.post(`${BASE_URL}/file/restore?path=${encodeURIComponent(editingFile.path)}&version=${versionName}`);
      if (res.data.code === 200) {
        alert("✅ Restored!");
        handleReadFile(editingFile.name);
      }
    } catch (err) { alert("Restore gagal."); }
  };

  // 4. VISUALIZER PARSER
  const parseRouteToNodes = (yamlString) => {
    try {
      const nodes = [];
      const fromMatch = yamlString.match(/from:\s*uri:\s*['"]?([^'"]+)['"]?/);
      if (fromMatch) nodes.push({ type: 'source', label: fromMatch[1], icon: <Play size={20} /> });

      const stepRegex = /-\s*(log|setBody|to|choice|split|filter|marshal|unmarshal):/g;
      let match;
      while ((match = stepRegex.exec(yamlString)) !== null) {
        let label = match[1].toUpperCase();
        if (label === 'TO') {
          const nextPart = yamlString.slice(match.index);
          const uriMatch = nextPart.match(/uri:\s*['"]?([^'"]+)['"]?/);
          if (uriMatch) label = `TO: ${uriMatch[1]}`;
        }
        nodes.push({ type: 'process', label, icon: <Activity size={20} /> });
      }
      return nodes;
    } catch (e) { return []; }
  };

  // 5. DEPLOY & RUN
  const handleDeployFile = async () => {
    if (!newFileName) return;
    try {
      const defaultYaml = "- from:\n    uri: 'timer:yaml?period=5000'\n    steps:\n      - setBody:\n          constant: 'Hello from Primakom ESB'\n      - log: '${body}'";
      await axios.post(`${BASE_URL}/file?folder=${selectedFolder}&fileName=${newFileName}.yaml`, { content: defaultYaml });
      setNewFileName('');
      setIsModalOpen(false);
      fetchFiles(selectedFolder);
    } catch (err) { alert("Gagal create file."); }
  };

  const handleStartRoute = async (fileName) => {
    const port = prompt("Target Port:", "3000");
    if (!port) return;
    setLoadingAction(fileName);
    try {
      await axios.post(`${BASE_URL}/run?path=${encodeURIComponent(selectedFolder + '/' + fileName)}&port=${port}`);
      setTimeout(fetchJobs, 2000);
    } catch (err) { alert("Run gagal."); }
    finally { setLoadingAction(null); }
  };

  const handleStopRoute = async (fileName) => {
    const job = activeJobs.find(j => j.filePath === `${selectedFolder}/${fileName}`);
    if (!job) return;
    setLoadingAction(fileName);
    try {
      await axios.post(`${BASE_URL}/stop?jobId=${job.id}`);
      setTimeout(fetchJobs, 1500);
    } catch (err) { alert("Stop gagal."); }
    finally { setLoadingAction(null); }
  };

  // --- USE EFFECTS ---
  useEffect(() => {
    fetchFolders();
    const interval = setInterval(fetchJobs, 5000);
    return () => clearInterval(interval);
  }, []);

  // Polling Logs every 1s
  useEffect(() => {
    let logInterval;
    if (showTerminal && activeLogId) {
      logInterval = setInterval(() => {
        fetchLogs(activeLogId);
      }, 1000);
    }
    return () => {
      clearInterval(logInterval);
      setTerminalLogs([]); // Clear logs saat tutup
    };
  }, [showTerminal, activeLogId]);

  // Handle User Scroll Manual
  const handleScroll = (e) => {
    const element = e.target;
    // Cek apakah user sedang berada di paling bawah (toleransi 20px)
    const isAtBottom = element.scrollHeight - element.scrollTop <= element.clientHeight + 20;
    isAutoScrollEnabled.current = isAtBottom;
  };

  // Auto-scroll logic (Hanya jalan jika user tidak scroll ke atas)
  useEffect(() => {
    if (isAutoScrollEnabled.current && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [terminalLogs]);

  return (
    <div className="flex h-screen bg-[#f8fafc] font-sans text-slate-900 overflow-hidden text-sm">

      {/* --- SIDEBAR --- */}
      <aside className="w-80 bg-white border-r border-slate-200 flex flex-col shadow-sm">
        <div className="p-8 border-b border-slate-50">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-indigo-600 rounded-lg text-white shadow-lg"><Layers size={18} /></div>
              <h2 className="font-black text-slate-800 uppercase tracking-tighter">Workspace</h2>
            </div>
            <button onClick={() => setIsFolderModalOpen(true)} className="p-2 bg-indigo-50 hover:bg-indigo-600 text-indigo-600 hover:text-white rounded-xl transition-all"><FolderPlus size={18} /></button>
          </div>
          <div className="space-y-1.5 overflow-y-auto max-h-[70vh] custom-scrollbar">
            {folders.map((f) => (
              <div key={f.name} onClick={() => handleSelectFolder(f.name)} className={`group flex items-center justify-between px-4 py-3.5 rounded-2xl cursor-pointer transition-all ${selectedFolder === f.name ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' : 'text-slate-500 hover:bg-slate-50'}`}>
                <div className="flex items-center gap-3 truncate">
                  <Folder size={18} fill={selectedFolder === f.name ? "white" : "none"} />
                  <span className="font-black tracking-tight truncate">{f.name}</span>
                </div>
                <button onClick={(e) => handleDeleteFolder(e, f.name)} className={`p-1.5 opacity-0 group-hover:opacity-100 transition-all ${selectedFolder === f.name ? 'text-white' : 'text-rose-400'}`}><Trash2 size={14} /></button>
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* --- MAIN SECTION --- */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-24 bg-white/70 backdrop-blur-xl border-b border-slate-100 px-10 flex items-center justify-between z-10">
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tighter">{selectedFolder || "Select Workspace"}</h1>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Route Registry</p>
          </div>
          <button disabled={!selectedFolder} onClick={() => setIsModalOpen(true)} className={`px-6 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl transition-all ${!selectedFolder ? 'bg-slate-100 text-slate-300' : 'bg-slate-900 hover:bg-indigo-600 text-white shadow-indigo-100'}`}>
            <Plus size={16} strokeWidth={4} className="mr-2 inline" /> New Route
          </button>
        </header>

        <section className="flex-1 p-10 bg-[#fbfcfd] overflow-y-auto">
          {selectedFolder && (
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100">
                    <th className="px-10 py-6">Identity</th>
                    <th className="px-10 py-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {files.filter(f => f.name.toLowerCase().includes(searchTerm.toLowerCase())).map((file) => {
                    const job = activeJobs.find(j => j.filePath === `${selectedFolder}/${file.name}`);
                    const isRunning = !!job;
                    const port = isRunning ? job.port : null;

                    return (
                      <tr key={file.name} onClick={() => handleReadFile(file.name)} className="hover:bg-slate-50/80 transition-all group cursor-pointer">
                        <td className="px-10 py-6 flex items-center gap-5">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${isRunning ? 'bg-emerald-50 text-emerald-500 border-emerald-100 animate-pulse' : 'bg-slate-50 text-slate-400 border-slate-100'}`}><FileCode size={18} /></div>
                          <div>
                            <div className="font-black text-slate-700 tracking-tight">{file.name}</div>
                            <div className="text-[9px] text-slate-400 font-bold uppercase mt-1">{isRunning ? `Running port: ${port}` : 'Idle'}</div>
                          </div>
                        </td>
                        <td className="px-10 py-6 text-right" onClick={e => e.stopPropagation()}>
                          <div className="flex justify-end gap-3">
                            {isRunning ? (
                              <>
                                <button
                                  onClick={() => handleOpenTerminal(job)}
                                  className="p-2 bg-slate-900 text-slate-300 rounded-xl border border-slate-700 hover:text-indigo-400 transition-all"
                                  title="View Live Logs"
                                >
                                  <Terminal size={14} />
                                </button>
                                <button onClick={() => handleStopRoute(file.name)} className="p-2 bg-rose-50 text-rose-600 rounded-xl border border-rose-100">
                                  <Square size={14} fill="currentColor" />
                                </button>
                              </>
                            ) : (
                              <button onClick={() => handleStartRoute(file.name)} className="p-2 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
                                <Play size={14} fill="currentColor" />
                              </button>
                            )}
                            <button onClick={(e) => handleDeleteFile(e, file.name)} disabled={isRunning} className="p-2 text-slate-400 hover:text-rose-500"><Trash2 size={16} /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      {/* --- MODAL EDITOR, DIFF & VISUALIZER --- */}
      {editingFile && (
        <div className="fixed inset-0 z-[150] bg-slate-900/90 backdrop-blur-xl flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-300">
          <div className={`w-full h-full max-w-[1600px] bg-[#1e1e1e] rounded-[3rem] shadow-2xl flex flex-col overflow-hidden border-[12px] transition-all duration-500 ${previewVersion ? 'border-amber-500/10' : 'border-[#1e1e1e]'}`}>

            <div className={`p-8 flex justify-between items-center border-b transition-colors duration-500 ${previewVersion ? 'bg-amber-950/20 border-amber-500/20' : 'bg-[#1e1e1e] border-slate-800'}`}>
              <div className="flex items-center gap-6">
                <div className={`p-4 rounded-2xl ${previewVersion ? 'bg-amber-500/20 text-amber-500' : 'bg-indigo-600/20 text-indigo-400'}`}><FileCode size={28} /></div>
                <div>
                  <h2 className="text-white font-black text-2xl tracking-tighter">{editingFile.name}</h2>
                  <div className="flex items-center gap-4 mt-2">
                    <button onClick={() => setActiveTab('code')} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === 'code' ? 'bg-indigo-600 text-white' : 'text-slate-500 bg-white/5 hover:bg-white/10'}`}><Code2 size={12} /> Code</button>
                    <button onClick={() => setActiveTab('visual')} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === 'visual' ? 'bg-indigo-600 text-white' : 'text-slate-500 bg-white/5 hover:bg-white/10'}`}><Eye size={12} /> Visualizer</button>
                  </div>
                </div>
              </div>
              <div className="flex gap-4">
                {previewVersion ? (
                  <>
                    <button onClick={handleExitPreview} className="px-6 py-3 text-slate-400 hover:text-white text-xs font-black uppercase">Cancel</button>
                    <button onClick={() => handleRestoreVersion(previewVersion)} className="px-8 py-4 bg-amber-600 text-white rounded-2xl text-xs font-black hover:bg-amber-500 shadow-xl">RESTORE</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => setEditingFile(null)} className="p-3 text-slate-500 hover:text-rose-500"><X size={32} /></button>
                    <button onClick={handleSaveFile} disabled={isSaving} className="px-10 py-4 bg-indigo-600 text-white rounded-2xl text-xs font-black hover:bg-indigo-500 shadow-xl active:scale-95 uppercase tracking-widest">
                      {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} Save
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
              {activeTab === 'code' && (
                <div className="w-64 border-r border-slate-800 bg-[#1a1a1a] flex flex-col shrink-0 animate-in slide-in-from-left duration-300">
                  <div className="p-6 border-b border-slate-800 text-[10px] font-black text-slate-500 uppercase tracking-widest">Version History</div>
                  <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
                    {isVersionsLoading ? <Loader2 size={20} className="animate-spin text-slate-700 mx-auto mt-10" /> : versions.map((v) => (
                      <div key={v} onClick={() => handlePreviewVersion(v)} className={`p-4 rounded-[1.5rem] cursor-pointer transition-all border ${previewVersion === v ? 'bg-amber-600/20 border-amber-500/50' : 'bg-slate-800/20 border-transparent hover:border-slate-700'}`}>
                        <div className={`text-[11px] font-mono truncate ${previewVersion === v ? 'text-amber-400' : 'text-slate-400'}`}>{v}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex-1 flex overflow-hidden bg-[#161616] relative">
                {activeTab === 'code' ? (
                  previewVersion ? (
                    (() => {
                      const liveLines = liveContent.split('\n');
                      const backupLines = editorContent.split('\n');
                      const maxLines = Math.max(liveLines.length, backupLines.length);
                      return (
                        <>
                          <div className="flex-1 border-r border-slate-800 flex flex-col bg-[#141414] overflow-hidden">
                            <div className="px-8 py-3 bg-slate-900/80 border-b border-slate-800 text-[9px] font-black text-slate-500 uppercase">Live Content</div>
                            <div className="flex-1 overflow-y-auto custom-scrollbar p-0 font-mono text-[13px] leading-relaxed">
                              {Array.from({ length: maxLines }).map((_, i) => (
                                <div key={`l-${i}`} className={`flex ${liveLines[i] !== backupLines[i] ? 'bg-rose-500/10' : ''}`}>
                                  <span className="w-12 text-right pr-4 text-slate-800 select-none border-r border-slate-800/50">{i + 1}</span>
                                  <pre className={`pl-4 ${liveLines[i] !== backupLines[i] ? 'text-rose-400 font-bold' : 'text-slate-600 opacity-40'}`}>{liveLines[i] || ''}</pre>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="flex-1 flex flex-col bg-[#1e1e1e] overflow-hidden">
                            <div className="px-8 py-3 bg-amber-950/40 border-b border-amber-500/20 text-[9px] font-black text-amber-500 uppercase">Backup Preview</div>
                            <div className="flex-1 overflow-y-auto custom-scrollbar p-0 font-mono text-[13px] leading-relaxed">
                              {Array.from({ length: maxLines }).map((_, i) => (
                                <div key={`b-${i}`} className={`flex ${liveLines[i] !== backupLines[i] ? 'bg-emerald-500/10' : ''}`}>
                                  <span className="w-12 text-right pr-4 text-slate-600 select-none border-r border-slate-700/30">{i + 1}</span>
                                  <pre className={`pl-4 ${liveLines[i] !== backupLines[i] ? 'text-emerald-400 font-bold' : 'text-amber-100/70'}`}>{backupLines[i] || ''}</pre>
                                </div>
                              ))}
                            </div>
                          </div>
                        </>
                      );
                    })()
                  ) : (
                    <textarea spellCheck="false" autoFocus className="flex-1 p-10 bg-transparent text-[#d4d4d4] outline-none font-mono text-base resize-none custom-scrollbar" value={editorContent} onChange={(e) => setEditorContent(e.target.value)} />
                  )
                ) : (
                  <div className="flex-1 p-20 flex flex-col items-center overflow-y-auto custom-scrollbar bg-[#111] bg-[radial-gradient(#222_1px,transparent_1px)] [background-size:25px_25px] animate-in zoom-in duration-500">
                    {parseRouteToNodes(editorContent).length > 0 ? (
                      parseRouteToNodes(editorContent).map((node, index, arr) => (
                        <React.Fragment key={index}>
                          <div className="relative">
                            <div className={`w-72 p-6 rounded-3xl border-2 transition-all duration-500 flex flex-col items-center gap-4 shadow-2xl ${node.type === 'source' ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-400' : 'bg-slate-800/50 border-slate-700 text-slate-300'}`}>
                              <div className="p-4 bg-white/5 rounded-2xl">{node.icon}</div>
                              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-center px-4 leading-relaxed">{node.label}</span>
                            </div>
                            {activeJobs.some(j => j.filePath === editingFile.path) && (
                              <div className="absolute -inset-2 bg-indigo-500/10 blur-2xl rounded-full animate-pulse -z-10"></div>
                            )}
                          </div>
                          {index < arr.length - 1 && (
                            <div className="py-6 flex flex-col items-center">
                              <div className="w-0.5 h-16 bg-gradient-to-b from-indigo-500 to-slate-700 relative">
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-indigo-400 rounded-full animate-[bounce_2s_infinite]"></div>
                              </div>
                            </div>
                          )}
                        </React.Fragment>
                      ))
                    ) : (
                      <div className="text-slate-600 font-black uppercase tracking-[0.3em] opacity-20 mt-20">No Route Logic Detected</div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ENHANCED TERMINAL POPUP */}
      <div className={`fixed bottom-0 left-0 right-0 bg-[#020617] border-t border-slate-800 transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] z-[200] shadow-[0_-30px_60px_rgba(0,0,0,0.8)] ${showTerminal ? 'h-[450px]' : 'h-0 overflow-hidden'}`}>
        
        {/* TERMINAL HEADER */}
        <div className="flex items-center justify-between px-8 py-4 bg-slate-950/50 backdrop-blur-md border-b border-white/5">
          <div className="flex items-center gap-6">
            <div className="flex gap-2.5">
              <div className="w-3.5 h-3.5 rounded-full bg-rose-500/80 shadow-[0_0_10px_rgba(244,63,94,0.4)]"></div>
              <div className="w-3.5 h-3.5 rounded-full bg-amber-500/80 shadow-[0_0_10px_rgba(245,158,11,0.4)]"></div>
              <div className="w-3.5 h-3.5 rounded-full bg-emerald-500/80 shadow-[0_0_10px_rgba(16,185,129,0.4)]"></div>
            </div>
            <div className="h-6 w-[1px] bg-slate-800"></div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] flex items-center gap-2">
                <TerminalIcon size={12} /> {activeLogFileName}
              </span>
              <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">
                Session ID: {activeLogId?.slice(0,8)}... • {lastActivity ? `Last log: ${lastActivity}` : 'Awaiting data'}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {!isAutoScrollEnabled.current && (
                <button 
                  onClick={() => { isAutoScrollEnabled.current = true; scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }}
                  className="group flex items-center gap-2 text-[9px] bg-indigo-600 text-white px-4 py-2 rounded-full font-black uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/20 animate-bounce"
                >
                  <ChevronDown size={14} /> New Logs Below
                </button>
            )}
            <button onClick={() => setShowTerminal(false)} className="p-2 text-slate-500 hover:text-white hover:bg-white/5 rounded-xl transition-all">
                <XCircle size={24} />
            </button>
          </div>
        </div>

        {/* TERMINAL BODY */}
        <div className="relative h-[calc(100%-60px)] group">
          {/* Efek CRT/Scanline (Opsional untuk estetika) */}
          <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.02),rgba(0,255,0,0.01),rgba(0,0,255,0.02))] bg-[length:100%_4px,3px_100%] z-10 opacity-30"></div>
          
          <div 
            ref={scrollRef}
            onScroll={handleScroll}
            className="p-10 font-mono text-[13px] leading-[1.8] overflow-y-auto h-full custom-scrollbar bg-[#020617] relative z-0"
          >
            {terminalLogs.length > 0 ? (
              terminalLogs.map((log, idx) => (
                <div key={idx} className="flex gap-8 hover:bg-white/5 px-2 rounded transition-colors group/line">
                  <span className="text-slate-700 select-none w-10 text-right shrink-0 font-bold tabular-nums group-hover/line:text-indigo-400 transition-colors">
                    {idx + 1}
                  </span>
                  <div className="whitespace-pre-wrap break-all tracking-tight">
                    {renderLogLine(log)}
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-6">
                <div className="relative">
                    <Loader2 size={40} className="animate-spin text-indigo-500/20" />
                    <Activity size={20} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-500 animate-pulse" />
                </div>
                <p className="font-black text-[10px] text-slate-600 uppercase tracking-[0.4em]">Establishing Secure Link...</p>
              </div>
            )}
            <div className="h-12"></div>
          </div>
        </div>
      </div>

      {/* --- MODALS CREATE --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white w-full max-w-md rounded-[3rem] p-10 shadow-2xl animate-in zoom-in duration-300 text-center">
            <FileCode size={48} className="text-indigo-600 mx-auto mb-6" />
            <h3 className="font-black text-slate-800 text-xl mb-8 uppercase tracking-tighter">New Route File</h3>
            <div className="flex items-center gap-3 mb-8">
              <input className="flex-1 px-8 py-5 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-indigo-500 outline-none font-bold" placeholder="route-name" value={newFileName} onChange={(e) => setNewFileName(e.target.value)} autoFocus />
              <span className="text-slate-300 font-black italic">.yaml</span>
            </div>
            <div className="flex gap-4">
              <button onClick={() => setIsModalOpen(false)} className="flex-1 py-4 font-black text-slate-400 uppercase tracking-widest text-[10px]">Cancel</button>
              <button onClick={handleDeployFile} className="flex-1 bg-slate-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl hover:bg-indigo-600 transition-all">Create</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL WORKSPACE */}
      {isFolderModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-sm rounded-[3rem] p-10 shadow-2xl animate-in zoom-in duration-300">
            <h3 className="font-black text-slate-800 text-xl mb-8 uppercase text-center tracking-tighter">New Workspace</h3>
            <input className="w-full px-6 py-5 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-indigo-500 outline-none font-bold mb-8" placeholder="Workspace Name" value={newFolderName} onChange={(e) => setNewFolderName(e.target.value)} autoFocus />
            <div className="flex gap-4">
              <button onClick={() => setIsFolderModalOpen(false)} className="flex-1 py-4 font-black text-slate-400 uppercase tracking-widest text-[10px]">Cancel</button>
              <button onClick={handleCreateFolder} className="flex-1 bg-slate-900 text-white py-4 rounded-2xl font-black shadow-xl hover:bg-indigo-600 transition-all uppercase tracking-widest text-[10px]">Create</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Routing;