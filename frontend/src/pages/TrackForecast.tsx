import React, { useState, useEffect, useMemo } from 'react';
import { CycloneDetail, ForecastResult } from '../types/cyclone';
import { api } from '../services/api';
import { CycloneMap } from '../components/map/CycloneMap';
import { MetricCard } from '../components/common/MetricCard';
import { StatusBadge } from '../components/common/StatusBadge';
import {
  TrendingUp,
  Gauge,
  Wind,
  Compass,
  AlertTriangle,
  Cpu,
  Layers,
  ShieldAlert,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';

interface TrackForecastProps {
  cyclone: CycloneDetail;
}

export const TrackForecast: React.FC<TrackForecastProps> = ({ cyclone }) => {
  const [forecast, setForecast] = useState<ForecastResult | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    api
      .getForecast(cyclone.id)
      .then((data) => {
        if (isMounted) {
          setForecast(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || 'Error loading forecast');
          setLoading(false);
        }
      });
    return () => {
      isMounted = false;
    };
  }, [cyclone.id]);

  // Combine observed track + forecast points for map display
  const combinedTrack = useMemo(() => {
    if (!forecast) return cyclone.track;
    const obs = cyclone.track.filter((p) => !p.is_forecast);
    const fcPoints = forecast.forecast_points.map((fp) => ({
      timestamp: fp.valid_time,
      lat: fp.lat,
      lon: fp.lon,
      wind_speed_kts: fp.wind_speed_kts,
      wind_speed_kmh: fp.wind_speed_kmh,
      pressure_hpa: fp.pressure_hpa,
      category: fp.category,
      status: fp.category,
      basin: cyclone.basin,
      is_forecast: true,
    }));
    return [...obs, ...fcPoints];
  }, [cyclone, forecast]);

  // Format forecast intensity projection chart data with upper and lower ensemble bounds
  const forecastChartData = useMemo(() => {
    if (!forecast) return [];
    return forecast.forecast_points.map((p) => {
      const spreadKmh = p.model_ensemble_spread_kts * 1.852;
      return {
        leadTime: `+${p.lead_hours}h`,
        wind: p.wind_speed_kmh,
        windMax: Math.round(p.wind_speed_kmh + spreadKmh),
        windMin: Math.round(Math.max(40, p.wind_speed_kmh - spreadKmh)),
        pressure: p.pressure_hpa,
        coneRadius: p.cone_radius_km,
      };
    });
  }, [forecast]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="glass-panel rounded-2xl p-6 border border-cyan-500/25">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-mono text-cyan-400 font-semibold tracking-wider">
                PHYSICS-INFORMED ENSEMBLE TRAJECTORY CORE
              </span>
              <StatusBadge origin={forecast?.status_label || 'MODEL_OUTPUT'} />
            </div>
            <h1 className="text-3xl font-extrabold font-mono text-white tracking-tight">
              Track & Intensity Projections: {cyclone.name}
            </h1>
            <p className="text-xs text-slate-300 font-mono mt-1">
              Deterministic 72-Hour Trajectory, Cone of Uncertainty, and Multi-Model Ensemble Intensity Evolution.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800 text-xs font-mono text-slate-300">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span>Core: DeepCyclone-PhysicsNet-v2.4</span>
          </div>
        </div>
      </div>

      {/* Interactive Forecast Map & Cone */}
      <div className="glass-panel rounded-2xl p-5 border border-cyan-500/20">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider">
              Ensemble Trajectory & 67% Cone of Uncertainty (0h - 72h)
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Base Time: {forecast?.base_time ? forecast.base_time.slice(0, 16).replace('T', ' ') : 'Live Fix'} UTC
          </span>
        </div>

        <div className="h-[460px]">
          <CycloneMap
            track={combinedTrack}
            activeCycloneName={cyclone.name}
            className="h-full"
            showCone={true}
          />
        </div>
      </div>

      {/* Projection Charts: Wind Speed & Barometric Pressure */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Wind Speed Projection Chart */}
        <div className="lg:col-span-7 glass-panel rounded-2xl p-5 border border-cyan-500/20">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider">
                Ensemble Sustained Wind Projection
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Projected 1-Min Max Wind (km/h) with 1-Sigma Ensemble Spread
              </p>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 border border-cyan-500/30 text-cyan-300">
              INTENSITY ENSEMBLE
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={forecastChartData}>
                <defs>
                  <linearGradient id="spreadGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00f0ff" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#00f0ff" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="leadTime" stroke="#475569" fontSize={11} tickLine={false} />
                <YAxis stroke="#475569" fontSize={11} domain={[60, 240]} tickLine={false} />
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
                  dataKey="windMax"
                  name="Ensemble Upper Bound"
                  stroke="#38bdf8"
                  strokeDasharray="3 3"
                  fill="url(#spreadGrad)"
                />
                <Area
                  type="monotone"
                  dataKey="windMin"
                  name="Ensemble Lower Bound"
                  stroke="#38bdf8"
                  strokeDasharray="3 3"
                  fill="transparent"
                />
                <Line
                  type="monotone"
                  dataKey="wind"
                  name="Mean Wind (km/h)"
                  stroke="#00f0ff"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#00f0ff' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Central Pressure Projection Chart */}
        <div className="lg:col-span-5 glass-panel rounded-2xl p-5 border border-cyan-500/20">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider">
                Barometric Pressure Drop Curve
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Projected Minimum Central Pressure (hPa)
              </p>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300">
              MSLP TENDENCY
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={forecastChartData}>
                <XAxis dataKey="leadTime" stroke="#475569" fontSize={11} tickLine={false} />
                <YAxis stroke="#475569" fontSize={11} domain={[920, 1000]} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(6, 15, 30, 0.95)',
                    borderColor: 'rgba(0, 240, 255, 0.4)',
                    borderRadius: '8px',
                    fontSize: '11px',
                    fontFamily: 'monospace',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="pressure"
                  name="Central Pressure (hPa)"
                  stroke="#f43f5e"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#f43f5e' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Forecast Coordinates Telemetry Table */}
      {forecast && (
        <div className="glass-panel rounded-2xl p-5 border border-cyan-500/20">
          <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider mb-3">
            72-Hour Numerical Track & Intensity Waypoint Schedule
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs font-mono">
              <thead>
                <tr className="border-b border-cyan-500/20 text-slate-400">
                  <th className="py-2.5 px-3">LEAD</th>
                  <th className="py-2.5 px-3">VALID TIME (UTC)</th>
                  <th className="py-2.5 px-3">COORDINATES</th>
                  <th className="py-2.5 px-3">WIND (KM/H)</th>
                  <th className="py-2.5 px-3">WIND (KTS)</th>
                  <th className="py-2.5 px-3">PRESSURE</th>
                  <th className="py-2.5 px-3">CATEGORY</th>
                  <th className="py-2.5 px-3">CONE RADIUS</th>
                  <th className="py-2.5 px-3">SPREAD</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {forecast.forecast_points.map((pt) => (
                  <tr key={pt.lead_hours} className="hover:bg-slate-900/40 transition">
                    <td className="py-2.5 px-3 font-bold text-cyan-300">+{pt.lead_hours}h</td>
                    <td className="py-2.5 px-3 text-slate-300">{pt.valid_time.slice(0, 16).replace('T', ' ')}</td>
                    <td className="py-2.5 px-3 text-white font-semibold">{pt.lat}°N, {pt.lon}°E</td>
                    <td className="py-2.5 px-3 text-cyan-400 font-bold">{pt.wind_speed_kmh}</td>
                    <td className="py-2.5 px-3 text-slate-300">{pt.wind_speed_kts}</td>
                    <td className="py-2.5 px-3 text-rose-300">{pt.pressure_hpa} hPa</td>
                    <td className="py-2.5 px-3 text-amber-300">{pt.category}</td>
                    <td className="py-2.5 px-3 text-slate-400">±{pt.cone_radius_km} km</td>
                    <td className="py-2.5 px-3 text-slate-400">±{pt.model_ensemble_spread_kts} kts</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Decision-Support Scientific Disclaimer */}
      <div className="bg-amber-950/40 border border-amber-500/30 rounded-2xl p-4 text-xs font-mono text-amber-200/90 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <div className="font-bold uppercase tracking-wider text-amber-300 mb-1">
            Operational Forecasting Disclaimer & Methodology Notice
          </div>
          <p className="leading-relaxed">
            {forecast?.disclaimer ||
              'Projections generated via DeepCyclone-PhysicsNet-v2.4 superensemble. Official warnings from national meteorological authorities take legal and operational precedence.'}
          </p>
        </div>
      </div>
    </div>
  );
};
