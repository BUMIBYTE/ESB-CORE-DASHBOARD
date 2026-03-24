import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

function Layout() {
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Sidebar tetap di posisi (Fixed-like behavior via Flex) */}
      <Sidebar />

      {/* Area Konten Utama */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Top Navbar (Opsional tapi sangat disarankan untuk Dashboard) */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold bg-slate-100 text-slate-500 px-2 py-1 rounded">
              System ID: PK-MON-01
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-400 hover:text-blue-600 transition-colors">
              <span>🔔</span>
            </button>
            <div className="h-8 w-[1px] bg-slate-200 mx-2"></div>
            <span className="text-sm font-medium text-slate-700">Administrator</span>
          </div>
        </header>

        {/* Main Scrollable Content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
          <div className="max-w-[1600px] mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default Layout;