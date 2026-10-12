import type {
  CycloneSummary,
  CycloneDetail,
  CycloneTrackResponse,
  BasinMetadata,
  IBTrACSImportResponse,
  ForecastResult,
  TwinMatchResult,
  ImageAnalysisResponse,
  ReportSummary,
  ReportDetail,
  DashboardData
} from '../types/cyclone';

const API_BASE = '/api';

export const api = {
  async getHealth() {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) throw new Error('Failed to fetch health telemetry');
    return res.json();
  },

  async getDashboard(): Promise<DashboardData> {
    const res = await fetch(`${API_BASE}/dashboard`);
    if (!res.ok) throw new Error('Failed to fetch dashboard data');
    return res.json();
  },

  async getCyclones(params?: {
    search?: string;
    year?: number;
    basin?: string;
    origin?: string;
    min_wind?: number;
  }): Promise<CycloneSummary[]> {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.year) query.append('year', String(params.year));
    if (params?.basin) query.append('basin', params.basin);
    if (params?.origin) query.append('origin', params.origin);
    if (params?.min_wind !== undefined) query.append('min_wind', String(params.min_wind));

    const qs = query.toString();
    const url = `${API_BASE}/cyclones${qs ? `?${qs}` : ''}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch cyclone catalog');
    return res.json();
  },

  async getCycloneTrack(id: string): Promise<CycloneTrackResponse> {
    const res = await fetch(`${API_BASE}/cyclones/${id}/track`);
    if (!res.ok) throw new Error(`Failed to fetch track for ${id}`);
    return res.json();
  },

  async getBasins(): Promise<BasinMetadata[]> {
    const res = await fetch(`${API_BASE}/cyclones/meta/basins`);
    if (!res.ok) throw new Error('Failed to fetch basins metadata');
    return res.json();
  },

  async getYears(): Promise<number[]> {
    const res = await fetch(`${API_BASE}/cyclones/meta/years`);
    if (!res.ok) throw new Error('Failed to fetch years metadata');
    return res.json();
  },

  async importIBTrACS(csvData: string): Promise<IBTrACSImportResponse> {
    const res = await fetch(`${API_BASE}/cyclones/import-ibtracs`, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: csvData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Import failed' }));
      throw new Error(err.detail || 'Failed to import IBTrACS CSV');
    }
    return res.json();
  },

  async importIBTrACSFile(file: File): Promise<IBTrACSImportResponse> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE}/cyclones/import-ibtracs`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Import failed' }));
      throw new Error(err.detail || 'Failed to import IBTrACS CSV file');
    }
    return res.json();
  },

  async getCyclone(id: string): Promise<CycloneDetail> {
    const res = await fetch(`${API_BASE}/cyclones/${id}`);
    if (!res.ok) throw new Error(`Failed to fetch cyclone details for ${id}`);
    return res.json();
  },

  async getForecast(id: string): Promise<ForecastResult> {
    const res = await fetch(`${API_BASE}/cyclones/${id}/forecast`);
    if (!res.ok) throw new Error(`Failed to fetch forecast for ${id}`);
    return res.json();
  },

  async getHistoricalTwins(id: string): Promise<TwinMatchResult> {
    const res = await fetch(`${API_BASE}/cyclones/${id}/historical-twins`);
    if (!res.ok) throw new Error(`Failed to match historical twins for ${id}`);
    return res.json();
  },

  async uploadSatelliteImage(file: File): Promise<ImageAnalysisResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${API_BASE}/analysis/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Upload error' }));
      throw new Error(err.detail || 'Image processing failed');
    }
    return res.json();
  },

  async getReports(): Promise<ReportSummary[]> {
    const res = await fetch(`${API_BASE}/reports`);
    if (!res.ok) throw new Error('Failed to fetch reports list');
    return res.json();
  },

  async getReport(id: string): Promise<ReportDetail> {
    const res = await fetch(`${API_BASE}/reports/${id}`);
    if (!res.ok) throw new Error(`Failed to fetch report ${id}`);
    return res.json();
  },

  async generateReport(cycloneId: string): Promise<ReportDetail> {
    const res = await fetch(`${API_BASE}/reports/generate?cyclone_id=${cycloneId}`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to generate operational report');
    return res.json();
  },
};
