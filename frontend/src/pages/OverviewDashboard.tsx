import React, { useMemo } from 'react';
import { CycloneDetail, HistoricalTwin, TelemetrySource } from '../types/cyclone';
import { GlobeView } from '../components/globe/GlobeView';
import { CycloneMap } from '../components/map/CycloneMap';
import { MetricCard } from '../components/common/MetricCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { Wind, Compass, Gauge, Navigation, ArrowUpRight, Activity } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface OverviewDashboardProps {
  cyclone: CycloneDetail;
  twins: HistoricalTwin[];
  telemetrySources: TelemetrySource[];
  onNavigateToPage: (page: any) => void;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({
  cyclone,
  twins,
  telemetrySources,
  onNavigateToPage,
}) => {
  // Format track data for intensity timeline chart
  const intensityChartData = useMemo(() => {
    return cyclone.track.map((pt) => ({
      time: pt.timestamp.slice(5, 16).replace('T', ' '),
      wind: pt.wind_speed_kmh,
      pressure: pt.pressure_hpa,
      isForecast: pt.is_forecast,
    }));
  }, [cyclone]);

  return (
    <div className="space-y-6 pb-12">
      {/* Hero Header Banner */}
      <div className="glass-panel rounded-2xl p-6 relative overflow-hidden border border-cyan-500/25">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-mono text-cyan-400 font-semibold tracking-wider">
                TACTICAL SITUATION OVERVIEW
              </span>
              <StatusBadge origin={cyclone.data_origin} />
            </div>
            <h1 className="text-3xl lg:text-4xl font-extrabold font-mono text-white tracking-tight">
              {cyclone.name}
            </h1>
            <p className="text-xs font-mono text-slate-300 mt-1">
              Basin: <span className="text-cyan-300">{cyclone.basin}</span> • Season: {cyclone.season} {cyclone.year}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigateToPage('analysis')}
              className="px-4 py-2.5 rounded-xl bg-cyan-950 hover:bg-cyan-900 border border-cyan-400/50 text-cyan-200 text-xs font-mono font-bold transition shadow-[0_0_20px_rgba(0,240,255,0.15)] flex items-center gap-2 cursor-pointer"
            >
              <Activity className="w-4 h-4 text-cyan-400" />
              <span>LAUNCH AI ANALYSIS</span>
            </button>
            <button
              onClick={() => onNavigateToPage('reports')}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-mono transition flex items-center gap-2 cursor-pointer"
            >
              <span>GENERATED REPORT</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Primary Key Telemetry Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          title="MAX SUSTAINED WIND"
          value={cyclone.max_wind_kmh}
          unit="KM/H"
          subtitle={`${Math.round(cyclone.max_wind_kmh / 1.852)} Knots (1-min)`}
          icon={<Wind className="w-5 h-5" />}
          highlight={true}
        />
        <MetricCard
          title="CENTRAL PRESSURE"
          value={cyclone.min_pressure_hpa}
          unit="HPA"
          subtitle="Estimated Core MSLP"
          icon={<Gauge className="w-5 h-5" />}
        />
        <MetricCard
          title="MOTION VECTOR"
          value={`${cyclone.movement_dir} @ ${cyclone.movement_speed_kmh}`}
          unit="KM/H"
          subtitle="Forward Translation"
          icon={<Navigation className="w-5 h-5" />}
        />
        <MetricCard
          title="CURRENT COORDINATES"
          value={`${cyclone.current_lat}°N`}
          unit={`${cyclone.current_lon}°E`}
          subtitle="Estimated Center Fix"
          icon={<Compass className="w-5 h-5" />}
        />
      </div>

      {/* Centerpiece: 3D Orbital Globe & Geographic Track Map Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 3D Earth Globe Visual Centerpiece */}
        <div className="lg:col-span-5 h-[480px]">
          <GlobeView
            cycloneName={cyclone.name}
            currentLat={cyclone.current_lat}
            currentLon={cyclone.current_lon}
            windSpeedKmh={cyclone.max_wind_kmh}
            category={cyclone.category}
            track={cyclone.track}
          />
        </div>

        {/* High-Resolution Interactive Geographic Map */}
        <div className="lg:col-span-7 h-[480px]">
          <CycloneMap
            track={cyclone.track}
            activeCycloneName={cyclone.name}
            twinTrack={twins[0]?.track_points}
            twinName={twins[0]?.name}
            className="h-full"
            showCone={true}
          />
        </div>
      </div>

      {/* Intensity History & Twin Analogue Split Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Intensity Trend Line Chart */}
        <div className="lg:col-span-7 glass-panel rounded-2xl p-5 border border-cyan-500/20">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider">
                Intensity Evolution Profile
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Sustained Wind Speed (km/h) vs Central Pressure (hPa)
              </p>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 border border-cyan-500/30 text-cyan-300">
              SYNOPTIC TIMELINE
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={intensityChartData}>
                <defs>
                  <linearGradient id="windGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00f0ff" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#00f0ff" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="time"
                  stroke="#475569"
                  fontSize={10}
                  tickLine={false}
                />
                <YAxis
                  stroke="#475569"
                  fontSize={10}
                  domain={[40, 300]}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(6, 15, 30, 0.95)',
                    borderColor: 'rgba(0, 240, 255, 0.4)',
                    borderRadius: '8px',
                    fontSize: '11px',
                    fontFamily: 'monospace',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="wind"
                  name="Wind Speed (km/h)"
                  stroke="#00f0ff"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#windGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Historical Twins Quick Analogue Panel */}
        <div className="lg:col-span-5 glass-panel rounded-2xl p-5 border border-cyan-500/20 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider">
                Historical Twin Matches
              </h3>
              <button
                onClick={() => onNavigateToPage('twins')}
                className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
              >
                <span>EXPLORE ALL</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-xs text-slate-400 font-mono mb-4">
              Nearest structural and kinematic analogues from NOAA IBTrACS archive:
            </p>

            <div className="space-y-3">
              {twins.slice(0, 3).map((twin, idx) => (
                <div
                  key={twin.cyclone_id}
                  className="bg-slate-900/60 border border-slate-800 hover:border-cyan-500/40 rounded-xl p-3 transition"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-mono font-bold text-white flex items-center gap-2">
                        <span>{twin.name}</span>
                        <span className="text-[10px] text-slate-400">({twin.year})</span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {twin.peak_category} • {twin.basin}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-base font-bold font-mono text-cyan-300">
                        {twin.overall_similarity_pct}%
                      </span>
                      <div className="text-[9px] font-mono text-slate-400">
                        MATCH SCORE
                      </div>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-slate-950 rounded-full h-1.5 mt-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        idx === 0 ? 'bg-cyan-400' : 'bg-cyan-600'
                      }`}
                      style={{ width: `${twin.overall_similarity_pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] font-mono text-slate-400 flex items-center justify-between">
            <span>Algorithm: Multivariate Earth-Mover Distance</span>
            <span className="text-cyan-400 font-semibold">Quality Verified</span>
          </div>
        </div>
      </div>

      {/* Live Telemetry Data Sources Row */}
      <div className="glass-panel rounded-2xl p-5 border border-cyan-500/20">
        <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider mb-3">
          Synchronized Observational & Meteorological Feeds
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {telemetrySources.map((source) => (
            <div
              key={source.name}
              className="bg-slate-900/50 border border-slate-800/80 rounded-xl p-3"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-mono font-bold text-cyan-300 truncate">
                  {source.agency}
                </span>
                <span className="text-[10px] font-mono text-emerald-400 font-semibold">
                  {source.latency_ms}ms
                </span>
              </div>
              <div className="text-xs text-white font-medium truncate">
                {source.name}
              </div>
              <div className="text-[10px] text-slate-400 mt-1 truncate">
                {source.type}
              </div>
              <div className="mt-2 pt-2 border-t border-slate-800 text-[9px] font-mono text-slate-400 flex items-center justify-between">
                <span>{source.coverage}</span>
                <span className="text-cyan-400/80">{source.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
