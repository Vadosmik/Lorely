from fastapi import APIRouter, Depends, status, HTTPException
from typing import Annotated
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlmodel import select

from core.db import get_session
from core.security import create_access_token, get_password_hash, verify_password
from core.dependencies import get_current_user
from src.schemas.users import Token, UserCreate, UserLogin, UserRead
from src.models.users import User

router = APIRouter(prefix="/auth", tags=["auth"])

SessionDep = Annotated[AsyncSession, Depends(get_session)]

# --- AUTHENTICATION ---
@router.post("/register", response_model=UserRead, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate, session: SessionDep):
  # 1. validacja czy uzytkownik istnieje
  query = select(User).where((User.email == user_data.email) | (User.username == user_data.username))
  result = await session.execute(query)
  if result.scalars().first():
    raise HTTPException(
      status_code=status.HTTP_400_BAD_REQUEST,
      detail="User with this email or username already exists"
    )

  # 2. haszowanie hasła
  hashed_pwd = get_password_hash(user_data.password)

  # 3. tworzenia objektu w bazie
  db_user = User(
    username=user_data.username,
    email=user_data.email,
    hashed_password=hashed_pwd
  )

  # 4. Asynchroniczny zapis do bazy
  session.add(db_user)
  await session.commit()
  await session.refresh(db_user)

  # 5. return
  return db_user

@router.post("/login", response_model=Token)
async def login(login_data: UserLogin, session: SessionDep):
  # 1. Szukamy użytkownika (z poprawionymi nawiasami)
  query = select(User).where((User.email == login_data.username_or_email) | (User.username == login_data.username_or_email)).options(selectinload(User.roles))
  result = await session.execute(query)
  user = result.scalar_one_or_none()

  # 2. Wspólna walidacja (User + Hasło)
  if not user or not verify_password(login_data.password, user.hashed_password):
    raise HTTPException(
      status_code=status.HTTP_401_UNAUTHORIZED,
      detail="Incorrect username/email or password",
      headers={"WWW-Authenticate": "Bearer"}
    )
  
  if not user.is_active:
    raise HTTPException(
      status_code=status.HTTP_403_FORBIDDEN,
      detail="This user is banned"
    )
  
  # 3. Generowanie tokenu
  user_roles = [role.title for role in (user.roles or [])]
  
  access_token = create_access_token(
    data={
      "sub": str(user.id),
      "roles": user_roles
      }
    )

  # 4. Zwrócenie tokenu
  return {"access_token": access_token, "token_type": "bearer"}