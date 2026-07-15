from fastapi import APIRouter, Depends, HTTPException
from typing import Annotated
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select
from sqlalchemy.orm import selectinload

from core.db import get_session
from core.dependencies import get_current_admin
from src.schemas.users import UserAdminRead, UserAdminUpdate
from src.models.users import User, Role

router = APIRouter(prefix="/admin", tags=["admin"])

SessionDep = Annotated[AsyncSession, Depends(get_session)]
CurrentAdminDep = Annotated[User, Depends(get_current_admin)]

# -- Wszystkie usery z perspektywy Admina --
@router.get("/users", response_model=list[UserAdminRead])
async def get_users(session: SessionDep, admin: CurrentAdminDep):
  query = select(User)
  result = await session.execute(query)
  return result.scalars().all()
  
# -- dane konkretnego usera z perspektywy Admina --
@router.get("/user/{username}", response_model=UserAdminRead)
async def admin_get_user(username: str, session: SessionDep, admin: CurrentAdminDep):
  query = select(User).where(User.username == username)
  result = await session.execute(query)
  user = result.scalar_one_or_none()

  if not user:
    raise HTTPException(status_code=404, detail="User not found")

  return user

# -- zmiana usera przez admina --
@router.patch("/user/{username}", response_model=UserAdminRead)
async def admin_update_user(username: str, user_data: UserAdminUpdate, session: SessionDep, admin: CurrentAdminDep):
  query = select(User).where(User.username == username)
  result = await session.execute(query) 
  db_user = result.scalar_one_or_none()

  if not db_user:
    raise HTTPException(status_code=404, detail="User not found")
  
  update_data = user_data.model_dump(exclude_unset=True)
  for key, value in update_data.items():
    setattr(db_user, key, value)

  session.add(db_user)
  await session.commit()
  await session.refresh(db_user)

  return db_user