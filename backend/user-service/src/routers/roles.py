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
  query = select(User).where(User.id == assign_data.user_id).options(selectinload(User.roles))
  result = await session.execute(query)
  user = result.scalar_one_or_none()
     
  if not user:
    raise HTTPException(status_code=404, detail="User not found")

  role = await session.get(Role, assign_data.role_id)
     
  if not role:
    raise HTTPException(status_code=404, detail="Role not found")
  
  if role not in user.roles:
    user.roles.append(role)
    session.add(user)
    await session.commit()
    return {"message": f"Role '{role.title}' assigned to user '{user.username}'"}
     
  return {"message": "User already has this role"}


@router.delete("/assign", status_code=status.HTTP_200_OK)
async def remove_role_from_user(assign_data: RoleAssign, session: SessionDep, admin: CurrentAdminDep):
  query = select(User).where(User.id == assign_data.user_id).options(selectinload(User.roles))
  result = await session.execute(query)
  user = result.scalar_one_or_none()
     
  if not user:
    raise HTTPException(status_code=404, detail="User not found")

  role_to_remove = next((r for r in user.roles if r.id == assign_data.role_id), None)
  
  if role_to_remove:
    user.roles.remove(role_to_remove)
    session.add(user)
    await session.commit()
    return {"message": f"Role '{role_to_remove.title}' removed from user '{user.username}'"}

  raise HTTPException(status_code=404, detail="Role not assigned to this user")


# --- DELETE A ROLE COMPLETELY FROM THE SYSTEM ---
@router.delete("/{role_id}", status_code=status.HTTP_200_OK)
async def delete_role_completely(role_id: int, session: SessionDep, admin: CurrentAdminDep):
  role = await session.get(Role, role_id)

  if not role:
    raise HTTPException(status_code=404, detail="Role not found")

  await session.delete(role)
  await session.commit()
  
  return {"message": f"Role '{role.title}' has been completely removed from the system"}