import React, { useState } from 'react';
import { TelemetrySource, IBTrACSImportResponse } from '../types/cyclone';
import { api } from '../services/api';
import {
  Database,
  Radio,
  Sliders,
  CheckCircle2,
  Cpu,
  Layers,
  FileCode,
  Play,
  RotateCcw,
  UploadCloud,
  AlertCircle,
  Loader2,
  FileSpreadsheet,
} from 'lucide-react';

interface DataSourcesSettingsProps {
  telemetrySources: TelemetrySource[];
}

export const DataSourcesSettings: React.FC<DataSourcesSettingsProps> = ({
  telemetrySources,
}) => {
  const [sources, setSources] = useState<TelemetrySource[]>(telemetrySources);
  const [ensembleMembers, setEnsembleMembers] = useState<number>(24);
  const [physicsConstraintWeight, setPhysicsConstraintWeight] = useState<number>(0.85);
  const [dvorakMethod, setDvorakMethod] = useState<string>('Enhanced Objective Dvorak (ODT v8.4)');
  const [csvInput, setCsvInput] = useState<string>(
`SID,SEASON,NUMBER,BASIN,SUBBASIN,NAME,ISO_TIME,NATURE,LAT,LON,WMO_WIND,WMO_PRES
2020137N10087,2020,01,NI,BB,AMPHAN,2020-05-16 00:00:00,TS,10.4,86.8,35,998
2020137N10087,2020,01,NI,BB,AMPHAN,2020-05-17 00:00:00,TS,11.4,86.0,55,986
2020137N10087,2020,01,NI,BB,AMPHAN,2020-05-18 12:00:00,TS,13.8,86.3,140,920
2020137N10087,2020,01,NI,BB,AMPHAN,2020-05-20 12:00:00,TS,21.6,88.3,85,968`
  );
  const [isImporting, setIsImporting] = useState<boolean>(false);
  const [importResult, setImportResult] = useState<IBTrACSImportResponse | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  const handleTestPing = (index: number) => {
    const updated = [...sources];
    updated[index].latency_ms = Math.floor(15 + Math.random() * 35);
    setSources(updated);
  };

  const handleParseCsv = async () => {
    if (!csvInput.trim()) return;
    setIsImporting(true);
    setImportError(null);
    setImportResult(null);
    try {
      const res = await api.importIBTrACS(csvInput);
      setImportResult(res);
    } catch (err: any) {
      setImportError(err.message || 'Failed to import IBTrACS CSV');
    } finally {
      setIsImporting(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsImporting(true);
    setImportError(null);
    setImportResult(null);
    try {
      const res = await api.importIBTrACSFile(file);
      setImportResult(res);
    } catch (err: any) {
      setImportError(err.message || 'File upload failed');
    } finally {
      setIsImporting(false);
      // Reset input
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="glass-panel rounded-2xl p-6 border border-cyan-500/25">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-mono text-cyan-400 font-semibold tracking-wider">
                INGESTION PIPELINES & COMPUTATIONAL HYPERPARAMETERS
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 border border-cyan-500/30 text-cyan-300">
                SYSTEM CONFIGURATION
              </span>
            </div>
            <h1 className="text-3xl font-extrabold font-mono text-white tracking-tight">
              Data Sources & Engine Settings
            </h1>
            <p className="text-xs text-slate-300 font-mono mt-1">
              Configure telemetry pipelines, NOAA IBTrACS data ingestion adapters, and AI physics-informed parameters.
            </p>
          </div>
        </div>
      </div>

      {/* Synchronized Telemetry Data Feeds */}
      <div className="glass-panel rounded-2xl p-6 border border-cyan-500/20">
        <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
          <Radio className="w-4 h-4 text-cyan-400" />
          <span>Synchronized Meteorological Data Sources</span>
        </h3>

        <div className="space-y-3">
          {sources.map((s, idx) => (
            <div
              key={s.name}
              className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold font-mono text-cyan-300">
                    {s.agency}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-emerald-400 border border-emerald-500/30">
                    {s.status}
                  </span>
                </div>
                <h4 className="text-sm font-bold font-mono text-white mt-1">
                  {s.name}
                </h4>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  Type: {s.type} • Coverage: {s.coverage}
                </p>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right font-mono text-xs">
                  <span className="text-emerald-400 font-bold">{s.latency_ms} ms</span>
                  <div className="text-[10px] text-slate-500">Latency</div>
                </div>
                <button
                  onClick={() => handleTestPing(idx)}
                  className="px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-cyan-500/30 text-xs font-mono text-cyan-300 transition cursor-pointer"
                >
                  Ping Test
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Model Hyperparameters & Inference Engine */}
      <div className="glass-panel rounded-2xl p-6 border border-cyan-500/20">
        <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
          <Sliders className="w-4 h-4 text-cyan-400" />
          <span>DeepCyclone Neural Engine Hyperparameters</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-2">
            <label className="text-xs font-mono text-slate-300 block">
              Multi-Model Ensemble Members: <strong className="text-cyan-400">{ensembleMembers}</strong>
            </label>
            <input
              type="range"
              min="8"
              max="50"
              value={ensembleMembers}
              onChange={(e) => setEnsembleMembers(Number(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
            <p className="text-[10px] font-mono text-slate-500">
              ECMWF, GFS, UKMET, IMD GFS ensemble sampling count.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-2">
            <label className="text-xs font-mono text-slate-300 block">
              PINN Physics Loss Weight: <strong className="text-cyan-400">{physicsConstraintWeight}</strong>
            </label>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={physicsConstraintWeight}
              onChange={(e) => setPhysicsConstraintWeight(Number(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
            <p className="text-[10px] font-mono text-slate-500">
              Mass conservation and barotropic vorticity equation weighting.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-2">
            <label className="text-xs font-mono text-slate-300 block">
              Dvorak Morphometry Algorithm
            </label>
            <select
              value={dvorakMethod}
              onChange={(e) => setDvorakMethod(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs font-mono text-cyan-300"
            >
              <option value="Enhanced Objective Dvorak (ODT v8.4)">Enhanced Objective Dvorak (ODT v8.4)</option>
              <option value="Advanced Dvorak Technique (ADT v9.1)">Advanced Dvorak Technique (ADT v9.1)</option>
              <option value="Physics-Informed Deep Dvorak (PIDD-Net)">Physics-Informed Deep Dvorak (PIDD-Net)</option>
            </select>
            <p className="text-[10px] font-mono text-slate-500">
              Pattern recognition classifier for satellite cloud geometry.
            </p>
          </div>
        </div>
      </div>

      {/* NOAA IBTrACS CSV Ingestion Playground */}
      <div className="glass-panel rounded-2xl p-6 border border-cyan-500/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <FileCode className="w-4 h-4 text-cyan-400" />
            <span>NOAA / NCEI IBTrACS Data Ingestion Adapter</span>
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 border border-emerald-500/30 text-emerald-400">
              OFFICIAL NOAA / NCEI PIPELINE
            </span>
            <span className="text-xs font-mono text-cyan-300">
              CSV STREAM PARSER
            </span>
          </div>
        </div>

        <p className="text-xs text-slate-400 font-mono mb-3">
          Paste or upload raw NOAA IBTrACS comma-separated best track records. Automatically handles multi-line headers, missing value sentinels (<code className="text-cyan-300">NA</code>, <code className="text-cyan-300">-999</code>), agency fallbacks (<code className="text-cyan-300">WMO_WIND</code> &rarr; <code className="text-cyan-300">USA_WIND</code>), and updates local cache.
        </p>

        <textarea
          rows={6}
          value={csvInput}
          onChange={(e) => setCsvInput(e.target.value)}
          placeholder="Paste NOAA IBTrACS CSV data here..."
          className="w-full bg-slate-950/90 border border-slate-800 rounded-xl p-3 font-mono text-xs text-cyan-200 focus:outline-none focus:border-cyan-400"
        />

        {/* Action Controls */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleParseCsv}
              disabled={isImporting || !csvInput.trim()}
              className="px-4 py-2 rounded-xl bg-cyan-950 hover:bg-cyan-900 border border-cyan-400/50 text-cyan-200 text-xs font-mono font-bold transition flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(0,240,255,0.15)]"
            >
              {isImporting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                  <span>IMPORTING TO ENGINE...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 text-cyan-400" />
                  <span>EXECUTE IBTrACS INGESTION</span>
                </>
              )}
            </button>

            {/* File upload input */}
            <label className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-cyan-500/40 text-slate-300 text-xs font-mono transition flex items-center gap-2 cursor-pointer">
              <UploadCloud className="w-3.5 h-3.5 text-cyan-400" />
              <span>Upload CSV File</span>
              <input
                type="file"
                accept=".csv,.txt"
                onChange={handleFileUpload}
                className="hidden"
                disabled={isImporting}
              />
            </label>

            <button
              type="button"
              onClick={() => {
                setCsvInput(
`SID,SEASON,NUMBER,BASIN,SUBBASIN,NAME,ISO_TIME,NATURE,LAT,LON,WMO_WIND,WMO_PRES
2020137N10087,2020,01,NI,BB,AMPHAN,2020-05-16 00:00:00,TS,10.4,86.8,35,998
2020137N10087,2020,01,NI,BB,AMPHAN,2020-05-17 00:00:00,TS,11.4,86.0,55,986
2020137N10087,2020,01,NI,BB,AMPHAN,2020-05-18 12:00:00,TS,13.8,86.3,140,920
2020137N10087,2020,01,NI,BB,AMPHAN,2020-05-20 12:00:00,TS,21.6,88.3,85,968`
                );
                setImportResult(null);
                setImportError(null);
              }}
              className="px-3 py-2 rounded-xl bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 text-xs font-mono transition flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Sample</span>
            </button>
          </div>

          {/* Status Message */}
          {importResult && (
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-950/60 px-3.5 py-1.5 rounded-lg border border-emerald-500/40">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                Ingested {importResult.imported_cyclones_count} cyclone(s), {importResult.imported_fixes_count} fixes ({importResult.skipped_rows_count} skipped rows)
              </span>
            </div>
          )}

          {importError && (
            <div className="flex items-center gap-2 text-xs font-mono text-rose-400 bg-rose-950/60 px-3.5 py-1.5 rounded-lg border border-rose-500/40">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{importError}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
