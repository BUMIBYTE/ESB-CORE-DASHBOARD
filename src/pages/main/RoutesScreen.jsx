import React from 'react';

export default function SegeraHadirPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Soft Ambient Background Glow */}
      <div className="absolute w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Center Content */}
      <div className="relative z-10 text-center">
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold text-white tracking-tight leading-none mb-3">
          Segera Hadir
        </h1>
        <p className="text-slate-500 text-xs sm:text-sm font-mono uppercase tracking-[0.3em]">
          Coming Soon
        </p>
      </div>
    </div>
  );
}