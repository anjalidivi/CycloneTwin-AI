from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class Coordinate(BaseModel):
    lat: float = Field(..., description="Latitude in decimal degrees")
    lon: float = Field(..., description="Longitude in decimal degrees")

class TrackPoint(BaseModel):
    timestamp: str = Field(..., description="ISO 8601 UTC timestamp of observation")
    lat: float
    lon: float
    wind_speed_kts: Optional[float] = Field(None, description="Maximum sustained wind speed in knots")
    wind_speed_kmh: Optional[float] = Field(None, description="Maximum sustained wind speed in km/h")
    pressure_hpa: Optional[float] = Field(None, description="Central barometric pressure in hectopascals")
    category: str = Field(..., description="Meteorological intensity category")
    status: str = Field(..., description="Deep Depression, Cyclonic Storm, Super Cyclone, etc.")
    basin: str = Field(..., description="Ocean basin, e.g. North Indian Ocean, Western Pacific")
    is_forecast: bool = Field(False, description="Flag indicating if point is an observational fix or model forecast")
    nature: Optional[str] = Field("TS", description="Storm nature (TS=Tropical, ET=Extratropical, SS=Subtropical)")
    source_agency: Optional[str] = Field("NOAA/NCEI IBTrACS", description="Observational source agency (IMD, JTWC, WMO)")
    is_interpolated: bool = Field(False, description="Flag indicating if missing value was interpolated")

class PatternDNA(BaseModel):
    eye_diameter_km: float = Field(..., description="Measured or proxy eye diameter in kilometers")
    convective_asymmetry: float = Field(..., description="Index of deep convective asymmetry (0-1)")
    spiral_banding_index: float = Field(..., description="Curvature coherence of outer spiral bands (0-1)")
    vertical_wind_shear_kts: float = Field(..., description="Ambient deep layer wind shear in knots")
    outflow_temperature_c: float = Field(..., description="Central dense overcast cloud top temperature in Celsius")
    dvorak_t_number: float = Field(..., description="Dvorak technique T-number estimate (1.0 to 8.0)")
    structural_compactness: float = Field(..., description="Core radial compactness ratio (0-1)")
    r_max_wind_km: float = Field(..., description="Radius of maximum winds in km")

class CycloneSummary(BaseModel):
    id: str
    name: str
    basin: str
    year: int
    season: str
    status: str
    category: str
    data_origin: str = Field(..., description="HISTORICAL_IBTRACS, LIVE_OBSERVED, or MODEL_SIMULATED")
    max_wind_kmh: float
    min_pressure_hpa: float
    current_lat: float
    current_lon: float
    movement_dir: str
    movement_speed_kmh: float
    last_updated: str
    sid: Optional[str] = Field(None, description="Official NOAA IBTrACS Storm Identifier")
    total_fixes: Optional[int] = Field(None, description="Total count of historical track observations")

class CycloneDetail(CycloneSummary):
    track: List[TrackPoint]
    pattern_dna: PatternDNA
    synoptic_summary: str
    advisories: List[str]
    sources: List[str]
    disclaimer: str = "CycloneTwin AI provides experimental decision support intelligence and does not replace official meteorological agency warnings (IMD, NOAA, JTWC)."

class CycloneTrackResponse(BaseModel):
    cyclone_id: str
    cyclone_name: str
    sid: Optional[str] = None
    data_origin: str
    total_fixes: int
    start_time: str
    end_time: str
    track: List[TrackPoint]

class BasinMetadata(BaseModel):
    code: str
    name: str
    cyclone_count: int

class IBTrACSImportResponse(BaseModel):
    imported_cyclones_count: int
    imported_fixes_count: int
    skipped_rows_count: int
    message: str
    errors: List[str] = []
