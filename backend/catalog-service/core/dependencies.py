from fastapi import Depends, status, HTTPException
from typing import Annotated, Optional
from fastapi.security import OAuth2PasswordBearer

import jwt

from core.config import settings

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login", auto_error=False)

TokenDep = Annotated[Optional[str], Depends(oauth2_scheme)]

# 1. Fully Payload
async def get_current_token_payload(token: TokenDep) -> Optional[dict]:
  if token is None:
    return None
  try:
    payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
    return payload if payload.get("sub") is not None else None
  except jwt.PyJWTError:
    return None

PayloadDep = Annotated[Optional[dict], Depends(get_current_token_payload)]

async def require_payload(payload: PayloadDep) -> dict:
  if payload is None:
    raise HTTPException(
      status_code=status.HTTP_401_UNAUTHORIZED,
      detail="Could not validate credentials",
      headers={"WWW-Authenticate": "Bearer"},
    )
  return payload

RequiredPayloadDep = Annotated[dict, Depends(require_payload)]

# 2. Only ID
async def get_current_user_id(payload: RequiredPayloadDep) -> int:
  return int(payload["sub"])

# 3. age
async def get_current_user_age(payload: PayloadDep) -> int:
  if payload is None:
    return 12
  age = payload.get("age")
  return int(age) if age is not None else 12

# 4. is it an admin
async def check_is_admin(payload: RequiredPayloadDep) -> bool:
  roles = payload.get("roles", [])
  if "admin" not in roles:
    raise HTTPException(
      status_code=status.HTTP_403_FORBIDDEN, 
      detail="Not enough permissions. Admin role required."
    )
  return True

# 5. have subcription na przyszłość
# async def require_premium_tier(payload: RequiredPayloadDep) -> bool:
#   tier = payload.get("tier", "free")
#   if tier != "premium":
#     raise HTTPException(
#       status_code=status.HTTP_403_FORBIDDEN, 
#       detail="This feature requires a Premium subscription."
#     )
#   return True