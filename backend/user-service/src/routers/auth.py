from fastapi import APIRouter, Depends, status, HTTPException
from typing import Annotated
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlmodel import select
from datetime import date

from core.config import settings
from core.db import get_session
from core.security import create_access_token, get_password_hash, verify_password, create_refresh_token, decode_refresh_token
from src.schemas.users import Token, RefreshTokenRequest, UserCreate, UserLogin, UserRead
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

def calculate_age(user):
  if user.birthday_date is None:
    return 12
  
  birthday = user.birthday_date
  
  today = date.today()
  age = today.year - birthday.year
  if (today.month, today.day) < (birthday.month, birthday.day):
    age -= 1

  return age

def _generate_user_tokens(user: User, refresh_token: str = None) -> dict:
  user_roles = [role.title for role in (user.roles or [])]

  access_token = create_access_token(
    data={
      "sub": str(user.id),
      "age": calculate_age(user),
      "roles": user_roles
      }
    )
  
  if not refresh_token:
    refresh_token = create_refresh_token(data={"sub": str(user.id)})

  return {
      "access_token": access_token, 
      "refresh_token": refresh_token,
      "token_type": "bearer"
    }

@router.post("/login", response_model=Token)
async def login(login_data: UserLogin, session: SessionDep):
  query = select(User).where((User.email == login_data.username_or_email) | (User.username == login_data.username_or_email)).options(selectinload(User.roles))
  result = await session.execute(query)
  user = result.scalar_one_or_none()

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
  
  return _generate_user_tokens(user)

@router.post("/refresh", response_model=Token)
async def refresh_access_token(payload: RefreshTokenRequest, session: SessionDep):
  try:
    user_id = decode_refresh_token(payload.refresh_token)
  except ValueError as e:
    raise HTTPException(status_code=401, detail=str(e))

  query = select(User).where(User.id == user_id).options(selectinload(User.roles))
  result = await session.execute(query)
  user = result.scalar_one_or_none()

  if not user or not user.is_active:
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found or inactive")

  return _generate_user_tokens(user, refresh_token=payload.refresh_token)
