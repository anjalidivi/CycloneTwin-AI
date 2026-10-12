from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query, UploadFile, File, Body, Request
from app.schemas.cyclone import (
    CycloneSummary,
    CycloneDetail,
    CycloneTrackResponse,
    BasinMetadata,
    IBTrACSImportResponse,
)
from app.schemas.forecast import ForecastResult
from app.schemas.twins import TwinMatchResult
from app.services.cyclone_service import cyclone_service
from app.services.forecasting_service import forecasting_service
from app.services.twin_matcher import twin_matcher_service
from app.services.ibtracs_loader import ibtracs_loader

router = APIRouter(prefix="/api/cyclones", tags=["Cyclones"])

@router.get("", response_model=List[CycloneSummary])
def list_cyclones(
    search: Optional[str] = Query(None, description="Search by cyclone name, identifier, or NOAA SID"),
    year: Optional[int] = Query(None, description="Filter by storm season year"),
    basin: Optional[str] = Query(None, description="Filter by ocean basin (e.g. North Indian Ocean, Arabian Sea)"),
    origin: Optional[str] = Query(None, description="Filter by data origin (HISTORICAL_IBTRACS, LIVE_OBSERVED, MODEL_SIMULATED)"),
    min_wind: Optional[float] = Query(None, description="Minimum peak sustained wind in km/h"),
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0)
):
    """Retrieve catalog of all monitored and historical tropical cyclones with filtering support."""
    return cyclone_service.get_all(
        search=search,
        year=year,
        basin=basin,
        origin=origin,
        min_wind=min_wind,
        limit=limit,
        offset=offset
    )

@router.get("/meta/basins", response_model=List[BasinMetadata])
def get_available_basins():
    """Retrieve all available ocean basins and their historical storm counts."""
    return cyclone_service.get_basins()

@router.get("/meta/years", response_model=List[int])
def get_available_years():
    """Retrieve list of all historical storm years recorded in database."""
    return cyclone_service.get_years()

@router.post("/import-ibtracs", response_model=IBTrACSImportResponse)
async def import_ibtracs_data(
    request: Request
):
    """
    Import and cache official NOAA / NCEI IBTrACS CSV tracks.
    Supports direct file upload (multipart/form-data) or raw text body.
    """
    content = ""
    content_type = request.headers.get("content-type", "")
    
    if "multipart/form-data" in content_type:
        form = await request.form()
        uploaded = form.get("file")
        if uploaded and hasattr(uploaded, "read"):
            file_bytes = await uploaded.read()
            content = file_bytes.decode("utf-8", errors="replace")
        elif "csv_text" in form:
            content = str(form.get("csv_text", ""))
    else:
        body_bytes = await request.body()
        content = body_bytes.decode("utf-8", errors="replace")

    if not content.strip():
        raise HTTPException(status_code=400, detail="Empty CSV input provided.")

    response = ibtracs_loader.import_and_merge(content)
    # Reload service cache so new storms are immediately searchable
    cyclone_service.reload()
    return response

@router.get("/{cyclone_id}", response_model=CycloneDetail)
def get_cyclone(cyclone_id: str):
    """Retrieve complete details, synoptic summary, track and pattern DNA for a cyclone."""
    cyclone = cyclone_service.get_by_id(cyclone_id)
    if not cyclone:
        raise HTTPException(status_code=404, detail=f"Cyclone '{cyclone_id}' not found in database.")
    return cyclone

@router.get("/{cyclone_id}/track", response_model=CycloneTrackResponse)
def get_cyclone_track(cyclone_id: str):
    """Retrieve chronological ordered track observation fixes for a selected cyclone."""
    track_resp = cyclone_service.get_track_for_cyclone(cyclone_id)
    if not track_resp:
        raise HTTPException(status_code=404, detail=f"Cyclone track for '{cyclone_id}' not found.")
    return track_resp

@router.get("/{cyclone_id}/forecast", response_model=ForecastResult)
def get_cyclone_forecast(cyclone_id: str):
    """Retrieve 72-hour multi-model ensemble trajectory and intensity forecast with uncertainty bounds."""
    forecast = forecasting_service.get_forecast(cyclone_id)
    if not forecast:
        raise HTTPException(status_code=404, detail=f"Forecast projections for '{cyclone_id}' not available.")
    return forecast

@router.get("/{cyclone_id}/historical-twins", response_model=TwinMatchResult)
def get_historical_twins(cyclone_id: str):
    """Perform multivariate feature matching to discover historical twin analogues and landfall impact benchmarks."""
    cyclone = cyclone_service.get_by_id(cyclone_id)
    if not cyclone:
        raise HTTPException(status_code=404, detail=f"Cyclone '{cyclone_id}' not found.")
    return twin_matcher_service.match_twins(cyclone)
