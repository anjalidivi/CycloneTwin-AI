from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query, Response
from app.schemas.report import ReportSummary, ReportDetail
from app.services.report_service import report_service

router = APIRouter(prefix="/api/reports", tags=["Reports"])

@router.get("", response_model=List[ReportSummary])
def list_reports():
    """Retrieve all generated disaster situation and intelligence reports."""
    return report_service.list_reports()

@router.get("/{report_id}", response_model=ReportDetail)
def get_report(report_id: str):
    """Retrieve detailed situational intelligence report including disaster preparedness recommendations."""
    report = report_service.get_report(report_id)
    if not report:
        raise HTTPException(status_code=404, detail=f"Report '{report_id}' not found.")
    return report

@router.post("/generate", response_model=ReportDetail)
def generate_report(cyclone_id: str = Query("ASNA-2026", description="Target cyclone ID for situation report")):
    """Trigger automated intelligence report generation for a target cyclone."""
    return report_service.create_report_for_cyclone(cyclone_id)

@router.get("/{report_id}/download")
def download_report(report_id: str):
    """Download markdown report suitable for printing or official distribution."""
    report = report_service.get_report(report_id)
    if not report:
        raise HTTPException(status_code=404, detail=f"Report '{report_id}' not found.")

    md_content = f"""# {report.title}
**Report ID:** `{report.report_id}`  
**Target Cyclone:** {report.cyclone_name} ({report.basin})  
**Classification:** {report.classification_level}  
**Generated At:** {report.created_at}  
**Model Core:** {report.model_version}  

---

## 1. Executive Summary
{report.summary_findings}

## 2. Key Telemetry & Synoptic Observations
* **Peak Sustained Winds:** {report.metrics.get('current_winds_kmh', 'N/A')} km/h
* **Central Minimum Pressure:** {report.metrics.get('current_pressure_hpa', 'N/A')} hPa
* **Current Position:** {report.metrics.get('current_coordinates', 'N/A')}
* **Movement Vector:** {report.metrics.get('movement', 'N/A')}
* **Estimated Dvorak T-Number:** T{report.metrics.get('dvorak_t_number', 'N/A')}
* **Eyewall Diameter:** {report.metrics.get('eye_diameter_km', 'N/A')} km

## 3. Structural & Intensity Assessment
{report.intensity_assessment}

## 4. Historical Twin Analogue Benchmarking
{report.historical_twin_comparison}

## 5. Forecast Trajectory & Uncertainty
{report.forecast_trajectory_summary}

## 6. Disaster Preparedness & Civil Protection Directives
"""
    for idx, rec in enumerate(report.disaster_preparedness_recommendations, 1):
        md_content += f"{idx}. {rec}\n"

    md_content += "\n### Evacuation Zoning Protocol\n"
    for zone in report.evacuation_zones:
        md_content += f"* {zone}\n"

    md_content += "\n### Critical Infrastructure Vulnerabilities\n"
    for vuln in report.infrastructure_vulnerabilities:
        md_content += f"* {vuln}\n"

    md_content += f"""
---
### Data Sources Consulted
"""
    for src in report.data_sources_consulted:
        md_content += f"* {src}\n"

    md_content += f"""
---
### Official Scientific Notice
> {report.limitations_and_disclaimers}
"""

    return Response(
        content=md_content,
        media_type="text/markdown",
        headers={"Content-Disposition": f"attachment; filename={report.report_id}.md"}
    )
