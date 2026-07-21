from fastapi import APIRouter, Depends, status, HTTPException
from typing import Annotated, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlmodel import select
import datetime

from core.db import get_session
from core.dependencies import get_current_user_id, get_current_user_age
from src.models.rating import Rating

router = APIRouter(prefix="/rating", tags=["rating"])

SessionDep = Annotated[AsyncSession, Depends(get_session)]
CurrentUserDep = Annotated[int, Depends(get_current_user_id)]
CurrentUserAgeDep = Annotated[int, Depends(get_current_user_age)]

@router.post("/")
async def create_story():
  return ...
