from fastapi import APIRouter, Depends, status, HTTPException
from typing import Annotated, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlmodel import select
import datetime

from core.db import get_session
from core.dependencies import get_current_user_id
from src.schemas.story import StoryRead, StoryUpdate, StoryCreate, StoryGetCatalog
from src.models.story import Story, Genre, Category

router = APIRouter(prefix="/stories", tags=["stories"])

SessionDep = Annotated[AsyncSession, Depends(get_session)]
CurrentUserDep = Annotated[int, Depends(get_current_user_id)]

@router.post("/", response_model=StoryRead, status_code=status.HTTP_201_CREATED)
async def create_story(story_date: StoryCreate, session: SessionDep, current_user: CurrentUserDep):
  db_story = Story(
    **story_date.model_dump(),
    author_id=current_user
    )

  session.add(db_story)
  await session.commit()

  query = select(Story).where(Story.id == db_story.id).options(
    selectinload(Story.genres),
    selectinload(Story.categories)
  )
  result = await session.execute(query)
  full_story = result.scalar_one()
  
  return full_story

@router.get("/", response_model=List[StoryGetCatalog])
async def get_my_stories(session: SessionDep):
  query = select(Story)
  result = await session.execute(query)

  return result.scalars().all()

@router.get("/{story_id}", response_model=StoryRead)
async def get_story(story_id: int, session: SessionDep, current_user: CurrentUserDep):
  query = select(Story).where(Story.id == story_id).options(
    selectinload(Story.genres), 
    selectinload(Story.categories)
    )
  result = await session.execute(query)
  story = result.scalar_one_or_none()

  if not story:
    raise HTTPException(status_code=404, detail="Story not found")
  
  return story

@router.patch("/{story_id}")
async def update_story(story_id: int, story_data: StoryUpdate, session: SessionDep, current_user: CurrentUserDep):
  query = select(Story).where(Story.id == story_id).options(
    selectinload(Story.genres), 
    selectinload(Story.categories)
    )
  result = await session.execute(query)
  story = result.scalar_one_or_none()

  if not story:
    raise HTTPException(status_code=404, detail="Story not found")
  
  if story.author_id != current_user:
    raise HTTPException(status_code=403, detail="Not authorized to edit this story")

  update_data = story_data.model_dump(exclude_unset=True, exclude={"genre_ids", "category_ids"})
  for key, value in update_data.items():
    setattr(story, key, value)

  if story_data.genre_ids is not None:
    genre_query = select(Genre).where(Genre.id.in_(story_data.genre_ids))
    genres_res = await session.execute(genre_query)
    story.genres = genres_res.scalars().all()

  if story_data.category_ids is not None:
    category_query = select(Category).where(Category.id.in_(story_data.category_ids))
    category_res = await session.execute(category_query)
    story.categories = category_res.scalars().all()

  session.add(story)
  await session.commit()
  await session.refresh(story)
  return story

@router.delete("/{story_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_story(story_id: int, session: SessionDep, current_user: CurrentUserDep):
  query = select(Story).where(Story.id == story_id)
  result = await session.execute(query)
  story = result.scalar_one_or_none()

  if not story:
    raise HTTPException(status_code=404, detail="Story not found")
  
  if story.author_id != current_user:
    raise HTTPException(status_code=403, detail="Not authorized to edit this story")

  await session.delete(story)
  await session.commit()

  return None