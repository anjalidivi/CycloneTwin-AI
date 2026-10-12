from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

class ReportSummary(BaseModel):
    report_id: str
    title: str
    cyclone_name: str
    basin: str
    created_at: str
    status: str
    file_format: str
    classification_level: str
    summary_findings: str

class ReportDetail(ReportSummary):
    cyclone_id: str
    metrics: Dict[str, Any]
    intensity_assessment: str
    historical_twin_comparison: str
    forecast_trajectory_summary: str
    disaster_preparedness_recommendations: List[str]
    evacuation_zones: List[str]
    infrastructure_vulnerabilities: List[str]
    data_sources_consulted: List[str]
    model_version: str
    limitations_and_disclaimers: str
    download_url: Optional[str] = None
