import React, { ReactNode } from 'react';

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  subtitle?: string;
  icon?: ReactNode;
  trend?: string;
  trendUp?: boolean;
  highlight?: boolean;
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  unit,
  subtitle,
  icon,
  trend,
  trendUp,
  highlight = false,
  className = '',
}) => {
  return (
    <div
      className={`glass-panel rounded-xl p-4 transition-all duration-300 ${
        highlight
          ? 'border-cyan-400/40 bg-cyan-950/20 shadow-[0_0_20px_rgba(0,240,255,0.08)]'
          : 'hover:border-cyan-500/30'
      } ${className}`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs uppercase tracking-wider font-mono text-slate-400">
          {title}
        </span>
        {icon && <div className="text-cyan-400 opacity-80">{icon}</div>}
      </div>

      <div className="flex items-baseline gap-1.5">
        <span className="text-2xl lg:text-3xl font-bold font-mono text-white tracking-tight">
          {value}
        </span>
        {unit && (
          <span className="text-xs font-mono text-cyan-300/80 uppercase">
            {unit}
          </span>
        )}
      </div>

      {(subtitle || trend) && (
        <div className="mt-2 flex items-center justify-between text-xs">
          {subtitle && <span className="text-slate-400 truncate">{subtitle}</span>}
          {trend && (
            <span
              className={`font-mono ${
                trendUp ? 'text-amber-400' : 'text-emerald-400'
              }`}
            >
              {trend}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
