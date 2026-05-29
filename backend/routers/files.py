from fastapi import APIRouter, Depends, UploadFile, File
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from models.database import get_db
from models.schemas import FileUploadResponse
from services.file_service import get_file_service, FileService

router = APIRouter(prefix="/files", tags=["files"])


@router.post("/upload", response_model=FileUploadResponse, status_code=201)
async def upload_file(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    service: FileService = Depends(get_file_service),
):
    return await service.upload(db, file)


@router.get("/{file_id}")
async def download_file(
    file_id: str,
    db: AsyncSession = Depends(get_db),
    service: FileService = Depends(get_file_service),
):
    attachment = await service.get_by_id(db, file_id)
    if not attachment:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="File not found")

    file_path = service.get_file_path(attachment.filename)
    return FileResponse(
        path=str(file_path),
        filename=attachment.original_name,
        media_type=attachment.mime_type,
    )
