from passlib.context import CryptContext
from datetime import datetime, timedelta, timezone

import jwt

from core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
  return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
  return pwd_context.hash(password)

def create_access_token(data: dict) -> str:
  to_encode = data.copy()
  
  # Ustawiamy czas wygaśnięcia na podstawie konfiguracji
  expire = datetime.now(timezone.utc) + timedelta(minutes=settings.JWT_EXPIRATION)
  to_encode.update({"exp": expire})
    
  # Kodujemy token przy użyciu klucza i algorytmu z settings
  encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)
  return encoded_jwt