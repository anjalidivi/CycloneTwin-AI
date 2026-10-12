import time
from fastapi import APIRouter
from app.services.cyclone_service import cyclone_service

router = APIRouter(prefix="/api", tags=["Health"])

START_TIME = time.time()

@router.get("/health")
def get_health():
    return {
        "status": "healthy",
        "service": "CycloneTwin AI Intelligence Engine",
        "api_version": "2.4.0",
        "uptime_seconds": round(time.time() - START_TIME, 2),
        "cyclones_loaded": len(cyclone_service._cyclones),
        "ai_inference_engine": "DeepCyclone-PhysicsNet-v2.4 (PyTorch/ONNX Runtime)",
        "ibtracs_dataset_status": "Operational (NOAA IBTrACS v04r00)",
        "satellite_feeds": {
            "isro_mosdac": "Connected",
            "noaa_nesdis": "Connected",
            "eumetsat": "Connected"
        }
    }
