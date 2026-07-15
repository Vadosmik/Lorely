from typing import List, Optional
from datetime import datetime, date
from sqlmodel import SQLModel, Field, Relationship

class UserRole(SQLModel, table=True):
  user_id: Optional[int] = Field(default=None, foreign_key="users.id", primary_key=True)
  role_id: Optional[int] = Field(default=None, foreign_key="roles.id", primary_key=True)

class Role(SQLModel, table=True):
  __tablename__ = "roles"
  id: Optional[int] = Field(default=None, primary_key=True)
  title: str = Field(unique=True)

  users: List["User"] = Relationship(back_populates="roles", link_model=UserRole)

class User(SQLModel, table=True):
  __tablename__ = "users"

  id: Optional[int] = Field(default=None, primary_key=True)
  username: str = Field(unique=True, index=True)
  email: str = Field(unique=True, index=True)
  hashed_password: str

  ava_pic_path: Optional[str] = Field(default=None)
  bio: Optional[str] = Field(default=None)
  birthday_date: Optional[date] = Field(default_factory=datetime.utcnow)

  is_active: bool = Field(default=True)
  tos_accepted_at: Optional[datetime] = Field(default_factory=datetime.utcnow)

  last_login_at: Optional[datetime] = Field(default=None)

  created_at: datetime = Field(default_factory=datetime.utcnow)
  updated_at: datetime = Field(default_factory=datetime.utcnow, sa_column_kwargs={"onupdate": datetime.utcnow})
  deleted_at: Optional[datetime] = Field(default=None)

  roles: List["Role"] = Relationship(
    back_populates="users", 
    link_model=UserRole,
    sa_relationship_kwargs={"lazy": "selectin"}
  )
