import React from 'react';
import {
  Activity,
  Radar,
  Dna,
  GitCompare,
  TrendingUp,
  FileText,
  Database,
  ShieldAlert,
  X,
} from 'lucide-react';

export type PageId =
  | 'overview'
  | 'analysis'
  | 'dna'
  | 'twins'
  | 'forecast'
  | 'reports'
  | 'settings';

interface SidebarProps {
  activePage: PageId;
  onSelectPage: (page: PageId) => void;
  systemStatus?: string;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activePage,
  onSelectPage,
  systemStatus = 'ALL SYSTEMS NOMINAL',
  isOpenMobile = false,
  onCloseMobile,
}) => {
  const navItems: { id: PageId; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'overview', label: 'Command Overview', icon: <Activity className="w-4 h-4" /> },
    { id: 'analysis', label: 'Satellite Analysis', icon: <Radar className="w-4 h-4" />, badge: 'AI-CV' },
    { id: 'dna', label: 'Cyclone Pattern DNA', icon: <Dna className="w-4 h-4" /> },
    { id: 'twins', label: 'Historical Twins', icon: <GitCompare className="w-4 h-4" />, badge: 'IBTrACS' },
    { id: 'forecast', label: 'Track & Intensity', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'reports', label: 'Analysis Reports', icon: <FileText className="w-4 h-4" /> },
    { id: 'settings', label: 'Sources & Settings', icon: <Database className="w-4 h-4" /> },
  ];

  const handleNavClick = (id: PageId) => {
    onSelectPage(id);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <>
      {/* Mobile backdrop overlay */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 w-64 shrink-0 bg-slate-950/95 border-r border-cyan-500/20 backdrop-blur-2xl flex flex-col justify-between p-4 z-50 select-none transition-transform duration-300 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div>
          {/* Brand Header */}
          <div className="flex items-center justify-between px-2 py-3 mb-6 border-b border-cyan-500/15">
            <div className="flex items-center gap-3">
              <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-400/50 shadow-[0_0_20px_rgba(0,240,255,0.3)]">
                <span className="animate-spin text-cyan-400">🌀</span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold font-mono tracking-tight text-white text-base">
                    CYCLONE<span className="text-cyan-400">TWIN</span>
                  </span>
                  <span className="text-[10px] font-mono px-1 py-0.2 bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 rounded font-semibold">
                    AI
                  </span>
                </div>
                <p className="text-[10px] font-mono text-slate-400 tracking-wider">
                  GEOSPATIAL INTEL CORE
                </p>
              </div>
            </div>

            {/* Mobile close button */}
            {onCloseMobile && (
              <button
                onClick={onCloseMobile}
                className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-mono transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-400/40 shadow-[0_0_15px_rgba(0,240,255,0.15)] font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={isActive ? 'text-cyan-400' : 'text-slate-400'}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wider ${
                        isActive
                          ? 'bg-cyan-500/30 text-cyan-200 border border-cyan-400/40'
                          : 'bg-slate-900 text-slate-400 border border-slate-800'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Operational Disclaimer & System Health Footnote */}
        <div className="space-y-3 pt-4 border-t border-cyan-500/15">
          <div className="bg-slate-900/60 rounded-xl p-3 border border-cyan-500/10">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-mono text-slate-400">STATUS</span>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-[10px] font-mono text-emerald-400 font-semibold">
                  NOMINAL
                </span>
              </div>
            </div>
            <div className="text-[10px] font-mono text-slate-400 truncate">
              {systemStatus}
            </div>
            <div className="mt-2 text-[9px] text-slate-400 flex items-center gap-1">
              <ShieldAlert className="w-3 h-3 text-cyan-400" />
              <span>Decision Support System</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
