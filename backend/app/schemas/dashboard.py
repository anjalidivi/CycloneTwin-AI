from typing import List, Dict, Any
from pydantic import BaseModel
from app.schemas.cyclone import CycloneSummary, CycloneDetail
from app.schemas.twins import HistoricalTwin

class TelemetrySource(BaseModel):
    name: str
    agency: str
    type: str
    status: str
    latency_ms: int
    last_sync: str
    coverage: str

class SystemHealth(BaseModel):
    status: str
    api_version: str
    uptime_seconds: float
    active_monitored_storms: int
    ibtracs_database_records: int
    ai_inference_engine: str

class DashboardData(BaseModel):
    active_cyclone: CycloneDetail
    cyclone_catalog: List[CycloneSummary]
    historical_twins: List[HistoricalTwin]
    telemetry_sources: List[TelemetrySource]
    system_health: SystemHealth
