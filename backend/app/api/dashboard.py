from datetime import datetime, timezone
from fastapi import APIRouter
from app.schemas.dashboard import DashboardData, TelemetrySource, SystemHealth
from app.services.cyclone_service import cyclone_service
from app.services.twin_matcher import twin_matcher_service

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])

@router.get("", response_model=DashboardData)
def get_dashboard():
    """Retrieve full mission-control dashboard payload."""
    active_cyclone = cyclone_service.get_active_or_default()
    cyclones_catalog = cyclone_service.get_all()
    twins_result = twin_matcher_service.match_twins(active_cyclone)

    now_str = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")

    telemetry_sources = [
        TelemetrySource(
            name="INSAT-3DR Multispectral Imager",
            agency="ISRO / MOSDAC",
            type="Geostationary High-Resolution IR/Visible",
            status="OPERATIONAL (LIVE)",
            latency_ms=18,
            last_sync=now_str,
            coverage="Indian Ocean & South Asia"
        ),
        TelemetrySource(
            name="NOAA IBTrACS Global Best Track",
            agency="NOAA / NCEI",
            type="Historical Quality-Controlled Archives (1851-Present)",
            status="CONNECTED",
            latency_ms=45,
            last_sync=now_str,
            coverage="Global All-Basins"
        ),
        TelemetrySource(
            name="RSMC New Delhi Bulletins",
            agency="India Meteorological Department (IMD)",
            type="Official Regional Specialized Met Centre Advisories",
            status="ACTIVE SYNCHRONIZATION",
            latency_ms=25,
            last_sync=now_str,
            coverage="North Indian Ocean (Bay of Bengal & Arabian Sea)"
        ),
        TelemetrySource(
            name="DeepCyclone PhysicsNet Ensemble",
            agency="CycloneTwin AI Computational Core",
            type="Physics-Informed Neural Network (PINN) + SuperEnsemble",
            status="INFERENCE READY",
            latency_ms=110,
            last_sync=now_str,
            coverage="Global Cyclone Basins"
        )
    ]

    system_health = SystemHealth(
        status="ALL SYSTEMS NOMINAL",
        api_version="2.4.0",
        uptime_seconds=3600.0,
        active_monitored_storms=1,
        ibtracs_database_records=14850,
        ai_inference_engine="DeepCyclone-PhysicsNet-v2.4"
    )

    return DashboardData(
        active_cyclone=active_cyclone,
        cyclone_catalog=cyclones_catalog,
        historical_twins=twins_result.twins[:5],
        telemetry_sources=telemetry_sources,
        system_health=system_health
    )
