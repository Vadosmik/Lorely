import re
from datetime import date, datetime
from typing import List, Optional
from pydantic import EmailStr, field_validator
from sqlmodel import Field, Relationship, SQLModel
from sqlalchemy import Column, TEXT, ForeignKey

class UserRole(SQLModel, table=True):
  __tablename__ = "user_role"

  user_id: int = Field( sa_column_args=[ForeignKey("users.id", ondelete="CASCADE")], primary_key=True)
  role_id: int = Field( sa_column_args=[ForeignKey("role.id", ondelete="CASCADE")], primary_key=True )

class Role(SQLModel, table=True):
  id: Optional[int] = Field(default=None, primary_key=True)
  title: str = Field(max_length=50, unique=True, nullable=False)
  
  users: List["User"] = Relationship(back_populates="roles", link_model=UserRole)

class UserBase(SQLModel):
  username: str = Field(max_length=100, nullable=False)
  email: str = Field(max_length=255, unique=True, nullable=False)
  bio: Optional[str] = Field(default=None, sa_column=Column(TEXT))
  birth_date: Optional[date] = Field(default=None)
  avatar_path: Optional[str] = Field(default="/uploads/avatars/default_avatar.svg", sa_column=Column(TEXT))

class User(UserBase, table=True):
  __tablename__ = "users"
  id: Optional[int] = Field(default=None, primary_key=True)
  pass_hash: str = Field(max_length=255, nullable=False)
  is_active: bool = Field(default=True)
  created_at: datetime = Field(default_factory=datetime.utcnow)
  updated_at: datetime = Field(default_factory=datetime.utcnow)
  deleted_at: Optional[datetime] = Field(default=None)

  roles: List[Role] = Relationship(back_populates="users", link_model=UserRole)
  stories: List["Story"] = Relationship(back_populates="author")
  reading_histories: List["ReadHistory"] = Relationship(back_populates="user")
  opinions: List["Opinion"] = Relationship(back_populates="user")

class UserCreate(UserBase):
  password: str

  @field_validator("email")
  @classmethod
  def validate_email(cls, v: str) -> str:
      if not re.match(r"[^@]+@[^@]+\.[^@]+", v):
          raise ValueError("Invalid email format")
      return v

  @field_validator("password")
  @classmethod
  def validate_password(cls, v: str) -> str:
      if len(v) < 8:
          raise ValueError("Password must be at least 8 characters long")
      if not re.search(r"[A-Z]", v):
          raise ValueError("Password must contain at least one uppercase letter")
      if not re.search(r"[a-z]", v):
          raise ValueError("Password must contain at least one lowercase letter")
      if not re.search(r"\d", v): # I'll add digit for extra safety even if not explicitly asked, but user asked for "znaj specjalny"
          pass # wait, user asked for: min 8znak, min 1 duza, znaj specjalny i min 1 mała.
      if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", v):
          raise ValueError("Password must contain at least one special character")
      return v

class UserRead(UserBase):
  id: int
  is_active: bool
  created_at: datetime

class UserUpdate(SQLModel):
  username: Optional[str] = None
  bio: Optional[str] = None
  birth_date: Optional[date] = None
  avatar_path: Optional[str] = None

class Token(SQLModel):
    access_token: str
    token_type: str = "bearer"

class TokenPayload(SQLModel):
    sub: Optional[int] = None