export interface TrackPoint {
  timestamp: string;
  lat: number;
  lon: number;
  wind_speed_kts?: number | null;
  wind_speed_kmh?: number | null;
  pressure_hpa?: number | null;
  category: string;
  status: string;
  basin: string;
  is_forecast: boolean;
  nature?: string;
  source_agency?: string;
  is_interpolated?: boolean;
}

export interface PatternDNA {
  eye_diameter_km: number;
  convective_asymmetry: number;
  spiral_banding_index: number;
  vertical_wind_shear_kts: number;
  outflow_temperature_c: number;
  dvorak_t_number: number;
  structural_compactness: number;
  r_max_wind_km: number;
}

export interface CycloneSummary {
  id: string;
  name: string;
  basin: string;
  year: number;
  season: string;
  status: string;
  category: string;
  data_origin: 'HISTORICAL_IBTRACS' | 'LIVE_OBSERVED' | 'MODEL_SIMULATED' | string;
  max_wind_kmh: number;
  min_pressure_hpa: number;
  current_lat: number;
  current_lon: number;
  movement_dir: string;
  movement_speed_kmh: number;
  last_updated: string;
  sid?: string;
  total_fixes?: number;
}

export interface CycloneDetail extends CycloneSummary {
  track: TrackPoint[];
  pattern_dna: PatternDNA;
  synoptic_summary: string;
  advisories: string[];
  sources: string[];
  disclaimer: string;
}

export interface CycloneTrackResponse {
  cyclone_id: string;
  cyclone_name: string;
  sid?: string;
  data_origin: string;
  total_fixes: number;
  start_time: string;
  end_time: string;
  track: TrackPoint[];
}

export interface BasinMetadata {
  code: string;
  name: string;
  cyclone_count: number;
}

export interface IBTrACSImportResponse {
  imported_cyclones_count: number;
  imported_fixes_count: number;
  skipped_rows_count: number;
  message: string;
  errors: string[];
}

export interface ForecastPoint {
  lead_hours: number;
  valid_time: string;
  lat: number;
  lon: number;
  wind_speed_kmh: number;
  wind_speed_kts: number;
  pressure_hpa: number;
  category: string;
  cone_radius_km: number;
  model_ensemble_spread_kts: number;
}

export interface ForecastResult {
  cyclone_id: string;
  cyclone_name: string;
  base_time: string;
  forecast_points: ForecastPoint[];
  model_name: string;
  model_version: string;
  uncertainty_method: string;
  is_demonstration_mode: boolean;
  status_label: string;
  disclaimer: string;
}

export interface FeatureMatch {
  feature_name: string;
  target_value: number;
  twin_value: number;
  unit: string;
  similarity_pct: number;
  importance_weight: number;
}

export interface HistoricalTwin {
  cyclone_id: string;
  name: string;
  year: number;
  basin: string;
  peak_category: string;
  overall_similarity_pct: number;
  track_similarity_pct: number;
  intensity_similarity_pct: number;
  structural_similarity_pct: number;
  peak_wind_kmh: number;
  min_pressure_hpa: number;
  landfall_impact_summary: string;
  casualty_economic_impact: string;
  feature_matches: FeatureMatch[];
  track_points: TrackPoint[];
  is_sample_illustrative: boolean;
}

export interface TwinMatchResult {
  target_cyclone_id: string;
  target_cyclone_name: string;
  algorithm: string;
  comparison_dimensions: string[];
  twins: HistoricalTwin[];
  methodology_notes: string;
}

export interface ExtractedFeatures {
  detected_eye: boolean;
  eye_center_pixel_x: number;
  eye_center_pixel_y: number;
  eye_diameter_km: number;
  core_compactness: number;
  convective_asymmetry: number;
  spiral_banding_index: number;
  mean_cloud_temperature_c: number;
  min_cloud_temperature_c: number;
  cloud_extent_radius_km: number;
  dvorak_estimate: number;
  estimated_wind_speed_kmh: number;
  estimated_wind_speed_kts: number;
  estimated_central_pressure_hpa: number;
  confidence_score: number;
}

export interface ImageAnalysisResponse {
  analysis_id: string;
  filename: string;
  image_url: string;
  filesize_kb: number;
  dimensions: string;
  processed_timestamp: string;
  features: ExtractedFeatures;
  pattern_dna: PatternDNA;
  matched_historical_analogue: string;
  intensity_class: string;
  synoptic_assessment: string;
  limitations_disclaimer: string;
}

export interface ReportSummary {
  report_id: string;
  title: string;
  cyclone_name: string;
  basin: string;
  created_at: string;
  status: string;
  file_format: string;
  classification_level: string;
  summary_findings: string;
}

export interface ReportDetail extends ReportSummary {
  cyclone_id: string;
  metrics: Record<string, any>;
  intensity_assessment: string;
  historical_twin_comparison: string;
  forecast_trajectory_summary: string;
  disaster_preparedness_recommendations: string[];
  evacuation_zones: string[];
  infrastructure_vulnerabilities: string[];
  data_sources_consulted: string[];
  model_version: string;
  limitations_and_disclaimers: string;
  download_url?: string;
}

export interface TelemetrySource {
  name: string;
  agency: string;
  type: string;
  status: string;
  latency_ms: number;
  last_sync: string;
  coverage: string;
}

export interface SystemHealth {
  status: string;
  api_version: string;
  uptime_seconds: number;
  active_monitored_storms: number;
  ibtracs_database_records: number;
  ai_inference_engine: string;
}

export interface DashboardData {
  active_cyclone: CycloneDetail;
  cyclone_catalog: CycloneSummary[];
  historical_twins: HistoricalTwin[];
  telemetry_sources: TelemetrySource[];
  system_health: SystemHealth;
}
