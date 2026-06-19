from fastapi import APIRouter, Depends, status, HTTPException
from typing import Annotated
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlmodel import select
import datetime  # Potrzebne do stref czasowych

from core.db import get_session
from core.security import get_password_hash
from core.dependencies import get_current_user, get_current_admin
from src.schemas.users import UserRead, UserUpdate
from src.schemas.roles import RoleRead
from src.models.users import User

router = APIRouter(prefix="/users", tags=["users"])

SessionDep = Annotated[AsyncSession, Depends(get_session)]
CurrentUserDep = Annotated[User, Depends(get_current_user)]
CurrentAdminDep = Annotated[User, Depends(get_current_admin)]

# --- PRIVATE USER PROFILE ---
@router.get("/me/profile", response_model=UserRead)
async def get_my_profile(current_user: CurrentUserDep):
  return current_user

@router.patch("/me/profile", response_model=UserRead)
async def update_my_profile(user_data: UserUpdate, session: SessionDep, current_user: CurrentUserDep):
  update_data = user_data.model_dump(exclude_unset=True)
  for key, value in update_data.items():
    setattr(current_user, key, value)

  session.add(current_user)
  await session.commit()
  await session.refresh(current_user)
  return current_user

@router.patch("/me/password")
async def change_my_password(password_data: UserUpdate, session: SessionDep, current_user: CurrentUserDep):
  if not password_data.password:
    raise HTTPException(status_code=400, detail="New password is required")
  
  current_user.hashed_password = get_password_hash(password_data.password)
  session.add(current_user)
  await session.commit()
  return {"message": "Password changed successfully"}

@router.delete("/me", status_code=status.HTTP_204_NO_CONTENT)
async def delete_my_account(session: SessionDep, current_user: CurrentUserDep):
  current_user.is_active = False
  current_user.deleted_at = datetime.datetime.now(datetime.timezone.utc)

  session.add(current_user)
  await session.commit()
  return None

# --- PUBLIC PROFILE & USERS ---
@router.get("/", response_model=list[UserRead])
async def get_users(session: SessionDep):
  query = select(User).where(User.is_active == True)
  result = await session.execute(query)
  return result.scalars().all()

@router.get("/{username}", response_model=UserRead)
async def get_user_profile(username: str, session: SessionDep):
  query = select(User).where(User.username == username, User.is_active == True)
  result = await session.execute(query)
  user = result.scalar_one_or_none()  # <--- Naprawiona literówka

  if not user:
    raise HTTPException(status_code=404, detail="User not found")
  return user

# --- USER ROLES ---
@router.get("/{username}/roles", response_model=list[RoleRead])  # <--- Poprawiony model na list[RoleRead]
async def get_user_roles(username: str, session: SessionDep, admin: CurrentAdminDep):
  query = select(User).where(User.username == username).options(selectinload(User.roles))
  result = await session.execute(query)
  user = result.scalar_one_or_none()
     
  if not user:
    raise HTTPException(status_code=404, detail="User not found")
  
  return user.roles