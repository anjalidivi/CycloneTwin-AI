import React, { useState, useEffect } from 'react';
import { api } from './services/api';
import type {
  CycloneSummary,
  CycloneDetail,
  HistoricalTwin,
  TelemetrySource,
} from './types/cyclone';
import { Sidebar, type PageId } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { OverviewDashboard } from './pages/OverviewDashboard';
import { SatelliteAnalysis } from './pages/SatelliteAnalysis';
import { PatternDNA } from './pages/PatternDNA';
import { HistoricalTwins } from './pages/HistoricalTwins';
import { TrackForecast } from './pages/TrackForecast';
import { AnalysisReports } from './pages/AnalysisReports';
import { DataSourcesSettings } from './pages/DataSourcesSettings';
import { Skeleton } from './components/common/Skeleton';
import { AlertCircle, RefreshCw } from 'lucide-react';

export function App() {
  const [activePage, setActivePage] = useState<PageId>('overview');
  const [cyclones, setCyclones] = useState<CycloneSummary[]>([]);
  const [selectedCyclone, setSelectedCyclone] = useState<CycloneDetail | null>(null);
  const [twins, setTwins] = useState<HistoricalTwin[]>([]);
  const [telemetrySources, setTelemetrySources] = useState<TelemetrySource[]>([]);
  const [systemStatus, setSystemStatus] = useState<string>('ALL SYSTEMS NOMINAL');
  const [isSidebarOpenMobile, setIsSidebarOpenMobile] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Initial load: retrieve unified dashboard payload
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getDashboard();
      setSelectedCyclone(data.active_cyclone);
      setCyclones(data.cyclone_catalog);
      setTwins(data.historical_twins);
      setTelemetrySources(data.telemetry_sources);
      setSystemStatus(data.system_health.status);
    } catch (err: any) {
      console.error(err);
      setError(
        'Unable to connect to CycloneTwin AI backend API. Ensure the Python FastAPI server is running on port 8000.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Switch active cyclone
  const handleSelectCyclone = async (cycloneId: string) => {
    try {
      const detail = await api.getCyclone(cycloneId);
      setSelectedCyclone(detail);
      const twinRes = await api.getHistoricalTwins(cycloneId);
      setTwins(twinRes.twins);
    } catch (err) {
      console.error('Failed to switch cyclone', err);
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500 selection:text-black">
      {/* Sidebar Navigation */}
      <Sidebar
        activePage={activePage}
        onSelectPage={setActivePage}
        systemStatus={systemStatus}
        isOpenMobile={isSidebarOpenMobile}
        onCloseMobile={() => setIsSidebarOpenMobile(false)}
      />

      {/* Main Command Center Body */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(14,116,144,0.12),rgba(3,7,18,0))]">
        {/* Top Header */}
        <Header
          cyclones={cyclones}
          selectedCyclone={selectedCyclone}
          onSelectCyclone={handleSelectCyclone}
          onToggleSidebar={() => setIsSidebarOpenMobile(!isSidebarOpenMobile)}
        />

        {/* Scrollable Viewport */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 sm:py-6 custom-scrollbar">
          {loading ? (
            <div className="space-y-6">
              <Skeleton className="h-28 w-full rounded-2xl" />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Skeleton className="h-24 rounded-xl" />
                <Skeleton className="h-24 rounded-xl" />
                <Skeleton className="h-24 rounded-xl" />
                <Skeleton className="h-24 rounded-xl" />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <Skeleton className="lg:col-span-5 h-96 rounded-2xl" />
                <Skeleton className="lg:col-span-7 h-96 rounded-2xl" />
              </div>
            </div>
          ) : error ? (
            <div className="glass-panel rounded-2xl p-8 border border-rose-500/30 text-center max-w-lg mx-auto mt-16 space-y-4">
              <AlertCircle className="w-12 h-12 text-rose-400 mx-auto" />
              <h2 className="text-lg font-mono font-bold text-white">
                API Connection Issue
              </h2>
              <p className="text-xs text-slate-400 font-mono leading-relaxed">
                {error}
              </p>
              <button
                onClick={loadDashboardData}
                className="px-4 py-2 rounded-xl bg-rose-950 hover:bg-rose-900 border border-rose-500/40 text-xs font-mono text-rose-200 transition inline-flex items-center gap-2 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry Connection</span>
              </button>
            </div>
          ) : selectedCyclone ? (
            <>
              {activePage === 'overview' && (
                <OverviewDashboard
                  cyclone={selectedCyclone}
                  twins={twins}
                  telemetrySources={telemetrySources}
                  onNavigateToPage={setActivePage}
                />
              )}

              {activePage === 'analysis' && <SatelliteAnalysis />}

              {activePage === 'dna' && <PatternDNA cyclone={selectedCyclone} />}

              {activePage === 'twins' && (
                <HistoricalTwins cyclone={selectedCyclone} twins={twins} />
              )}

              {activePage === 'forecast' && (
                <TrackForecast cyclone={selectedCyclone} />
              )}

              {activePage === 'reports' && (
                <AnalysisReports cyclone={selectedCyclone} />
              )}

              {activePage === 'settings' && (
                <DataSourcesSettings telemetrySources={telemetrySources} />
              )}
            </>
          ) : null}
        </main>
      </div>
    </div>
  );
}

export default App;
