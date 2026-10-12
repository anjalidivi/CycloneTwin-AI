from typing import List, Optional
from pydantic import BaseModel, Field
from app.schemas.cyclone import TrackPoint

class FeatureMatch(BaseModel):
    feature_name: str
    target_value: float
    twin_value: float
    unit: str
    similarity_pct: float
    importance_weight: float

class HistoricalTwin(BaseModel):
    cyclone_id: str
    name: str
    year: int
    basin: str
    peak_category: str
    overall_similarity_pct: float = Field(..., description="Weighted structural & kinematic twin similarity score")
    track_similarity_pct: float
    intensity_similarity_pct: float
    structural_similarity_pct: float
    peak_wind_kmh: float
    min_pressure_hpa: float
    landfall_impact_summary: str
    casualty_economic_impact: str
    feature_matches: List[FeatureMatch]
    track_points: List[TrackPoint] = []
    is_sample_illustrative: bool = Field(False, description="Flag indicating if similarity is verified empirical or sample illustrative")

class TwinMatchResult(BaseModel):
    target_cyclone_id: str
    target_cyclone_name: str
    algorithm: str = "Multivariate Earth-Mover Distance + Spherical Dynamic Time Warping (DTW)"
    comparison_dimensions: List[str] = [
        "Core eyewall compactness",
        "Convective asymmetry",
        "Spiral band curvature index",
        "Barometric pressure drop rate",
        "Geographic trajectory vector",
        "Ocean heat content exposure"
    ]
    twins: List[HistoricalTwin]
    methodology_notes: str = (
        "Twin matching compares the multi-dimensional feature space of current observations "
        "against 40+ years of quality-controlled NOAA IBTrACS data. "
        "Scores reflect structural and kinematic similarity."
    )
