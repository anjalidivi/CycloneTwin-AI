# NOAA/NCEI IBTrACS Data Ingestion & Import Guide

## 1. Overview
CycloneTwin AI leverages the **National Oceanic and Atmospheric Administration (NOAA) / National Centers for Environmental Information (NCEI) International Best Track Archive for Climate Stewardship (IBTrACS v04r00)** as its authoritative historical tropical cyclone data source.

IBTrACS compiles 6-hourly best-track meteorological positions, maximum sustained winds, minimum central pressures, and storm structures recorded by regional specialized meteorological centres (e.g. WMO, RSMC New Delhi, JTWC, NHC, CPHC, JMA).

---

## 2. Official Data Source URLs

### Recommended Basin Subsets (Optimized Memory & High Performance)
For basin-specific analysis (such as the North Indian Ocean / Bay of Bengal & Arabian Sea), downloading basin-specific subsets is recommended:

| Basin | Region | Official NOAA CSV URL |
|---|---|---|
| **NI** | North Indian Ocean | `https://www.ncei.noaa.gov/data/international-best-track-archive-for-climate-stewardship-ibtracs/v04r00/access/csv/ibtracs.NI.list.v04r00.csv` |
| **WP** | Western North Pacific | `https://www.ncei.noaa.gov/data/international-best-track-archive-for-climate-stewardship-ibtracs/v04r00/access/csv/ibtracs.WP.list.v04r00.csv` |
| **NA** | North Atlantic | `https://www.ncei.noaa.gov/data/international-best-track-archive-for-climate-stewardship-ibtracs/v04r00/access/csv/ibtracs.NA.list.v04r00.csv` |
| **EP** | Eastern North Pacific | `https://www.ncei.noaa.gov/data/international-best-track-archive-for-climate-stewardship-ibtracs/v04r00/access/csv/ibtracs.EP.list.v04r00.csv` |
| **SI** | South Indian Ocean | `https://www.ncei.noaa.gov/data/international-best-track-archive-for-climate-stewardship-ibtracs/v04r00/access/csv/ibtracs.SI.list.v04r00.csv` |
| **SP** | South Pacific | `https://www.ncei.noaa.gov/data/international-best-track-archive-for-climate-stewardship-ibtracs/v04r00/access/csv/ibtracs.SP.list.v04r00.csv` |

### Global Full Archive (Large File ~200 MB compressed / ~800 MB raw CSV)
- **All Basins (1842-present)**:
  `https://www.ncei.noaa.gov/data/international-best-track-archive-for-climate-stewardship-ibtracs/v04r00/access/csv/ibtracs.ALL.list.v04r00.csv`
- **Active Season / Recent Years (Last 3 years)**:
  `https://www.ncei.noaa.gov/data/international-best-track-archive-for-climate-stewardship-ibtracs/v04r00/access/csv/ibtracs.last3years.list.v04r00.csv`

---

## 3. CSV Ingestion Engine & Data Cleansing

The parser in `backend/app/services/ibtracs_loader.py` handles the idiosyncrasies of IBTrACS v04 CSV files:

1. **Dual Header Row Handling**:
   - Row 0 contains column names (`SID, SEASON, NUMBER, BASIN, SUBBASIN, NAME, ISO_TIME, NATURE, LAT, LON, WMO_WIND, WMO_PRES, ...`).
   - Row 1 contains unit and format descriptions (e.g., `YYYY-MM-DD HH:MM:SS`, `kts`, `mb`, `deg_north`, etc.). The parser automatically detects unit tokens (`deg`, `YYYY-MM-DD`) and discards this descriptor row.
2. **Missing & Sentinel Value Sanitization**:
   - Missing fields are frequently marked with string literals `NA`, `null`, empty strings `""`, or numeric sentinels `<= -900` (such as `-999`).
   - All sentinels are converted to `None` / `null` without throwing exceptions or corrupting calculations.
