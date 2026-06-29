from fastapi import APIRouter, Depends, status, HTTPException
from typing import Annotated
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlmodel import select
import jwt

from core.db import get_session
from core.security import create_access_token, get_password_hash, verify_password, create_refresh_token
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
  refresh_token = create_refresh_token(data={"sub": str(user.id)})

  # 4. Zwrócenie tokenu
  return {
      "access_token": access_token, 
      "refresh_token": refresh_token,
      "token_type": "bearer"
    }


# @router.post("/refresh", response_model=Token)
# async def refresh_access_token(refresh_token: str, session: SessionDep):
#   try:
#     # Dekodujemy otrzymany refresh token
#     payload = jwt.decode(refresh_token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
      
#     # Sprawdzamy czy to na pewno token typu 'refresh'
#     if payload.get("type") != "refresh":
#       raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token type")
          
#     user_id = payload.get("sub")
#     if not user_id:
#       raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token claims")
            
#   except jwt.ExpiredSignatureError:
#     raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token expired. Please login again.")
#   except jwt.PyJWTError:
#     raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")

#   # Pobieramy użytkownika z bazy, aby upewnić się, że nadal istnieje i jest aktywny
#   query = select(User).where(User.id == user_id).options(selectinload(User.roles))
#   result = await session.execute(query)
#   user = result.scalar_one_or_none()

#   if not user or not user.is_active:
#     raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found or inactive")

#   # Generujemy NOWY access token
#   user_roles = [role.title for role in (user.roles or [])]
#   new_access_token = create_access_token(data={"sub": str(user.id), "roles": user_roles})

#   return {
#     "access_token": new_access_token,
#     "refresh_token": refresh_token,
#     "token_type": "bearer"
#     }