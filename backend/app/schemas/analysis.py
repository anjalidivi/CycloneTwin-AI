from typing import List, Optional, Dict
from pydantic import BaseModel, Field
from app.schemas.cyclone import PatternDNA

class ExtractedFeatures(BaseModel):
    detected_eye: bool
    eye_center_pixel_x: int
    eye_center_pixel_y: int
    eye_diameter_km: float
    core_compactness: float
    convective_asymmetry: float
    spiral_banding_index: float
    mean_cloud_temperature_c: float
    min_cloud_temperature_c: float
    cloud_extent_radius_km: float
    dvorak_estimate: float
    estimated_wind_speed_kmh: float
    estimated_wind_speed_kts: float
    estimated_central_pressure_hpa: float
    confidence_score: float

class ImageAnalysisResponse(BaseModel):
    analysis_id: str
    filename: str
    image_url: str
    filesize_kb: float
    dimensions: str
    processed_timestamp: str
    features: ExtractedFeatures
    pattern_dna: PatternDNA
    matched_historical_analogue: str
    intensity_class: str
    synoptic_assessment: str
    limitations_disclaimer: str = (
        "IMPORTANT SCIENTIFIC LIMITATION: Satellite image feature extraction is an AI-assisted proxy estimator. "
        "True tropical cyclone intensity requires in-situ reconnaissance, dropsonde data, scatterometer winds, "
        "and official synoptic analysis. Do not use for maritime or civil life-safety decisions."
    )
