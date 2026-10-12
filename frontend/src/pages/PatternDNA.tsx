import React, { useMemo } from 'react';
import { CycloneDetail } from '../types/cyclone';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { Dna, CheckCircle2, Clock, HelpCircle, ShieldAlert } from 'lucide-react';

interface PatternDNAPageProps {
  cyclone: CycloneDetail;
}

export const PatternDNA: React.FC<PatternDNAPageProps> = ({ cyclone }) => {
  const dna = cyclone.pattern_dna;

  // Multi-axial structural radar data (Target vs Historical Benchmark)
  const radarData = useMemo(() => {
    return [
      {
        subject: 'Core Compactness',
        current: Math.round(dna.structural_compactness * 100),
        benchmark: 92,
        fullMark: 100,
      },
      {
        subject: 'Convective Symmetry',
        current: Math.round((1.0 - dna.convective_asymmetry) * 100),
        benchmark: 88,
        fullMark: 100,
      },
      {
        subject: 'Spiral Curvature',
        current: Math.round(dna.spiral_banding_index * 100),
        benchmark: 94,
        fullMark: 100,
      },
      {
        subject: 'Outflow Expansion',
        current: Math.min(100, Math.round(Math.abs(dna.outflow_temperature_c))),
        benchmark: 82,
        fullMark: 100,
      },
      {
        subject: 'Shear Resilience',
        current: Math.max(0, Math.round((25 - dna.vertical_wind_shear_kts) * 4)),
        benchmark: 80,
        fullMark: 100,
      },
      {
        subject: 'Eye Definition',
        current: dna.eye_diameter_km > 0 ? 85 : 40,
        benchmark: 95,
        fullMark: 100,
      },
    ];
  }, [dna]);

  // Radial wind velocity profile (Holland vortex model approximation)
  const radialProfileData = useMemo(() => {
    const data = [];
    const rmw = dna.r_max_wind_km || 35;
    const vmax = cyclone.max_wind_kmh || 165;

    for (let r = 0; r <= 180; r += 10) {
      let v = 0;
      if (r < rmw) {
        // Eye core linear increase
        v = (r / rmw) * vmax;
      } else {
        // Outer decay via modified Rankine exponent (x = 0.5)
        v = vmax * Math.pow(rmw / r, 0.55);
      }
      data.push({
        radiusKm: r,
        windKmh: Math.round(v),
        galeThreshold: 62,
      });
    }
    return data;
  }, [dna, cyclone]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="glass-panel rounded-2xl p-6 border border-cyan-500/25">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-mono text-cyan-400 font-semibold tracking-wider">
                STRUCTURAL MORPHOMETRY & SIGNATURE MATRIX
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 border border-cyan-500/30 text-cyan-300">
                PATTERN DNA CORE
              </span>
            </div>
            <h1 className="text-3xl font-extrabold font-mono text-white tracking-tight">
              Cyclone Pattern DNA: {cyclone.name}
            </h1>
            <p className="text-xs text-slate-300 font-mono mt-1">
              Multi-dimensional decomposition of core compactness, convective symmetry, radial wind decay, and shear resistance.
            </p>
          </div>
        </div>
      </div>

      {/* Spider Chart & Radial Profile Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Radar Spider Chart */}
        <div className="lg:col-span-6 glass-panel rounded-2xl p-5 border border-cyan-500/20">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Dna className="w-4 h-4 text-cyan-400" />
              <span>Multi-Axial Pattern DNA Spider</span>
            </h3>
            <div className="flex items-center gap-3 text-[11px] font-mono">
              <span className="flex items-center gap-1.5 text-cyan-400">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                <span>{cyclone.name}</span>
              </span>
              <span className="flex items-center gap-1.5 text-rose-400">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                <span>Benchmark (Cat 5)</span>
              </span>
            </div>
          </div>

          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#475569', fontSize: 9 }} />
                <Radar
                  name={cyclone.name}
                  dataKey="current"
                  stroke="#00f0ff"
                  fill="#00f0ff"
                  fillOpacity={0.4}
                />
                <Radar
                  name="Benchmark"
                  dataKey="benchmark"
                  stroke="#f43f5e"
                  fill="#f43f5e"
                  fillOpacity={0.15}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Radial Wind Profile Chart */}
        <div className="lg:col-span-6 glass-panel rounded-2xl p-5 border border-cyan-500/20">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider">
                Radial Wind Velocity Profile
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Wind Speed (km/h) as function of Radius from Storm Eye (km)
              </p>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300">
              HOLLAND MODEL
            </span>
          </div>

          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={radialProfileData}>
                <XAxis
                  dataKey="radiusKm"
                  stroke="#475569"
                  fontSize={10}
                  tickLine={false}
                  label={{ value: 'Distance from Center (km)', position: 'insideBottom', offset: -5, fill: '#64748b', fontSize: 10 }}
                />
                <YAxis
                  stroke="#475569"
                  fontSize={10}
                  domain={[0, 200]}
                  tickLine={false}
                  label={{ value: 'Wind Speed (km/h)', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 10 }}
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
                <Line
                  type="monotone"
                  dataKey="windKmh"
                  name="Sustained Wind (km/h)"
                  stroke="#00f0ff"
                  strokeWidth={2.5}
                  dot={{ r: 2, fill: '#00f0ff' }}
                />
                <Line
                  type="monotone"
                  dataKey="galeThreshold"
                  name="Gale Force (62 km/h)"
                  stroke="#f59e0b"
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Feature Transparency Taxonomy Breakdown */}
      <div className="glass-panel rounded-2xl p-6 border border-cyan-500/20">
        <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider mb-4">
          Empirical Feature Lineage & Transparency Taxonomy
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Measured Features */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs font-bold mb-3">
              <CheckCircle2 className="w-4 h-4" />
              <span>MEASURED OBSERVATIONS</span>
            </div>
            <ul className="space-y-2 text-xs font-mono text-slate-300">
              <li className="flex justify-between border-b border-slate-800/80 pb-1">
                <span>Infrared Outflow Temp:</span>
                <span className="text-white font-bold">{dna.outflow_temperature_c}°C</span>
              </li>
              <li className="flex justify-between border-b border-slate-800/80 pb-1">
                <span>Geospatial Coordinates:</span>
                <span className="text-white font-bold">{cyclone.current_lat}°N, {cyclone.current_lon}°E</span>
              </li>
              <li className="flex justify-between border-b border-slate-800/80 pb-1">
                <span>Ambient Wind Shear:</span>
                <span className="text-white font-bold">{dna.vertical_wind_shear_kts} kts</span>
              </li>
              <li className="flex justify-between">
                <span>Translation Speed:</span>
                <span className="text-white font-bold">{cyclone.movement_speed_kmh} km/h</span>
              </li>
            </ul>
          </div>

          {/* Derived Features */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-bold mb-3">
              <Clock className="w-4 h-4" />
              <span>DERIVED PROXY METRICS</span>
            </div>
            <ul className="space-y-2 text-xs font-mono text-slate-300">
              <li className="flex justify-between border-b border-slate-800/80 pb-1">
                <span>Dvorak Technique Index:</span>
                <span className="text-white font-bold">T{dna.dvorak_t_number}</span>
              </li>
              <li className="flex justify-between border-b border-slate-800/80 pb-1">
                <span>Eyewall Diameter Proxy:</span>
                <span className="text-white font-bold">{dna.eye_diameter_km} km</span>
              </li>
              <li className="flex justify-between border-b border-slate-800/80 pb-1">
                <span>Convective Asymmetry:</span>
                <span className="text-white font-bold">{dna.convective_asymmetry}</span>
              </li>
              <li className="flex justify-between">
                <span>Radius of Max Winds:</span>
                <span className="text-white font-bold">{dna.r_max_wind_km} km</span>
              </li>
            </ul>
          </div>

          {/* Unavailable Features */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center gap-2 text-amber-400 font-mono text-xs font-bold mb-3">
              <HelpCircle className="w-4 h-4" />
              <span>CURRENTLY UNAVAILABLE</span>
            </div>
            <ul className="space-y-2 text-xs font-mono text-slate-400">
              <li className="flex justify-between border-b border-slate-800/80 pb-1">
                <span>Airborne Dropsonde Data:</span>
                <span className="text-amber-300">No active flight mission</span>
              </li>
              <li className="flex justify-between border-b border-slate-800/80 pb-1">
                <span>Stepped Frequency Radiometer:</span>
                <span className="text-amber-300">In-situ unavailable</span>
              </li>
              <li className="flex justify-between border-b border-slate-800/80 pb-1">
                <span>Subsurface Glider TCHP:</span>
                <span className="text-amber-300">Interpolated Argo proxy</span>
              </li>
              <li className="flex justify-between">
                <span>Doppler Radar Eye Velocity:</span>
                <span className="text-amber-300">Out of coastal radar range</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
