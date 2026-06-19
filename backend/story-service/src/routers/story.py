from fastapi import APIRouter, Depends, status, HTTPException
from typing import Annotated
from requests import session
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlmodel import select

from core.db import get_session
from core.dependencies import get_current_user_id, check_is_admin
from src.schemas.story import StoryRead, StoryUpdate
from src.schemas.genre import GenreRead
from src.schemas.category import CategoryRead
from src.models.story import Story

router = APIRouter(prefix="/stories", tags=["stories"])

CurrentUserDep = Annotated[int, Depends(get_current_user_id)]
IsAdminDep = Annotated[bool, Depends(check_is_admin)]

@router.get("/", response_model=StoryRead)
async def get_my_stories(current_user: CurrentUserDep):
  query = select(Story).where()
  result = await session.execute(query)

  result.scalars().all()

  return current_user