3. **Agency Fallback Rules**:
   - **Wind Speed**: Examines `WMO_WIND` first; if missing, falls back to `USA_WIND`, then `REUNION_WIND`, `BOM_WIND`, or other agency columns.
   - **Central Pressure**: Examines `WMO_PRES` first; if missing, falls back to `USA_PRES` or agency pressure.
   - **Unit Conversions**: Preserves raw `wind_speed_kts` and `pressure_hpa`, while deriving `wind_speed_kmh` using exact meteorological conversion: $\text{km/h} = \text{kts} \times 1.852$.
4. **Coordinate Normalization**:
   - Longitude is wrapped and normalized to $[-180.0, 180.0]$ degrees.
5. **Deterministic Chronological Ordering**:
   - All track fixes are sorted in ascending order by `ISO_TIME`.
6. **Local Caching**:
   - Ingested records are serialized and cached locally to `backend/app/data/ibtracs_cache.json`. Subsequent application boots load the cached dataset in sub-millisecond time.

---

## 4. How to Import IBTrACS Data

### Option A: Via the Web Command Center UI (Recommended)
1. Open the **Data Sources & Engine Settings** page from the sidebar.
2. Scroll to the **NOAA / NCEI IBTrACS Data Ingestion Adapter** panel.
3. Either:
   - Click **Upload CSV File** and select your downloaded `.csv` file.
   - Or paste a snippet or full CSV string into the text area and click **EXECUTE IBTrACS INGESTION**.
4. The backend parses the data, reports imported cyclone counts and fix counts, and reloads the active catalog.

### Option B: Via HTTP API (cURL / Automation)
You can stream CSV content directly to the FastAPI backend:

```bash
# Upload via raw text body
curl -X POST "http://localhost:8000/api/cyclones/import-ibtracs" \
  -H "Content-Type: text/plain" \
  --data-binary "@ibtracs.NI.list.v04r00.csv"

# Or upload via multipart form-data
curl -X POST "http://localhost:8000/api/cyclones/import-ibtracs" \
  -F "file=@ibtracs.NI.list.v04r00.csv"
```

Response format:
```json
{
  "imported_cyclones_count": 86,
  "imported_fixes_count": 2410,
  "skipped_rows_count": 1,
  "message": "Successfully ingested 86 cyclones (2410 fixes) from IBTrACS dataset.",
  "errors": []
}
```

### Option C: Via Python Script
```python
from backend.app.services.ibtracs_loader import ibtracs_loader

# Parse and save directly to cache
summary = ibtracs_loader.import_ibtracs_csv("path/to/ibtracs.NI.list.v04r00.csv")
print(f"Imported {summary['imported_cyclones_count']} storms with {summary['imported_fixes_count']} fixes.")
```

---

## 5. API Endpoints Reference

| Method | Endpoint | Query Parameters | Description |
|---|---|---|---|
| `GET` | `/api/cyclones` | `search`, `year`, `basin`, `origin`, `min_wind` | Filter historical and active cyclones |
| `GET` | `/api/cyclones/{id}` | - | Full details, pattern DNA, and synoptic narrative |
| `GET` | `/api/cyclones/{id}/track` | - | Ordered chronological track fixes with unit preservation |
| `GET` | `/api/cyclones/meta/basins` | - | Available oceanic basins with storm counts |
| `GET` | `/api/cyclones/meta/years` | - | Available historical years in descending order |
| `POST` | `/api/cyclones/import-ibtracs` | multipart `file` or raw `text/plain` | Ingest new IBTrACS CSV data |

---

## 6. Keeping Large Datasets Out of Version Control

The root `.gitignore` is configured to exclude large raw CSV and NetCDF files:
```gitignore
*.csv
*.tsv
*.nc
backend/app/data/*.csv
backend/app/data/ibtracs_cache.json
!backend/app/data/sample_cyclones.json
!backend/tests/fixtures/*.csv
```

Only compact test fixtures and sample data files are checked into the repository, ensuring fast clone speeds and zero Git bloat.
