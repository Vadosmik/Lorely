from fastapi import Depends, status, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Annotated
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import selectinload
from sqlmodel import select

import jwt

from core.config import settings
from core.db import get_session
from src.models.users import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

SessionDep = Annotated[AsyncSession, Depends(get_session)]
TokenDep = Annotated[str, Depends(oauth2_scheme)]

async def get_current_user(session: SessionDep, token: TokenDep) -> User:
  credentials_exception = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Could not validate credentials",
    headers={"WWW-Authenticate": "Bearer"},
  )
  try:
    payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
    user_id: str = payload.get("sub")
    if user_id is None:
      raise credentials_exception
  except jwt.PyJWTError:
    raise credentials_exception

  statement = select(User).where(User.id == int(user_id)).options(selectinload(User.roles))
  result = await session.execute(statement)
  user = result.scalar_one_or_none()

  if user is None:
    raise credentials_exception
  return user

async def get_current_admin(current_user: Annotated[User, Depends(get_current_user)]) -> User:
  if not any(role.title == "admin" for role in current_user.roles):
    raise HTTPException(status_code=403, detail="Not enough permissions")
  return current_user
