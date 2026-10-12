import React from 'react';

export type TelemetryOrigin = 'LIVE_OBSERVED' | 'HISTORICAL_IBTRACS' | 'MODEL_SIMULATED' | 'MODEL_OUTPUT' | string;

interface StatusBadgeProps {
  origin: TelemetryOrigin;
  label?: string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ origin, label, className = '' }) => {
  const getBadgeConfig = () => {
    switch (origin) {
      case 'LIVE_OBSERVED':
        return {
          text: label || 'LIVE TELEMETRY',
          bg: 'bg-emerald-950/70',
          border: 'border-emerald-500/40',
          textCol: 'text-emerald-300',
          dot: 'bg-emerald-400',
          ping: true,
        };
      case 'MODEL_SIMULATED':
        return {
          text: label || 'SIMULATED LIVE (TESTBENCH)',
          bg: 'bg-cyan-950/70',
          border: 'border-cyan-500/40',
          textCol: 'text-cyan-300',
          dot: 'bg-cyan-400',
          ping: true,
        };
      case 'HISTORICAL_IBTRACS':
        return {
          text: label || 'HISTORICAL (NOAA IBTrACS)',
          bg: 'bg-amber-950/70',
          border: 'border-amber-500/40',
          textCol: 'text-amber-300',
          dot: 'bg-amber-400',
          ping: false,
        };
      case 'MODEL_OUTPUT':
        return {
          text: label || 'AI MODEL OUTPUT',
          bg: 'bg-purple-950/70',
          border: 'border-purple-500/40',
          textCol: 'text-purple-300',
          dot: 'bg-purple-400',
          ping: false,
        };
      default:
        return {
          text: label || origin,
          bg: 'bg-slate-900/70',
          border: 'border-slate-700/50',
          textCol: 'text-slate-300',
          dot: 'bg-slate-400',
          ping: false,
        };
    }
  };

  const config = getBadgeConfig();

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono tracking-wider uppercase border backdrop-blur-md ${config.bg} ${config.border} ${config.textCol} ${className}`}
    >
      <span className="relative flex h-2 w-2">
        {config.ping && (
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${config.dot}`}
          />
        )}
        <span className={`relative inline-flex rounded-full h-2 w-2 ${config.dot}`} />
      </span>
      {config.text}
    </span>
  );
};
