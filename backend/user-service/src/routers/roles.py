from fastapi import APIRouter, Depends, status, HTTPException
from typing import Annotated, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlmodel import select

from core.db import get_session
from core.dependencies import get_current_admin
from src.schemas.roles import RoleRead, RoleCreate, RoleAssign
from src.models.users import Role, User

router = APIRouter(prefix="/roles", tags=["roles"])

SessionDep = Annotated[AsyncSession, Depends(get_session)]
CurrentAdminDep = Annotated[User, Depends(get_current_admin)]

# --- ROLE MANAGEMENT (Admin Only) ---

@router.post("/", response_model=RoleRead, status_code=status.HTTP_201_CREATED)
async def create_role(role_data: RoleCreate, session: SessionDep, admin: CurrentAdminDep):
  query = select(Role).where(Role.title == role_data.title)
  result = await session.execute(query)

  if result.scalars().first():
    raise HTTPException(status_code=400, detail="Role already exists")

  db_role = Role(title=role_data.title)

  session.add(db_role)
  await session.commit()
  await session.refresh(db_role)
  return db_role


@router.get("/", response_model=List[RoleRead])
async def get_all_roles(session: SessionDep, admin: CurrentAdminDep):
  result = await session.execute(select(Role))
  return result.scalars().all()

@router.post("/assign", status_code=status.HTTP_200_OK)
async def assign_role_to_user(assign_data: RoleAssign, session: SessionDep, admin: CurrentAdminDep):
  # 1. Pobierz użytkownika RAZEM z jego relacjami ról
  query = select(User).where(User.username == assign_data.username).options(selectinload(User.roles))
  result = await session.execute(query)
  user = result.scalar_one_or_none()
     
  if not user:
    raise HTTPException(status_code=404, detail="User not found")

  # 2. Pobierz rolę
  query = select(Role).where(Role.title == assign_data.role_title)
  result = await session.execute(query)
  role = result.scalar_one_or_none()
     
  if not role:
    raise HTTPException(status_code=404, detail="Role not found")
  
  # 3. Przypisz jeśli nie ma
  if role not in user.roles:
    user.roles.append(role)
    session.add(user)
    await session.commit()
    return {"message": f"Role '{role.title}' assigned to user '{user.username}'"}
     
  return {"message": "User already has this role"}


@router.delete("/assign", status_code=status.HTTP_200_OK)
async def remove_role_from_user(assign_data: RoleAssign, session: SessionDep, admin: CurrentAdminDep):
  # 1. Pobierz użytkownika z załadowanymi rolami
  query = select(User).where(User.username == assign_data.username).options(selectinload(User.roles))
  result = await session.execute(query)
  user = result.scalar_one_or_none()
     
  if not user:
    raise HTTPException(status_code=404, detail="User not found")

  # 2. Sprawdź czy rola w ogóle jest przypisana
  role_to_remove = next((r for r in user.roles if r.title == assign_data.role_title), None)
  
  # 3. Usuń rolę z listy relacji użytkownika
  if role_to_remove:
    user.roles.remove(role_to_remove)
    session.add(user)
    await session.commit()
    return {"message": f"Role '{assign_data.role_title}' removed from user '{user.username}'"}

  raise HTTPException(status_code=404, detail="Role not assigned to this user")


# --- DELETE A ROLE COMPLETELY FROM THE SYSTEM ---
@router.delete("/{role_title}", status_code=status.HTTP_200_OK)
async def delete_role_completely(role_title: str, session: SessionDep, admin: CurrentAdminDep):
  query = select(Role).where(Role.title == role_title)
  result = await session.execute(query)
  role = result.scalar_one_or_none()

  if not role:
    raise HTTPException(status_code=404, detail="Role not found")

  await session.delete(role)
  await session.commit()
  
  return {"message": f"Role '{role_title}' has been completely removed from the system"}