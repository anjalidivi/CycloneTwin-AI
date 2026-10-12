from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_reports_lifecycle():
    # 1. List reports
    response = client.get("/api/reports")
    assert response.status_code == 200
    reports = response.json()
    assert isinstance(reports, list)

    # 2. Generate a new report
    gen_response = client.post("/api/reports/generate?cyclone_id=ASNA-2026")
    assert gen_response.status_code == 200
    report_data = gen_response.json()
    assert "report_id" in report_data
    report_id = report_data["report_id"]

    # 3. Retrieve report by ID
    get_response = client.get(f"/api/reports/{report_id}")
    assert get_response.status_code == 200
    retrieved = get_response.json()
    assert retrieved["report_id"] == report_id
    assert len(retrieved["disaster_preparedness_recommendations"]) > 0

    # 4. Download report as Markdown
    dl_response = client.get(f"/api/reports/{report_id}/download")
    assert dl_response.status_code == 200
    assert dl_response.headers["content-type"].startswith("text/markdown")
    assert f"Operational Intelligence & Disaster Advisory" in dl_response.text
