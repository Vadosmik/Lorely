from fastapi import APIRouter, Depends, status, HTTPException
from typing import Annotated, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import or_, select

from core.db import get_session
from core.dependencies import check_is_admin
from src.schemas.category import CategoryRead, CategoryCreate
from src.models.story import Category

router = APIRouter(prefix="/categories", tags=["categories"])

SessionDep = Annotated[AsyncSession, Depends(get_session)]
CurrentAdminDep = Annotated[bool, Depends(check_is_admin)]

@router.get("/", response_model=List[CategoryRead])
async def get_all_categories(session: SessionDep):
  result = await session.execute(select(Category))
  return result.scalars().all()

# --- CATEGORY MANAGEMENT (Admin Only) ---
@router.post("/", response_model=CategoryRead, status_code=status.HTTP_201_CREATED)
async def create_category(category_data: CategoryCreate, session: SessionDep, admin: CurrentAdminDep):
  query = select(Category).where(
    or_(
        Category.slug == category_data.slug,
        Category.en == category_data.en,
        Category.ru == category_data.ru,
        Category.pl == category_data.pl,
        Category.by == category_data.by
      )
    )
  result = await session.execute(query)
  existing_category = result.scalars().first()

  if existing_category:
    raise HTTPException(
      status_code=400, 
      detail="Categorys with this slug or translation already exists"
      )

  db_category = Category.model_validate(category_data)

  session.add(db_category)
  await session.commit()
  await session.refresh(db_category)
  return db_category

@router.patch("/{category_id}")
async def update_category(category_id: int, category_data: CategoryCreate, session: SessionDep, admin: CurrentAdminDep):
  query = select(Category).where(Category.id == category_id)
  result = await session.execute(query)
  category = result.scalar_one_or_none()

  update_data = category_data.model_dump(exclude_unset=True)
  for key, value in update_data.items():
    setattr(category, key, value)

  session.add(category)
  await session.commit()
  await session.refresh(category)
  return category

@router.delete("/{category_id}", status_code=status.HTTP_200_OK)
async def delete_category(category_id: int, session: SessionDep, admin: CurrentAdminDep):
  query = select(Category).where(Category.id == category_id)
  result = await session.execute(query)
  category = result.scalar_one_or_none()

  if not category:
    raise HTTPException(status_code=404, detail="Category not found")

  await session.delete(category)
  await session.commit()
  
  return {"message": f"Category '{category_id}' has been completely removed from the system"}