import React, { useState, useEffect } from 'react';
import { CycloneDetail, ReportSummary, ReportDetail } from '../types/cyclone';
import { api } from '../services/api';
import {
  FileText,
  Download,
  PlusCircle,
  ShieldCheck,
  AlertOctagon,
  RefreshCw,
  ExternalLink,
  Printer,
  CheckCircle,
} from 'lucide-react';

interface AnalysisReportsProps {
  cyclone: CycloneDetail;
}

export const AnalysisReports: React.FC<AnalysisReportsProps> = ({ cyclone }) => {
  const [reports, setReports] = useState<ReportSummary[]>([]);
  const [selectedReport, setSelectedReport] = useState<ReportDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [generating, setGenerating] = useState<boolean>(false);

  useEffect(() => {
    loadReports();
  }, [cyclone.id]);

  const loadReports = async () => {
    setLoading(true);
    try {
      const list = await api.getReports();
      setReports(list);
      if (list.length > 0) {
        const detail = await api.getReport(list[0].report_id);
        setSelectedReport(detail);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectReport = async (reportId: string) => {
    try {
      const detail = await api.getReport(reportId);
      setSelectedReport(detail);
    } catch (err) {
      console.error(err);
    }
  };

  const handleGenerateReport = async () => {
    setGenerating(true);
    try {
      const newReport = await api.generateReport(cyclone.id);
      setSelectedReport(newReport);
      const list = await api.getReports();
      setReports(list);
    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  const handleDownloadMarkdown = () => {
    if (!selectedReport) return;
    window.open(`/api/reports/${selectedReport.report_id}/download`, '_blank');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="glass-panel rounded-2xl p-6 border border-cyan-500/25">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-mono text-cyan-400 font-semibold tracking-wider">
                TACTICAL INTELLIGENCE & CIVIL DEFENSE DOSSIER
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 border border-cyan-500/30 text-cyan-300">
                OFFICIAL REPORT COMPILER
              </span>
            </div>
            <h1 className="text-3xl font-extrabold font-mono text-white tracking-tight">
              Analysis & Situation Reports
            </h1>
            <p className="text-xs text-slate-300 font-mono mt-1">
              Multi-agency briefing documents with storm impact modeling, twin analogue risk extrapolation, and evacuation zoning.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleGenerateReport}
              disabled={generating}
              className="px-4 py-2.5 rounded-xl bg-cyan-950 hover:bg-cyan-900 border border-cyan-400/50 text-cyan-200 text-xs font-mono font-bold transition flex items-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(0,240,255,0.15)] disabled:opacity-50"
            >
              {generating ? (
                <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
              ) : (
                <PlusCircle className="w-4 h-4 text-cyan-400" />
              )}
              <span>{generating ? 'COMPILING REPORT...' : 'GENERATE ADVISORY REPORT'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Layout: Reports List & Active Document Reader */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Reports Index Sidebar */}
        <div className="lg:col-span-4 space-y-3">
          <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-2">
            Available Reports ({reports.length})
          </h3>

          <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
            {reports.map((r) => {
              const isSelected = r.report_id === selectedReport?.report_id;
              return (
                <div
                  key={r.report_id}
                  onClick={() => handleSelectReport(r.report_id)}
                  className={`p-4 rounded-xl border transition cursor-pointer ${
                    isSelected
                      ? 'bg-cyan-950/80 border-cyan-400 shadow-[0_0_20px_rgba(0,240,255,0.15)]'
                      : 'bg-slate-900/60 border-slate-800 hover:border-cyan-500/40 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-cyan-300 font-bold">
                      {r.report_id.slice(0, 16)}...
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400 font-semibold">
                      {r.status}
                    </span>
                  </div>
                  <h4 className="text-xs font-mono font-bold text-white mt-1 line-clamp-1">
                    {r.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 font-mono mt-1">
                    Target: {r.cyclone_name} • {r.basin}
                  </p>
                  <div className="mt-2 text-[10px] text-slate-500 font-mono">
                    Created: {r.created_at.slice(0, 16).replace('T', ' ')} UTC
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Report Document Viewer */}
        <div className="lg:col-span-8">
          {selectedReport ? (
            <div className="glass-panel rounded-2xl p-6 lg:p-8 border border-cyan-500/25 space-y-6">
              {/* Report Header Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-cyan-500/20">
                <div>
                  <span className="text-[10px] font-mono px-2.5 py-1 rounded bg-cyan-950 border border-cyan-500/40 text-cyan-300 font-bold tracking-wider">
                    {selectedReport.classification_level}
                  </span>
                  <h2 className="text-xl font-bold font-mono text-white mt-2">
                    {selectedReport.title}
                  </h2>
                  <div className="text-xs font-mono text-slate-400 mt-1">
                    Report ID: <code className="text-cyan-300">{selectedReport.report_id}</code> • Valid: {selectedReport.created_at.slice(0, 16).replace('T', ' ')} UTC
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleDownloadMarkdown}
                    className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-mono text-slate-200 transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Download MD</span>
                  </button>
                  <button
                    onClick={handlePrint}
                    className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-mono text-slate-200 transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5 text-slate-400" />
                    <span>Print</span>
                  </button>
                </div>
              </div>

              {/* Section 1: Executive Summary */}
              <div>
                <h3 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider mb-2">
                  1. Executive Summary & Synoptic Findings
                </h3>
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-200 leading-relaxed font-sans">
                  {selectedReport.summary_findings}
                </div>
              </div>

              {/* Section 2: Key Telemetry Metrics */}
              <div>
                <h3 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider mb-2">
                  2. Critical Operational Metrics
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                  <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-lg">
                    <span className="text-slate-400 block text-[10px]">PEAK WINDS</span>
                    <strong className="text-white text-sm">{selectedReport.metrics.current_winds_kmh} km/h</strong>
                  </div>
                  <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-lg">
                    <span className="text-slate-400 block text-[10px]">CENTRAL MSLP</span>
                    <strong className="text-rose-300 text-sm">{selectedReport.metrics.current_pressure_hpa} hPa</strong>
                  </div>
                  <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-lg">
                    <span className="text-slate-400 block text-[10px]">EYE DIAMETER</span>
                    <strong className="text-cyan-300 text-sm">{selectedReport.metrics.eye_diameter_km} km</strong>
                  </div>
                  <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-lg">
                    <span className="text-slate-400 block text-[10px]">DVORAK T-NO</span>
                    <strong className="text-amber-300 text-sm">T{selectedReport.metrics.dvorak_t_number}</strong>
                  </div>
                </div>
              </div>

              {/* Section 3: Historical Analogue Findings */}
              <div>
                <h3 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider mb-2">
                  3. Historical Twin Analogue Benchmarking
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed font-sans bg-slate-900/40 p-3 rounded-xl border border-slate-800">
                  {selectedReport.historical_twin_comparison}
                </p>
              </div>

              {/* Section 4: Preparedness Directives */}
              <div>
                <h3 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider mb-2">
                  4. Disaster Preparedness & Civil Protection Directives
                </h3>
                <div className="space-y-2">
                  {selectedReport.disaster_preparedness_recommendations.map((rec, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-200"
                    >
                      <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span className="leading-relaxed font-mono">{rec}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 5: Evacuation Zones */}
              <div>
                <h3 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider mb-2">
                  5. Evacuation Zoning Protocol
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {selectedReport.evacuation_zones.map((zone, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/20 text-xs font-mono text-cyan-200 leading-relaxed"
                    >
                      {zone}
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 6: Official Disclaimer & Limitations */}
              <div className="bg-amber-950/40 border border-amber-500/30 rounded-xl p-4 text-[11px] font-mono text-amber-200/90 leading-relaxed">
                <strong>OFFICIAL METEOROLOGICAL DISCLAIMER:</strong> {selectedReport.limitations_and_disclaimers}
              </div>
            </div>
          ) : (
            <div className="glass-panel rounded-2xl p-12 text-center text-slate-500 font-mono text-xs">
              No report selected. Choose a report from the list or generate a new one.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
