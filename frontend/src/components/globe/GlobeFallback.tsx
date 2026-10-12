import React from 'react';
import { Compass, AlertCircle } from 'lucide-react';

interface GlobeFallbackProps {
  cycloneName?: string;
  lat?: number;
  lon?: number;
}

export const GlobeFallback: React.FC<GlobeFallbackProps> = ({
  cycloneName = 'Cyclone ASNA-II',
  lat = 14.8,
  lon = 86.4,
}) => {
  return (
    <div className="relative w-full h-full min-h-[380px] rounded-2xl glass-panel overflow-hidden flex flex-col items-center justify-center p-6 bg-tech-grid">
      {/* 2D Stylized Radial Radar Display Fallback */}
      <div className="relative w-64 h-64 rounded-full border border-cyan-500/30 bg-slate-950/80 shadow-[0_0_50px_rgba(0,240,255,0.1)] flex items-center justify-center">
        {/* Radar Rings */}
        <div className="absolute inset-4 rounded-full border border-cyan-500/20" />
        <div className="absolute inset-12 rounded-full border border-cyan-500/15" />
        <div className="absolute inset-20 rounded-full border border-cyan-500/10" />

        {/* Crosshairs */}
        <div className="absolute w-full h-[1px] bg-cyan-500/20" />
        <div className="absolute h-full w-[1px] bg-cyan-500/20" />

        {/* Radar Sweep */}
        <div className="absolute inset-0 rounded-full radar-sweep-anim bg-[conic-gradient(from_0deg,transparent_0deg,transparent_270deg,rgba(0,240,255,0.25)_360deg)] pointer-events-none" />

        {/* Storm Vortex Marker */}
        <div className="relative z-10 flex flex-col items-center">
          <div className="relative">
            <span className="animate-ping absolute -inset-2 rounded-full bg-cyan-400 opacity-60" />
            <div className="w-5 h-5 rounded-full bg-cyan-400 shadow-[0_0_15px_#00f0ff] border-2 border-white" />
          </div>
          <span className="mt-2 text-xs font-mono font-bold text-cyan-300 bg-slate-900/90 px-2 py-0.5 rounded border border-cyan-500/40">
            {cycloneName}
          </span>
          <span className="text-[10px] font-mono text-slate-400">
            {lat}°N, {lon}°E
          </span>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 text-xs text-slate-400 font-mono bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-800">
        <Compass className="w-4 h-4 text-cyan-400 animate-spin" />
        <span>Geospatial Radar Vector View (Hardware Acceleration Fallback)</span>
      </div>
    </div>
  );
};
