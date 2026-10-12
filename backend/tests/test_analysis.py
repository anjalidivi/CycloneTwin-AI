import io
from PIL import Image, ImageDraw
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def create_synthetic_cyclone_image():
    # Generate 256x256 image with concentric circle simulating a storm eye
    img = Image.new("L", (256, 256), color=40)
    draw = ImageDraw.Draw(img)
    # Dense convective overcast ring
    draw.ellipse([50, 50, 206, 206], fill=220)
    # Warm eye cavity in center
    draw.ellipse([110, 110, 146, 146], fill=70)
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    buf.seek(0)
    return buf.getvalue()

def test_satellite_image_upload_and_extraction():
    img_bytes = create_synthetic_cyclone_image()
    files = {"file": ("test_storm.png", img_bytes, "image/png")}
    response = client.post("/api/analysis/upload", files=files)
    assert response.status_code == 200
    data = response.json()
    assert "analysis_id" in data
    assert "features" in data
    assert data["features"]["detected_eye"] is True
    assert 2.0 <= data["features"]["dvorak_estimate"] <= 8.0
    assert data["features"]["estimated_wind_speed_kmh"] > 50.0
    assert "limitations_disclaimer" in data

def test_invalid_upload_format():
    files = {"file": ("test_script.sh", b"echo 'attack'", "text/plain")}
    response = client.post("/api/analysis/upload", files=files)
    assert response.status_code == 400
