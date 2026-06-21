from fastapi import APIRouter, Depends, status, HTTPException
from typing import Annotated, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import or_, select

from core.db import get_session
from core.dependencies import check_is_admin
from src.schemas.genre import GenreRead, GenreCreate
from src.models.story import Genre

router = APIRouter(prefix="/genre", tags=["genres"])

SessionDep = Annotated[AsyncSession, Depends(get_session)]
CurrentAdminDep = Annotated[bool, Depends(check_is_admin)]

@router.get("/", response_model=List[GenreRead])
async def get_all_genres(session: SessionDep):
  result = await session.execute(select(Genre))
  return result.scalars().all()

# --- GENRE MANAGEMENT (Admin Only) ---
@router.post("/", response_model=GenreRead, status_code=status.HTTP_201_CREATED)
async def create_genre(genre_data: GenreCreate, session: SessionDep, admin: CurrentAdminDep):
  query = select(Genre).where(
    or_(
        Genre.slug == genre_data.slug,
        Genre.en == genre_data.en,
        Genre.ru == genre_data.ru,
        Genre.pl == genre_data.pl,
        Genre.by == genre_data.by
      )
    )
  result = await session.execute(query)
  existing_genre = result.scalars().first()

  if existing_genre:
    raise HTTPException(
      status_code=400, 
      detail="Genre with this slug or translation already exists"
      )

  db_genre = Genre.model_validate(genre_data)

  session.add(db_genre)
  await session.commit()
  await session.refresh(db_genre)
  return db_genre

@router.patch("/{genre_id}")
async def update_genre(genre_id: int, genre_data: GenreCreate, session: SessionDep, admin: CurrentAdminDep):
  query = select(Genre).where(Genre.id == genre_id)
  result = await session.execute(query)
  genre = result.scalar_one_or_none()

  update_data = genre_data.model_dump(exclude_unset=True)
  for key, value in update_data.items():
    setattr(genre, key, value)

  session.add(genre)
  await session.commit()
  await session.refresh(genre)
  return genre

@router.delete("/{genre_id}", status_code=status.HTTP_200_OK)
async def delete_genre(genre_id: int, session: SessionDep, admin: CurrentAdminDep):
  query = select(Genre).where(Genre.id == genre_id)
  result = await session.execute(query)
  genre = result.scalar_one_or_none()

  if not genre:
    raise HTTPException(status_code=404, detail="Genre not found")

  await session.delete(genre)
  await session.commit()
  
  return {"message": f"Genre '{genre_id}' has been completely removed from the system"}