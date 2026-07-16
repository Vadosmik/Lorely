from typing import List, Optional
from datetime import datetime, date
from src.schemas.roles import RoleRead
from pydantic import BaseModel, EmailStr, ConfigDict, Field, field_validator

from core.config import FORBIDDEN_USERNAMES

class UserLogin(BaseModel):
  username_or_email: str
  password: str

class Token(BaseModel):
  access_token: str
  token_type: str = "bearer"

class RefreshTokenRequest(BaseModel):
  refresh_token: str

class UserBase(BaseModel):
  username: str = Field(
    min_length=3, 
    max_length=20,
    pattern="^[a-zA-Z0-9_]+$",
    examples=["User123"]
    )
  email: EmailStr
  ava_pic_path: Optional[str] = None
  bio: Optional[str] = None
  birthday_date: Optional[date] = None

  @field_validator('username')
  @classmethod
  def username_not_forbidden(cls, v: str) -> str:
    if v.lower() in FORBIDDEN_USERNAMES:
      raise ValueError(f"Username: '{v}' is reserved.")
    return v

# Rejestracja
class UserCreate(UserBase):
  password: str = Field(
    min_length=8,
    pattern="^[-a-zA-Z0-9+*=_!?@#$%&~.]+$"
    )
  tos_accepted: bool

  @field_validator('tos_accepted')
  @classmethod
  def must_accept_tos(cls, v: bool) -> bool:
    if not v:
      raise ValueError('You must accept Terms of Service to register')
    return v

# Aktualizacja danych przez Użytkownika
class UserUpdate(BaseModel):
  username: Optional[str] = Field(
    None,
    min_length=3, 
    max_length=20,
    pattern="^[a-zA-Z0-9_]+$",
    examples=["User123"]
    )
  email: Optional[EmailStr] = None
  ava_pic_path: Optional[str] = None
  bio: Optional[str] = None
  birthday_date: Optional[date] = None
  
  @field_validator('username')
  @classmethod
  def username_not_forbidden(cls, v: str) -> str:
    if v.lower() in FORBIDDEN_USERNAMES:
      raise ValueError(f"Username: '{v}' is reserved.")
    return v
  
class PasswordUpdate(BaseModel):
  old_password: str
  new_password: str = Field(
    min_length=8,
    pattern="^[-a-zA-Z0-9+*=_!?@#$%&~.]+$"
  )

# Panel Admina - rozszerzone uprawnienia (np. banowanie, przywracanie)
class UserAdminUpdate(UserUpdate):
  is_active: Optional[bool] = None
  deleted_at: Optional[datetime] = None

# Odczyt danych (Standardowy profil)
class UserRead(UserBase):
  id: int
  is_active: bool
  created_at: datetime
  updated_at: datetime

  model_config = ConfigDict(from_attributes=True)

# Odczyt danych dla Admina dodatkowo
class UserAdminRead(UserRead):
  deleted_at: Optional[datetime] = None
  tos_accepted_at: Optional[datetime] = None
  last_login_at: Optional[datetime] = None

  roles: List[RoleRead] = []
