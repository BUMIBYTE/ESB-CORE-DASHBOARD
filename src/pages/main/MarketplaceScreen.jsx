import React, { useEffect, useState } from 'react';
import { Cpu, Database, Activity, Globe, Server, RefreshCcw, LayoutDashboard, Zap, LucideMemoryStick } from 'lucide-react';
import api from '../../api/axios';

const MarketplaceScreen = ({ipAddress}) => {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
  }, []);

  return (
    <div className="p-6 md:p-10 bg-[#06090e] min-h-screen font-sans text-slate-900">
    </div>
  );
};

export default MarketplaceScreen;