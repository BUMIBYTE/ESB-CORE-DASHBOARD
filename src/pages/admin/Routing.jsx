import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  FolderPlus, Folder, Plus, X, Trash2, Search,
  FileCode, Layers, Monitor, HardDrive, Loader2, 
  Terminal, Activity, Play, Square, Save, XCircle
} from 'lucide-react';

const Routing = () => {
  const BASE_URL = "http://localhost:5001/api/v1/jbang";

  // --- STATE DATA ---
  const [folders, setFolders] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [files, setFiles] = useState([]); 
  const [activeJobs, setActiveJobs] = useState([]); 
  const [searchTerm, setSearchTerm] = useState('');

  // --- STATE UI ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [loadingAction, setLoadingAction] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // --- STATE EDITOR ---
  const [editingFile, setEditingFile] = useState(null); 
  const [editorContent, setEditorContent] = useState('');
  
  // --- STATE FORM ---
  const [newFileName, setNewFileName] = useState(''); 
  const [newFolderName, setNewFolderName] = useState('');

  // 1. DATA FETCHING
  const fetchFolders = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/folders`);
      const data = res.data.data || [];
      setFolders(data);
      if (data.length > 0 && !selectedFolder) {
        handleSelectFolder(data[0].name);
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

  const handleSelectFolder = (name) => {
    setSelectedFolder(name);
    fetchFiles(name);
    fetchJobs();
    setEditingFile(null); // Reset editor saat ganti folder
  };

  // 2. FOLDER ACTIONS
  const handleCreateFolder = async () => {
    if (!newFolderName) return;
    try {
      await axios.post(`${BASE_URL}/folder?name=${newFolderName}`);
      setNewFolderName('');
      setIsFolderModalOpen(false);
      fetchFolders();
    } catch (err) { alert("Gagal membuat folder baru."); }
  };

  const handleDeleteFolder = async (e, folderName) => {
    e.stopPropagation(); 
    if (!window.confirm(`Hapus workspace "${folderName}" beserta seluruh isinya?`)) return;
    try {
      await axios.delete(`${BASE_URL}/folder?path=${folderName}`);
      if (selectedFolder === folderName) setSelectedFolder(null);
      fetchFolders();
    } catch (err) { alert("Gagal menghapus folder."); }
  };

  // 3. EDITOR ACTIONS (READ & UPDATE)
  const handleReadFile = async (fileName) => {
    const fullPath = `${selectedFolder}/${fileName}`;
    try {
      const res = await axios.get(`${BASE_URL}/read?path=${encodeURIComponent(fullPath)}`);
      if (res.data.code === 200) {
        setEditingFile({ name: fileName, path: fullPath });
        setEditorContent(res.data.data.content || '');
      }
    } catch (err) {
      alert("Gagal membaca isi file.");
    }
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
      alert("✅ File saved successfully!");
    } catch (err) {
      alert("Gagal menyimpan perubahan file.");
    } finally {
      setIsSaving(false);
    }
  };

  // 4. FILE ACTIONS
  const handleDeployFile = async () => {
    if (!newFileName) return;
    try {
      const defaultYaml = "- from:\n    uri: 'timer:yaml?period=5000'\n    steps:\n      - setBody:\n          constant: 'Hello from Primakom ESB'\n      - log: '${body}'";
      await axios.post(`${BASE_URL}/file?folder=${selectedFolder}&fileName=${newFileName}.yaml`, { 
        content: defaultYaml 
      });
      setNewFileName(''); 
      setIsModalOpen(false);
      fetchFiles(selectedFolder);
    } catch (err) { alert("Gagal membuat file rute."); }
  };

  const handleStartRoute = async (fileName) => {
    const fullPath = `${selectedFolder}/${fileName}`;
    const port = prompt("Target Port untuk service ini:", "3000");
    if (!port) return;

    setLoadingAction(fileName);
    try {
      await axios.post(`${BASE_URL}/run?path=${encodeURIComponent(fullPath)}&port=${port}`);
      setTimeout(fetchJobs, 2000);
    } catch (err) { alert("Gagal menjalankan rute. Pastikan port tidak bentrok."); }
    finally { setLoadingAction(null); }
  };

  const handleStopRoute = async (fileName) => {
    const fullPath = `${selectedFolder}/${fileName}`;
    const job = activeJobs.find(j => j.filePath === fullPath);
    if (!job) return;

    setLoadingAction(fileName);
    try {
      await axios.get(`${BASE_URL}/stop?jobId=${job.id}`);
      setTimeout(fetchJobs, 1500);
    } catch (err) { alert("Gagal menghentikan rute."); }
    finally { setLoadingAction(null); }
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

  useEffect(() => {
    fetchFolders();
    const interval = setInterval(fetchJobs, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex h-screen bg-[#f8fafc] font-sans text-slate-900 overflow-hidden text-sm">
      
      {/* --- SIDEBAR --- */}
      <aside className="w-80 bg-white border-r border-slate-200 flex flex-col shadow-[10px_0_30px_rgba(0,0,0,0.02)]">
        <div className="p-8 border-b border-slate-50">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-indigo-600 rounded-lg text-white shadow-lg"><Layers size={18} /></div>
              <h2 className="font-black text-slate-800 uppercase tracking-tighter">Workspace</h2>
            </div>
            <button 
              onClick={() => setIsFolderModalOpen(true)} 
              className="p-2 bg-indigo-50 hover:bg-indigo-600 text-indigo-600 hover:text-white rounded-xl transition-all border border-indigo-100 shadow-sm"
              title="Add New Workspace"
            >
              <FolderPlus size={18} />
            </button>
          </div>

          <div className="space-y-1.5 overflow-y-auto max-h-[70vh] pr-2 custom-scrollbar">
            {folders.map((f) => (
              <div 
                key={f.name} 
                onClick={() => handleSelectFolder(f.name)} 
                className={`group flex items-center justify-between px-4 py-3.5 rounded-2xl cursor-pointer transition-all ${
                  selectedFolder === f.name ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3 truncate">
                  <Folder size={18} fill={selectedFolder === f.name ? "white" : "none"} strokeWidth={2.5} />
                  <span className="font-black tracking-tight truncate">{f.name}</span>
                </div>
                
                <button 
                  onClick={(e) => handleDeleteFolder(e, f.name)}
                  className={`p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all ${
                    selectedFolder === f.name ? 'text-white hover:bg-white/20' : 'text-rose-400 hover:bg-rose-50'
                  }`}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-auto p-8 border-t border-slate-50">
           <div className="flex items-center gap-2 text-indigo-500">
              <Activity size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest">Server v2.4 Active</span>
           </div>
        </div>
      </aside>

      {/* --- MAIN SECTION --- */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-24 bg-white/70 backdrop-blur-xl border-b border-slate-100 px-10 flex items-center justify-between z-10">
          <div className="flex items-center gap-8">
            <div>
              <h1 className="text-2xl font-black text-slate-800 tracking-tighter leading-none">{selectedFolder || "Select Workspace"}</h1>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Route Registry</p>
            </div>
            <div className="relative group hidden md:block">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
              <input 
                placeholder="Find route..." 
                className="pl-11 pr-6 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold w-64 outline-none focus:bg-white transition-all shadow-inner" 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
              />
            </div>
          </div>
          <button 
            disabled={!selectedFolder} 
            onClick={() => setIsModalOpen(true)} 
            className={`px-6 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl transition-all ${
              !selectedFolder ? 'bg-slate-100 text-slate-300 cursor-not-allowed' : 'bg-slate-900 hover:bg-indigo-600 text-white shadow-indigo-100'
            }`}
          >
            <Plus size={16} strokeWidth={4} className="mr-2 inline" /> New Route File
          </button>
        </header>

        <section className="flex-1 flex gap-8 p-10 bg-[#fbfcfd] overflow-hidden">
          {/* FILE TABLE */}
          <div className={`transition-all duration-500 overflow-y-auto ${editingFile ? 'w-[40%]' : 'w-full'}`}>
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
                      const isLoading = loadingAction === file.name;
                      const isEditing = editingFile?.name === file.name;

                      return (
                        <tr 
                          key={file.name} 
                          onClick={() => handleReadFile(file.name)}
                          className={`hover:bg-slate-50/80 transition-all group cursor-pointer ${isEditing ? 'bg-indigo-50/50' : ''}`}
                        >
                          <td className="px-10 py-6">
                            <div className="flex items-center gap-5">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${
                                isRunning ? 'bg-emerald-50 text-emerald-500 border-emerald-100 animate-pulse' : 'bg-slate-50 text-slate-400 border-slate-100'
                              }`}>
                                <FileCode size={18} />
                              </div>
                              <div>
                                <div className={`font-black tracking-tight ${isEditing ? 'text-indigo-600' : 'text-slate-700'}`}>{file.name}</div>
                                <div className="text-[9px] text-slate-400 font-bold uppercase mt-1">
                                  {isRunning ? `Live on Port ${job.port}` : 'Idle State'}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-10 py-6 text-right" onClick={e => e.stopPropagation()}>
                            <div className="flex justify-end gap-3">
                              {isRunning ? (
                                <button onClick={() => handleStopRoute(file.name)} disabled={isLoading} className="p-2 bg-rose-50 text-rose-600 rounded-xl border border-rose-100 hover:bg-rose-600 hover:text-white transition-all"><Square size={14} fill="currentColor" /></button>
                              ) : (
                                <button onClick={() => handleStartRoute(file.name)} disabled={isLoading} className="p-2 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100 hover:bg-emerald-600 hover:text-white transition-all"><Play size={14} fill="currentColor" /></button>
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
          </div>

          {/* EDITOR SECTION */}
          {editingFile && (
            <div className="w-[60%] flex flex-col animate-in slide-in-from-right duration-500">
               <div className="bg-[#1e1e1e] rounded-[2.5rem] shadow-2xl flex flex-col h-full overflow-hidden border-[10px] border-[#1e1e1e]">
                  <div className="p-6 bg-[#1e1e1e] flex justify-between items-center border-b border-slate-800">
                    <div className="flex flex-col">
                      <span className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-1">Source Editor</span>
                      <span className="text-white font-black text-base">{editingFile.name}</span>
                    </div>
                    <div className="flex gap-4">
                      <button onClick={() => setEditingFile(null)} className="p-2 text-slate-500 hover:text-white transition-all"><XCircle size={22}/></button>
                      <button 
                        onClick={handleSaveFile} 
                        disabled={isSaving}
                        className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-[10px] font-black hover:bg-indigo-500 flex items-center gap-2 shadow-lg shadow-indigo-900/40 transition-all active:scale-95"
                      >
                         {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} SAVE
                      </button>
                    </div>
                  </div>
                  {/* TEXTAREA EDITOR */}
                  <textarea
                    spellCheck="false"
                    className="flex-1 bg-[#1e1e1e] text-[#d4d4d4] p-8 outline-none font-mono text-sm resize-none leading-relaxed custom-scrollbar whitespace-pre"
                    value={editorContent}
                    onChange={(e) => setEditorContent(e.target.value)}
                    placeholder="Write your YAML route here..."
                  />
               </div>
            </div>
          )}
        </section>
      </main>

      {/* --- MODAL: NEW ROUTE --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-in zoom-in duration-200">
          <div className="bg-white w-full max-w-md rounded-[3rem] shadow-2xl p-10 transform animate-in zoom-in duration-300">
            <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 border border-indigo-100 shadow-sm">
              <FileCode size={32} />
            </div>
            <h3 className="font-black text-slate-800 text-xl mb-1 tracking-tight uppercase leading-none">New Route File</h3>
            <p className="text-[10px] text-slate-400 font-black mb-8 uppercase tracking-widest italic">A new .yaml will be created in {selectedFolder}</p>
            
            <div className="relative flex items-center gap-3 mb-8">
              <input 
                autoFocus
                className="flex-1 px-8 py-5 bg-slate-50 rounded-[1.5rem] border-2 border-transparent focus:border-indigo-500 focus:bg-white outline-none font-bold text-slate-700 transition-all shadow-inner" 
                placeholder="e.g. ad-sync-service" 
                value={newFileName} 
                onChange={(e) => setNewFileName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleDeployFile()}
              />
              <span className="text-slate-300 font-black italic text-lg pr-2">.yaml</span>
            </div>
            
            <div className="flex gap-4">
              <button onClick={() => setIsModalOpen(false)} className="flex-1 py-4 text-xs font-black text-slate-400 uppercase tracking-tighter hover:text-slate-600">Cancel</button>
              <button 
                onClick={handleDeployFile} 
                className="flex-1 bg-slate-900 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-indigo-600 transition-all active:scale-95"
              >
                Create File
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL: NEW WORKSPACE --- */}
      {isFolderModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-[3rem] shadow-2xl p-10 transform animate-in zoom-in duration-300">
            <h3 className="font-black text-slate-800 text-xl mb-8 tracking-tight uppercase leading-none text-center">New Workspace</h3>
            <input 
              autoFocus
              className="w-full px-6 py-5 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-indigo-500 outline-none font-bold text-slate-700 transition-all mb-8 shadow-inner"
              placeholder="Workspace Name"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
            />
            <div className="flex gap-4">
              <button onClick={() => setIsFolderModalOpen(false)} className="flex-1 py-4 text-xs font-black text-slate-400 uppercase tracking-tighter">Cancel</button>
              <button onClick={handleCreateFolder} className="flex-1 bg-slate-900 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-indigo-600 transition-all">Create</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Routing;