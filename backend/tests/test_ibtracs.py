import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.ibtracs_loader import ibtracs_loader

client = TestClient(app)

SAMPLE_IBTRACS_CSV = """SID,SEASON,NUMBER,BASIN,SUBBASIN,NAME,ISO_TIME,NATURE,LAT,LON,WMO_WIND,WMO_PRES,WMO_AGENCY,TRACK_TYPE,DIST2LAND,LANDFALL
 ,Year, , , , ,YYYY-MM-DD HH:MM:SS, ,deg_north,deg_east,kts,mb, , ,km,km
2020137N10087,2020,01,NI,BB,TESTAMPHAN,2020-05-16 00:00:00,TS,10.40,86.80,35,998,newdelhi,main,672,672
2020137N10087,2020,01,NI,BB,TESTAMPHAN,2020-05-17 00:00:00,TS,11.40,86.00,55,986,newdelhi,main,580,580
2020137N10087,2020,01,NI,BB,TESTAMPHAN,2020-05-18 12:00:00,TS,13.80,86.30,140,920,newdelhi,main,410,410
"""

SAMPLE_CSV_WITH_MISSING_VALUES = """SID,SEASON,NUMBER,BASIN,SUBBASIN,NAME,ISO_TIME,NATURE,LAT,LON,WMO_WIND,WMO_PRES,USA_WIND,USA_PRES
 ,Year, , , , ,YYYY-MM-DD HH:MM:SS, ,deg_north,deg_east,kts,mb,kts,mb
2023999N15090,2023,99,NI,AS,MISSING_VAL_STORM,2023-06-01 00:00:00,TS,14.50,68.20,NA,-999,45,992
2023999N15090,2023,99,NI,AS,MISSING_VAL_STORM,2023-06-01 06:00:00,TS,15.10,68.40, , ,50,988
2023999N15090,2023,99,NI,AS,MISSING_VAL_STORM,2023-06-01 12:00:00,TS,15.80,68.70,55,NULL, ,-999.0
"""

def test_ibtracs_loader_unit_row_and_header():
    cyclones, skipped, errors = ibtracs_loader.parse_csv_stream(SAMPLE_IBTRACS_CSV)
    assert len(cyclones) == 1
    c = cyclones[0]
    assert "TESTAMPHAN" in c.id.upper()
    assert len(c.track) == 3
    assert c.year == 2020
    assert c.max_wind_kmh >= 250.0 # 140 kts * 1.852 ~ 259 km/h
    assert c.min_pressure_hpa == 920.0
    assert c.data_origin == "HISTORICAL_IBTRACS"

def test_ibtracs_missing_values_fallback():
    cyclones, skipped, errors = ibtracs_loader.parse_csv_stream(SAMPLE_CSV_WITH_MISSING_VALUES)
    assert len(cyclones) == 1
    c = cyclones[0]
    assert len(c.track) == 3
    # Check that row 1 used USA_WIND (45 kts) since WMO_WIND was 'NA'
    assert c.track[0].wind_speed_kts == 45.0
    # Check that row 1 used USA_PRES (992 hPa) since WMO_PRES was -999
    assert c.track[0].pressure_hpa == 992.0

def test_cyclones_track_endpoint():
    response = client.get("/api/cyclones/AMPHAN-2020/track")
    assert response.status_code == 200
    data = response.json()
    assert data["cyclone_id"] == "AMPHAN-2020"
    assert "total_fixes" in data
    assert len(data["track"]) > 0
    # Verify chronological ordering
    timestamps = [p["timestamp"] for p in data["track"]]
    assert timestamps == sorted(timestamps)

def test_cyclone_search_and_filtering():
    # Filter by search query
    res_search = client.get("/api/cyclones?search=Mocha")
    assert res_search.status_code == 200
    items = res_search.json()
    assert len(items) >= 1
    assert any("MOCHA" in item["name"].upper() for item in items)

    # Filter by year
    res_year = client.get("/api/cyclones?year=2023")
    assert res_year.status_code == 200
    items_2023 = res_year.json()
    assert len(items_2023) >= 1
    assert all(item["year"] == 2023 for item in items_2023)

    # Filter by basin
    res_basin = client.get("/api/cyclones?basin=Arabian")
    assert res_basin.status_code == 200
    items_basin = res_basin.json()
    assert len(items_basin) >= 1
    assert any("ARABIAN" in item["basin"].upper() for item in items_basin)

def test_cyclone_metadata_endpoints():
    res_basins = client.get("/api/cyclones/meta/basins")
    assert res_basins.status_code == 200
    basins = res_basins.json()
    assert len(basins) >= 1

    res_years = client.get("/api/cyclones/meta/years")
    assert res_years.status_code == 200
    years = res_years.json()
    assert isinstance(years, list)
    assert 2020 in years

def test_invalid_cyclone_identifier():
    response = client.get("/api/cyclones/DOES_NOT_EXIST_XYZ")
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()

def test_import_ibtracs_api_endpoint():
    response = client.post(
        "/api/cyclones/import-ibtracs",
        content=SAMPLE_IBTRACS_CSV,
        headers={"Content-Type": "text/plain"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["imported_cyclones_count"] >= 1
    assert data["imported_fixes_count"] >= 3
