import os
from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import FileResponse
from app.schemas.analysis import ImageAnalysisResponse
from app.services.analysis_service import analysis_service, UPLOAD_DIR

router = APIRouter(prefix="/api/analysis", tags=["Analysis"])

ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp", "image/tiff"}

@router.post("/upload", response_model=ImageAnalysisResponse)
async def upload_satellite_image(file: UploadFile = File(...)):
    """Upload satellite imagery for automated morphological feature extraction, eye detection, and Dvorak intensity estimation."""
    if file.content_type and file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file format '{file.content_type}'. Allowed types: JPEG, PNG, WebP, TIFF."
        )

    try:
        content = await file.read()
        if not content:
            raise HTTPException(status_code=400, detail="Empty file submitted.")
        
        result = analysis_service.process_satellite_image(content, file.filename or "satellite_capture.png")
        return result
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image processing pipeline failure: {str(e)}")

@router.get("/images/{filename}")
def get_uploaded_image(filename: str):
    """Retrieve processed satellite imagery by filename."""
    clean_filename = os.path.basename(filename)
    file_path = os.path.join(UPLOAD_DIR, clean_filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Requested image not found on server.")
    return FileResponse(file_path)
