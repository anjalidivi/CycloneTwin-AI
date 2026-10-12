import React, { useState, useEffect } from 'react';
import type { CycloneSummary, CycloneDetail } from '../../types/cyclone';
import { StatusBadge } from '../common/StatusBadge';
import { Clock, Info, Shield, ChevronDown, Menu } from 'lucide-react';

interface HeaderProps {
  cyclones: CycloneSummary[];
  selectedCyclone: CycloneDetail | null;
  onSelectCyclone: (id: string) => void;
  onToggleSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  cyclones,
  selectedCyclone,
  onSelectCyclone,
  onToggleSidebar,
}) => {
  const [utcTime, setUtcTime] = useState<string>('');
  const [showNotice, setShowNotice] = useState<boolean>(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setUtcTime(now.toUTCString().replace('GMT', 'UTC'));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-16 shrink-0 bg-slate-950/85 border-b border-cyan-500/20 backdrop-blur-xl px-4 sm:px-6 flex items-center justify-between z-30 select-none">
      {/* Mobile Menu & Cyclone Switcher */}
      <div className="flex items-center gap-3">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-lg bg-slate-900 border border-slate-800 text-cyan-400 hover:text-white transition cursor-pointer"
            aria-label="Toggle navigation"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div className="relative">
          <select
            value={selectedCyclone?.id || ''}
            onChange={(e) => onSelectCyclone(e.target.value)}
            className="appearance-none bg-slate-900/90 border border-cyan-500/40 rounded-xl px-3 sm:px-4 py-2 pr-8 sm:pr-10 text-xs font-mono font-bold text-cyan-300 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.1)] cursor-pointer max-w-[200px] sm:max-w-xs truncate"
          >
            {cyclones.map((c) => (
              <option key={c.id} value={c.id} className="bg-slate-950 text-white">
                {c.name} ({c.year}) — {c.status}
              </option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 text-cyan-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {selectedCyclone && (
          <div className="hidden sm:inline-flex">
            <StatusBadge origin={selectedCyclone.data_origin} />
          </div>
        )}

        {selectedCyclone && (
          <span className="hidden xl:inline-flex text-xs font-mono text-slate-400 border-l border-slate-800 pl-3">
            {selectedCyclone.basin}
          </span>
        )}
      </div>

      {/* Telemetry Clock & Decision Support Notice Button */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Real-time UTC Time */}
        <div className="hidden md:flex items-center gap-2 bg-slate-900/70 border border-slate-800 px-3 py-1.5 rounded-lg text-xs font-mono text-slate-300">
          <Clock className="w-3.5 h-3.5 text-cyan-400" />
          <span>{utcTime || 'SYNCHRONIZING UTC...'}</span>
        </div>

        {/* Disclaimer Modal Trigger */}
        <button
          onClick={() => setShowNotice(!showNotice)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-900/50 hover:border-cyan-400 transition cursor-pointer"
        >
          <Info className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden sm:inline">Advisory Notice</span>
        </button>
      </div>

      {/* Advisory Modal Popover */}
      {showNotice && (
        <div className="absolute top-16 right-4 sm:right-6 w-[90vw] max-w-sm bg-slate-950/95 border border-cyan-500/40 rounded-2xl p-5 shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-start gap-3 mb-3">
            <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                Official Operational Notice
              </h4>
              <p className="text-[11px] text-cyan-300/80 font-mono mt-0.5">
                CycloneTwin AI Intelligence Core
              </p>
            </div>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed font-sans mb-3">
            CycloneTwin AI is a research and decision-support computational platform.
            All feature representations, twin similarity vectors, and model forecasts are designed for
            analogue comparative evaluation and hazard modeling.
          </p>
          <div className="bg-amber-950/40 border border-amber-500/30 rounded-xl p-3 text-[11px] text-amber-200/90 font-mono mb-4 leading-normal">
            ⚠️ MANDATORY: This platform does NOT replace official warnings issued by national meteorological
            authorities (IMD, NOAA, JTWC, WMO RSMCs). Always follow local civil protection evacuation directives.
          </div>
          <button
            onClick={() => setShowNotice(false)}
            className="w-full py-2 rounded-xl bg-cyan-950 hover:bg-cyan-900 border border-cyan-400/50 text-cyan-200 text-xs font-mono font-bold transition cursor-pointer"
          >
            ACKNOWLEDGE & PROCEED
          </button>
        </div>
      )}
    </header>
  );
};
