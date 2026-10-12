from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_list_cyclones():
    response = client.get("/api/cyclones")
    assert response.status_code == 200
    cyclones = response.json()
    assert isinstance(cyclones, list)
    assert len(cyclones) >= 5
    ids = [c["id"] for c in cyclones]
    assert "ASNA-2026" in ids
    assert "AMPHAN-2020" in ids

def test_get_cyclone_detail():
    response = client.get("/api/cyclones/ASNA-2026")
    assert response.status_code == 200
    detail = response.json()
    assert detail["name"] == "Tropical Cyclone ASNA-II"
    assert "pattern_dna" in detail
    assert "track" in detail
    assert len(detail["track"]) > 0
    assert detail["pattern_dna"]["dvorak_t_number"] > 0

def test_get_cyclone_forecast():
    response = client.get("/api/cyclones/ASNA-2026/forecast")
    assert response.status_code == 200
    forecast = response.json()
    assert forecast["cyclone_id"] == "ASNA-2026"
    assert len(forecast["forecast_points"]) == 7
    # Check lead hours 0 to 72
    hours = [p["lead_hours"] for p in forecast["forecast_points"]]
    assert hours == [0, 6, 12, 24, 36, 48, 72]

def test_get_historical_twins():
    response = client.get("/api/cyclones/ASNA-2026/historical-twins")
    assert response.status_code == 200
    data = response.json()
    assert data["target_cyclone_id"] == "ASNA-2026"
    assert len(data["twins"]) >= 3
    # First twin has similarity score <= 100 and >= 50
    top_twin = data["twins"][0]
    assert 50 <= top_twin["overall_similarity_pct"] <= 100
    assert len(top_twin["feature_matches"]) > 0

def test_dashboard_endpoint():
    response = client.get("/api/dashboard")
    assert response.status_code == 200
    dash = response.json()
    assert "active_cyclone" in dash
    assert "historical_twins" in dash
    assert "telemetry_sources" in dash
    assert len(dash["telemetry_sources"]) >= 3
