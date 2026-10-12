# CycloneTwin AI 🌀
### Geospatial Tropical Cyclone Intelligence & Disaster Preparedness Command Platform

**CycloneTwin AI** is a decision-support and geospatial intelligence platform for tracking tropical cyclones, extracting morphological patterns from satellite imagery, matching historical storm analogues ("twins") from 40+ years of NOAA IBTrACS data, and generating physics-informed ensemble forecast cones and situation reports.

---

## 🛰️ Key Intelligence Capabilities

1. **3D Orbital Earth Command Center**
   - Interactive Three.js / React Three Fiber geospatial globe with atmospheric rim shaders, realistic bathymetric and continental plate textures, active storm vortex markers, and 3D trajectory curves.
   - Built-in hardware-accelerated 2D radar vector fallback when WebGL is unavailable.
2. **Multispectral Satellite Computer Vision**
   - Automated central eye localization, convective cloud top temperature proxies, and Dvorak T-number proxy evaluation.
   - Interactive eye bounding detection, radial compactness analysis, and drag-and-drop imagery upload.
3. **Cyclone Pattern DNA Matrix**
   - Multi-axial structural representation decomposing core compactness, convective asymmetry, spiral banding index, outflow cooling, and vertical wind shear resilience.
   - Holland vortex model radial wind decay profile (Rankine vortex approximation).
4. **Historical Twin Analogue Engine**
   - Multivariate distance algorithm comparing current observations against historical benchmarks (e.g. *Super Cyclone Amphan 2020*, *Cyclone Mocha 2023*, *Cyclone Biparjoy 2023*, *Cyclone Fani 2019*, *Cyclone Tauktae 2021*, *Typhoon Haiyan 2013*, *Hurricane Katrina 2005*).
   - Dual-track overlay map and precedent impact metrics (surge levels, infrastructure vulnerabilities, evacuation model effectiveness).
5. **Physics-Informed Ensemble Forecasting**
   - 72-hour deterministic trajectory and multi-model ensemble cone of uncertainty.
   - Numerical waypoint schedule with 1-sigma ensemble intensity spreads and central pressure drop curves.
6. **Operational Situation & Preparedness Reports**
   - Automated report compiler generating multi-agency civil defense briefings, evacuation zoning protocols (Zone Alpha, Bravo, Charlie), and Markdown exports.
7. **NOAA IBTrACS & ISRO Telemetry Ingestion**
   - Real-time observational feed latency monitors and raw IBTrACS CSV stream parser playground.

---

## 🛠️ Technology Stack

- **Frontend:**
  - [React](https://react.dev/) & [Vite](https://vite.dev/) with [TypeScript](https://www.typescriptlang.org/)
  - [Three.js](https://threejs.org/), [@react-three/fiber](https://r3f.docs.pmnd.rs/), & [@react-three/drei](https://github.com/pmndrs/drei)
  - [Tailwind CSS v4](https://tailwindcss.com/) with custom glassmorphism and atmospheric oceanic gradients
  - [Leaflet](https://leafletjs.com/) & [React-Leaflet](https://react-leaflet.js.org/) with CartoDB Dark Matter tiles
  - [Recharts](https://recharts.org/) for radar spider charts and intensity evolution graphs
  - [Lucide React](https://lucide.dev/) for high-tech telemetry iconography
- **Backend:**
  - [Python 3.14+](https://www.python.org/) with [FastAPI](https://fastapi.tiangolo.com/)
  - [Pydantic v2](https://docs.pydantic.dev/) for data schemas and validation
  - [Pillow (PIL)](https://python-pillow.org/) & [NumPy](https://numpy.org/) for morphological image analysis
  - [Uvicorn](https://www.uvicorn.org/) ASGI server
  - [Pytest](https://docs.pytest.org/) automated test suite

---

## 📂 Repository Structure

```text
CycloneTwin-AI/
├── backend/
│   ├── app/
│   │   ├── api/             # Modular FastAPI route handlers
│   │   │   ├── health.py
│   │   │   ├── dashboard.py
│   │   │   ├── cyclones.py
│   │   │   ├── analysis.py
│   │   │   └── reports.py
│   │   ├── data/            # Sample cyclones & IBTrACS historical tracks
│   │   ├── schemas/         # Pydantic data models
│   │   ├── services/        # Twin matcher, forecasting, computer vision, reports
│   │   └── main.py          # FastAPI application entrypoint
│   ├── tests/               # Pytest automated test suite
│   ├── uploads/             # Secure satellite image storage
│   ├── generated_reports/   # Stored situation dossiers
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/      # 3D Globe, Leaflet Map, Metric Cards, Layout
│   │   ├── pages/           # 7 command center pages
│   │   ├── services/        # Typed API client
│   │   ├── types/           # TypeScript definitions
│   │   ├── App.tsx          # Main application shell
│   │   └── index.css        # Glassmorphic design system
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── pytest.ini
├── .gitignore
├── .env.example
└── README.md
```

---

## 🚀 Quickstart Guide

### 1. Launch the Backend API

```powershell
# Navigate to backend directory
cd backend

# Create and activate Python virtual environment
python -m venv .venv
.\.venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt

# Run automated tests
python -m pytest -v tests

# Start FastAPI development server
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

The interactive API documentation is accessible at `http://127.0.0.1:8000/docs`.

### 2. Launch the Frontend Command Center

```powershell
# In a separate terminal, navigate to frontend
cd frontend

# Install npm dependencies
npm install

# Start Vite dev server
npm run dev
```

Open your browser to `http://localhost:5173`.

---

## 📡 API Endpoint Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | System health, uptime, and telemetry feed status |
| `GET` | `/api/dashboard` | Unified mission-control dashboard overview payload |
| `GET` | `/api/cyclones` | Catalog of all monitored and historical cyclones (supports `search`, `year`, `basin`, `origin`, `min_wind`) |
| `GET` | `/api/cyclones/{id}` | Detailed track, pattern DNA, and synoptic fixes |
| `GET` | `/api/cyclones/{id}/track` | Ordered chronological track fixes with unit preservation (kts, km/h, hPa) |
| `GET` | `/api/cyclones/meta/basins` | Available oceanic basins with storm counts |
| `GET` | `/api/cyclones/meta/years` | Available historical years in descending order |
| `POST` | `/api/cyclones/import-ibtracs` | Ingest NOAA/NCEI IBTrACS CSV data (raw stream or multipart file) |
| `GET` | `/api/cyclones/{id}/forecast` | 72-hour ensemble forecast and cone of uncertainty |
| `GET` | `/api/cyclones/{id}/historical-twins` | Multivariate analogue matching with feature scores |
| `POST` | `/api/analysis/upload` | Satellite image upload, eye targeting, and Dvorak analysis |
| `GET` | `/api/reports` | List generated civil protection situation reports |
| `GET` | `/api/reports/{id}` | Retrieve comprehensive situation briefing report |
| `POST` | `/api/reports/generate` | Dynamically compile a new situation report |
| `GET` | `/api/reports/{id}/download` | Export printable markdown situation dossier |

For detailed information on obtaining, cleansing, and importing official NOAA/NCEI IBTrACS datasets, consult [docs/ibtracs_import.md](docs/ibtracs_import.md).

---

## ⚠️ Scientific & Operational Notice

> **IMPORTANT:** CycloneTwin AI is an experimental decision-support and hazard-modeling platform. All trajectory cones, similarity percentages, and computer vision estimates are intended for research, preparedness planning, and historical comparison. This platform does **NOT** supersede official cyclone warnings or evacuation directives issued by designated national meteorological authorities (**IMD, NOAA, JTWC, WMO RSMCs**).
