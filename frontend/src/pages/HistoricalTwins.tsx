import React, { useState, useMemo } from 'react';
import type { CycloneDetail, HistoricalTwin } from '../types/cyclone';
import { CycloneMap } from '../components/map/CycloneMap';
import {
  Waves,
  Home,
  ArrowRight,
  Search,
  Filter,
  Database,
  Calendar,
  Compass,
} from 'lucide-react';

interface HistoricalTwinsPageProps {
  cyclone: CycloneDetail;
  twins: HistoricalTwin[];
}

export const HistoricalTwins: React.FC<HistoricalTwinsPageProps> = ({
  cyclone,
  twins,
}) => {
  const [selectedTwinId, setSelectedTwinId] = useState<string>(
    twins[0]?.cyclone_id || ''
  );
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedBasin, setSelectedBasin] = useState<string>('ALL');
  const [selectedYear, setSelectedYear] = useState<string>('ALL');

  // Filter available basins and years from the twins list
  const availableBasins = useMemo(() => {
    return Array.from(new Set(twins.map((t) => t.basin)));
  }, [twins]);

  const availableYears = useMemo(() => {
    return Array.from(new Set(twins.map((t) => t.year))).sort((a, b) => b - a);
  }, [twins]);

  // Filter twins according to search query, basin, and year
  const filteredTwins = useMemo(() => {
    return twins.filter((t) => {
      const matchesSearch =
        searchQuery === '' ||
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.cyclone_id.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesBasin =
        selectedBasin === 'ALL' || t.basin.toLowerCase().includes(selectedBasin.toLowerCase());

      const matchesYear =
        selectedYear === 'ALL' || t.year.toString() === selectedYear;

      return matchesSearch && matchesBasin && matchesYear;
    });
  }, [twins, searchQuery, selectedBasin, selectedYear]);

  // Active twin to display
  const selectedTwin =
    filteredTwins.find((t) => t.cyclone_id === selectedTwinId) ||
    filteredTwins[0] ||
    twins[0];

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="glass-panel rounded-2xl p-6 border border-cyan-500/25">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-mono text-cyan-400 font-semibold tracking-wider">
                HISTORICAL TWIN ANALOGUE MATCHER
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 border border-cyan-500/30 text-cyan-300">
                NOAA IBTrACS ARCHIVE
              </span>
            </div>
            <h1 className="text-3xl font-extrabold font-mono text-white tracking-tight">
              Historical Analogues: {cyclone.name}
            </h1>
            <p className="text-xs text-slate-300 font-mono mt-1">
              Multi-attribute similarity matching against 40+ years of quality-controlled NOAA IBTrACS data.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-slate-400 bg-slate-900/60 px-3 py-1.5 rounded-xl border border-slate-800">
            <Database className="w-4 h-4 text-cyan-400" />
            <span>Dataset: IBTrACS v04r00 Official Best Tracks</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel rounded-xl p-4 border border-cyan-500/20 flex flex-wrap items-center justify-between gap-3">
        {/* Search input */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search cyclone by name or ID (e.g. Amphan, Fani, Mocha)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950/80 border border-slate-800 focus:border-cyan-400 rounded-lg pl-9 pr-3 py-1.5 text-xs font-mono text-cyan-200 placeholder:text-slate-500 focus:outline-none"
          />
        </div>

        {/* Basin filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-cyan-400" />
          <select
            value={selectedBasin}
            onChange={(e) => setSelectedBasin(e.target.value)}
            className="bg-slate-950/80 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-400 cursor-pointer"
          >
            <option value="ALL">All Basins</option>
            {availableBasins.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>

        {/* Year filter */}
        <div className="flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5 text-cyan-400" />
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="bg-slate-950/80 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-400 cursor-pointer"
          >
            <option value="ALL">All Years</option>
            {availableYears.map((yr) => (
              <option key={yr} value={yr.toString()}>
                {yr}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Grid: Twin Selector List & Active Twin Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Twin Selector Cards */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-1">
            <span>FILTERED ANALOGUES ({filteredTwins.length})</span>
            <span className="text-[10px] text-cyan-400">SORTED BY SIMILARITY</span>
          </div>

          <div className="space-y-2.5 max-h-[620px] overflow-y-auto pr-1 custom-scrollbar">
            {filteredTwins.length === 0 ? (
              <div className="p-8 text-center text-xs font-mono text-slate-500 bg-slate-900/40 rounded-xl border border-slate-800">
                No historical cyclone matches found with current search filters.
              </div>
            ) : (
              filteredTwins.map((t) => {
                const isSelected = t.cyclone_id === selectedTwin?.cyclone_id;
                return (
                  <div
                    key={t.cyclone_id}
                    onClick={() => setSelectedTwinId(t.cyclone_id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-cyan-950/80 border-cyan-400 shadow-[0_0_20px_rgba(0,240,255,0.15)]'
                        : 'bg-slate-900/60 border-slate-800 hover:border-cyan-500/40 hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold font-mono text-white">
                            {t.name}
                          </span>
                          <span className="text-xs font-mono text-cyan-300">
                            ({t.year})
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 font-mono mt-0.5">
                          {t.peak_category} • {t.basin}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono mt-1">
                          Peak Wind: {t.peak_wind_kmh} km/h • Pressure: {t.min_pressure_hpa} hPa
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-lg font-extrabold font-mono text-cyan-300">
                          {t.overall_similarity_pct}%
                        </span>
                        <div className="text-[9px] font-mono text-slate-400">
                          SIMILARITY
                        </div>
                      </div>
                    </div>

                    {/* Similarity Progress */}
                    <div className="w-full bg-slate-950 rounded-full h-1.5 mt-3 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          isSelected ? 'bg-cyan-400' : 'bg-slate-600'
                        }`}
                        style={{ width: `${t.overall_similarity_pct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Detailed Twin Feature Match & Track Comparison */}
        <div className="lg:col-span-7 space-y-6">
          {selectedTwin ? (
            <>
              {/* Dual Track Comparison Map */}
              <div className="h-[360px]">
                <CycloneMap
                  track={cyclone.track}
                  activeCycloneName={cyclone.name}
                  twinTrack={selectedTwin.track_points}
                  twinName={`${selectedTwin.name} (${selectedTwin.year})`}
                  className="h-full"
                  showCone={false}
                />
              </div>

              {/* Feature Dimension Matching Breakdown */}
              <div className="glass-panel rounded-2xl p-5 border border-cyan-500/20">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider">
                    Feature Comparison: {cyclone.name} vs {selectedTwin.name}
                  </h3>
                  <span className="text-xs text-cyan-400 font-mono">
                    Multivariate Metric Match
                  </span>
                </div>

                <div className="space-y-3">
                  {selectedTwin.feature_matches.map((f) => (
                    <div
                      key={f.feature_name}
                      className="bg-slate-900/60 border border-slate-800 rounded-xl p-3"
                    >
                      <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                        <span className="text-slate-300 font-semibold">{f.feature_name}</span>
                        <span className="text-cyan-300 font-bold">{f.similarity_pct}% Match</span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-2">
                        <span>
                          {cyclone.name}: <strong className="text-white">{f.target_value} {f.unit}</strong>
                        </span>
                        <ArrowRight className="w-3 h-3 text-cyan-400" />
                        <span>
                          {selectedTwin.name}: <strong className="text-amber-300">{f.twin_value} {f.unit}</strong>
                        </span>
                      </div>

                      <div className="w-full bg-slate-950 rounded-full h-1 overflow-hidden">
                        <div
                          className="h-full bg-cyan-400 rounded-full"
                          style={{ width: `${f.similarity_pct}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Historical Landfall Impact & Preparedness Lessons */}
              <div className="glass-panel rounded-2xl p-5 border border-cyan-500/20 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider">
                    Observed Precedent Impact ({selectedTwin.name} {selectedTwin.year})
                  </h3>
                  <span className="text-[10px] font-mono text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded bg-emerald-950/40">
                    VERIFIED NOAA RECORD
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-rose-400 font-mono text-xs font-bold mb-2">
                      <Waves className="w-4 h-4" />
                      <span>STORM SURGE & LANDFALL CONSEQUENCES</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed font-sans">
                      {selectedTwin.landfall_impact_summary}
                    </p>
                  </div>

                  <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-amber-400 font-mono text-xs font-bold mb-2">
                      <Home className="w-4 h-4" />
                      <span>CIVIL CASUALTIES & DAMAGE RECORD</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed font-sans">
                      {selectedTwin.casualty_economic_impact}
                    </p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="glass-panel rounded-2xl p-12 text-center text-slate-500 font-mono text-xs">
              Select a twin from the list to inspect feature comparison and track overlay.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
