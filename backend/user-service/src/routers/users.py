from fastapi import APIRouter, Depends, status, HTTPException
from typing import Annotated
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlmodel import select
from datetime import datetime, timezone

from core.db import get_session
from core.security import get_password_hash, verify_password
from core.dependencies import get_current_user, get_current_admin
from src.schemas.users import UserRead, UserUpdate, PasswordUpdate
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
async def change_my_password(data: PasswordUpdate, session: SessionDep, current_user: CurrentUserDep):
  if not data.new_password:
    raise HTTPException(status_code=400, detail="New password is required")
  
  if not verify_password(data.old_password, current_user.hashed_password):
    raise HTTPException(status_code=400, detail="Incorrect old password")
  
  current_user.hashed_password = get_password_hash(data.new_password)
  session.add(current_user)
  await session.commit()
  return {"message": "Password changed successfully"}

@router.delete("/me", status_code=status.HTTP_204_NO_CONTENT)
async def delete_my_account(session: SessionDep, current_user: CurrentUserDep):
  current_user.is_active = False
  current_user.deleted_at = datetime.now(timezone.utc)

  session.add(current_user)
  await session.commit()
  return None

# --- PUBLIC PROFILE & USERS ---
@router.get("/", response_model=list[UserRead])
async def get_users(session: SessionDep):
  query = select(User).where(User.deleted_at == None)
  result = await session.execute(query)
  return result.scalars().all()

@router.get("/{id}", response_model=UserRead)
async def get_user_profile(id: int, session: SessionDep):
  query = select(User).where(User.id == id, User.deleted_at == None)
  result = await session.execute(query)
  user = result.scalar_one_or_none()

  if not user:
    raise HTTPException(status_code=404, detail="User not found")
  return user

@router.get("/by/{username}", response_model=UserRead)
async def get_user_profile(username: str, session: SessionDep):
  query = select(User).where(User.username == username, User.deleted_at == None)
  result = await session.execute(query)
  user = result.scalar_one_or_none()

  if not user:
    raise HTTPException(status_code=404, detail="User not found")
  return user

# --- USER ROLES ---
@router.get("/{id}/roles", response_model=list[RoleRead])
async def get_user_roles(id: str, session: SessionDep, admin: CurrentAdminDep):
  query = select(User).where(User.id == id).options(selectinload(User.roles))
  result = await session.execute(query)
  user = result.scalar_one_or_none()
     
  if not user:
    raise HTTPException(status_code=404, detail="User not found")
  
  return user.roles