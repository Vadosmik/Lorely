# story-service/core/dependencies.py
from fastapi import Depends, status, HTTPException
from typing import Annotated
from fastapi.security import OAuth2PasswordBearer

import jwt

from core.config import settings

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

TokenDep = Annotated[str, Depends(oauth2_scheme)]

# 1. Fully Payload
async def get_current_token_payload(token: TokenDep) -> dict:
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
    return payload
  except jwt.PyJWTError:
    raise credentials_exception

PayloadDep = Annotated[dict, Depends(get_current_token_payload)]

# 2. Only ID
async def get_current_user_id(payload: PayloadDep) -> int:
  return int(payload.get("sub"))

# 3. is it an admin
async def check_is_admin(payload: PayloadDep) -> bool:
  roles = payload.get("roles", [])
  if "admin" not in roles:
    raise HTTPException(
      status_code=status.HTTP_403_FORBIDDEN, 
      detail="Not enough permissions. Admin role required."
    )
  return True

# 4. have subcription na przyszłość
# async def require_premium_tier(payload: PayloadDep) -> bool:
#   tier = payload.get("tier", "free")
#   if tier != "premium":
#     raise HTTPException(
#       status_code=status.HTTP_403_FORBIDDEN, 
#       detail="This feature requires a Premium subscription."
#     )
#   return True