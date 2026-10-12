from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

from app.api.health import router as health_router
from app.api.dashboard import router as dashboard_router
from app.api.cyclones import router as cyclones_router
from app.api.analysis import router as analysis_router
from app.api.reports import router as reports_router

app = FastAPI(
    title="CycloneTwin AI — Geospatial Intelligence API",
    description="AI-assisted tropical cyclone intelligence, pattern DNA matching, and disaster decision-support platform.",
    version="2.4.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS configuration
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers
app.include_router(health_router)
app.include_router(dashboard_router)
app.include_router(cyclones_router)
app.include_router(analysis_router)
app.include_router(reports_router)

@app.get("/")
def root():
    return {
        "platform": "CycloneTwin AI",
        "description": "Geospatial Intelligence & Disaster Preparedness Decision Support Core",
        "status": "Online",
        "api_docs": "/docs",
        "endpoints": {
            "health": "/api/health",
            "dashboard": "/api/dashboard",
            "cyclones": "/api/cyclones",
            "active_cyclone": "/api/cyclones/ASNA-2026",
            "forecast": "/api/cyclones/ASNA-2026/forecast",
            "historical_twins": "/api/cyclones/ASNA-2026/historical-twins",
            "analysis_upload": "/api/analysis/upload",
            "reports": "/api/reports"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
