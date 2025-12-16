"""
Restaurant service utilities for file handling.
Manages image uploads/downloads/deletion using MongoDB GridFS storage.
"""


from fastapi import UploadFile, HTTPException
from app.database import fs
from bson import ObjectId
import uuid
from typing import Optional

ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif", "webp"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

def validate_image(file: UploadFile) -> bool:
    """Validate image file type and size"""
    if not file:
        return False
    
    # Check file extension
    ext = file.filename.split(".")[-1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"Invalid file type. Allowed: {ALLOWED_EXTENSIONS}")
    
    return True

async def upload_image_to_gridfs(file: UploadFile, metadata: dict = None) -> str:
    """
    Upload image to MongoDB GridFS
    Returns the file_id as string
    """
    if not file:
        return None
    
    validate_image(file)
    
    # Read file content
    content = await file.read()
    
    # Check file size
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail=f"File too large. Max size: {MAX_FILE_SIZE / 1024 / 1024}MB")
    
    # Prepare metadata
    file_metadata = {
        "filename": file.filename,
        "content_type": file.content_type,
        "original_filename": file.filename,
    }
    
    if metadata:
        file_metadata.update(metadata)
    
    # Upload to GridFS
    file_id = await fs.upload_from_stream(
        file.filename,
        content,
        metadata=file_metadata
    )
    
    return str(file_id)

async def get_image_from_gridfs(file_id: str) -> tuple:
    """
    Retrieve image from GridFS
    Returns (content, content_type, filename)
    """
    try:
        # Download from GridFS
        grid_out = await fs.open_download_stream(ObjectId(file_id))
        content = await grid_out.read()
        
        metadata = grid_out.metadata or {}
        content_type = metadata.get("content_type", "image/jpeg")
        filename = metadata.get("filename", "image.jpg")
        
        return content, content_type, filename
    
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Image not found: {str(e)}")

async def delete_image_from_gridfs(file_id: str) -> bool:
    """Delete image from GridFS"""
    try:
        await fs.delete(ObjectId(file_id))
        return True
    except Exception:
        return False

async def upload_multiple_images(files: list[UploadFile], metadata: dict = None) -> list[str]:
    """Upload multiple images and return list of file_ids"""
    file_ids = []
    for file in files:
        if file:
            file_id = await upload_image_to_gridfs(file, metadata)
            file_ids.append(file_id)
    return file_ids