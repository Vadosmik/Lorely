import datetime
from enum import Enum
import io
import os
import uuid

from fastapi import APIRouter, Depends, File, status, HTTPException, UploadFile
from typing import Annotated
from fastapi.responses import StreamingResponse
from minio import Minio

from core.config import settings
from core.dependencies import get_current_user_id

CurrentUserDep = Annotated[int, Depends(get_current_user_id)]

router = APIRouter(prefix="/storage", tags=["storage"])

class FileType(str, Enum):
  AVATARS = "avatars"
  COVERS = "covers"
  STORIES = "stories"

minio_client = Minio(
  settings.MINIO_ENDPOINT,
  access_key=settings.ACCESS_KEY,
  secret_key=settings.SECRET_KEY,
  secure=False
)

for name in FileType:
  BUCKET = name
  if not minio_client.bucket_exists(BUCKET):
    minio_client.make_bucket(BUCKET)

@router.post("/upload/{file_type}")
async def upload_file(file_type: FileType, current_user: CurrentUserDep, file: UploadFile = File(...)):

  _, file_extension = os.path.splitext(file.filename)
  if not file_extension:
    file_extension = ".json" if file_type == FileType.STORIES else ".png"

  timestamp = int(datetime.datetime.utcnow().timestamp())
  unique_id = uuid.uuid4().hex[:8]
  target_id = current_user

  if file_type == FileType.AVATARS:
    filename = f"avatar_{target_id}_{timestamp}{file_extension}"
  elif file_type == FileType.COVERS:
    filename = f"cover_{target_id}_{unique_id}{file_extension}"
  else:  # STORIES
    filename = f"story_{target_id}_{unique_id}.json"

  full_path = f"{file_type.value}/{filename}"

  file_data = await file.read()
  file_length = len(file_data)

  minio_client.put_object(
    bucket_name=file_type.value,
    object_name=filename,
    data=io.BytesIO(file_data),
    length=file_length,
    content_type=file.content_type
    )

  return full_path

@router.get("/download/{object_name:path}")
async def download_file(object_name: str):
  bucket, filename = object_name.split('/', 1)

  response = minio_client.get_object(bucket, filename)

  if response:
    return StreamingResponse(response, media_type="application/octet-stream")
  
  raise HTTPException(status_code=404, detail="File not found")

@router.delete("/delete/{object_name}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_file(object_name: str, current_user: CurrentUserDep):
  bucket, filename = object_name.split('/', 1)

  minio_client.remove_object(bucket, filename)
  return None

# avatar_{user_id}_{timestamp}.*[img]     |
# {story_id}_{uuid}_cover.*[img]          | // ale potem usuwac stary plik
# {story_id}_{uuid}.json                  |
