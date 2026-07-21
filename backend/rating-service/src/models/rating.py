from enum import Enum
from pydantic import conint
from typing import Optional
from datetime import datetime
from sqlmodel import SQLModel, Field, UniqueConstraint

class ReadingStatus(str, Enum):
  READING = "Reading"
  I_WILL_READ = "IWillRead"
  READ = "Read"
  ABANDONED = "Abandoned"
  POSTPONED = "Postponed"

class ReadHistory(SQLModel, table=True):
  __tablename__ = "read_history"
  __table_args__ = UniqueConstraint("user_id", "story_id", name="uq_user_story_history")

  id: Optional[int] = Field(default=None, primary_key=True)
  user_id: int = Field(index=True)
  story_id: int = Field(index=True)
    
  status: ReadingStatus = Field(default=ReadingStatus.READING)
  is_favorite: bool = Field(default=False)
  
  updated_at: datetime = Field(default_factory=datetime.utcnow)

class Rating(SQLModel, table=True):
  __tablename__ = "rating"
  __table_args__ = UniqueConstraint("user_id", "story_id", name="uq_user_story_rating"),

  id: Optional[int] = Field(default=None, primary_key=True)
  user_id: int = Field(index=True)
  story_id: int = Field(index=True)
  
  value: conint(ge=0, le=10) = Field(nullable=False) 
  created_at: datetime = Field(default_factory=datetime.utcnow)
  
class Comment(SQLModel, table=True):
  __tablename__ = "comments"

  id: Optional[int] = Field(default=None, primary_key=True)
  user_id: int = Field(index=True)
  story_id: int = Field(index=True)
  
  content: str = Field(sa_column_kwargs={"type": "TEXT"})
  
  is_deleted: bool = Field(default=False)
  
  created_at: datetime = Field(default_factory=datetime.utcnow)
  updated_at: datetime = Field(default_factory=datetime.utcnow)