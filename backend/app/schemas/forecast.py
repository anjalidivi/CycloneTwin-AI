from typing import List
from pydantic import BaseModel, Field

class ForecastPoint(BaseModel):
    lead_hours: int = Field(..., description="Lead time in hours (0, 6, 12, 24, 48, 72)")
    valid_time: str = Field(..., description="Valid UTC timestamp")
    lat: float
    lon: float
    wind_speed_kmh: float
    wind_speed_kts: float
    pressure_hpa: float
    category: str
    cone_radius_km: float = Field(..., description="Radius of 67% cone of track uncertainty in km")
    model_ensemble_spread_kts: float = Field(..., description="Intensity standard deviation across multi-model ensemble")

class ForecastResult(BaseModel):
    cyclone_id: str
    cyclone_name: str
    base_time: str
    forecast_points: List[ForecastPoint]
    model_name: str = "DeepCyclone-PhysicsNet-v2.4"
    model_version: str = "2.4.1-ensemble"
    uncertainty_method: str = "Multi-Model SuperEnsemble (ECMWF, GFS, IMD GFS) + Convective Latent Heat Bias Correction"
    is_demonstration_mode: bool = False
    status_label: str = "MODEL OUTPUT"
    disclaimer: str = "Forecast projections are generated for research and decision-support simulation. Refer to official warnings from national meteorological authorities."
