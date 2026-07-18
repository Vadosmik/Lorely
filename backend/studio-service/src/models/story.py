from typing import List, Optional
from datetime import datetime
from sqlmodel import SQLModel, Field, Column
from sqlalchemy import ARRAY, Integer

class Story(SQLModel, table=True):
  __tablename__ = "story"

  id: Optional[int] = Field(default=None, primary_key=True)
  
  author_id: int
  title: str
  description: Optional[str] = Field(default=None, nullable=True)
  age_rate: int = Field(default=18)
  
  cover_pic_path: Optional[str] = Field(default=None)
  story_json_path: str

  genre_ids: List[int] = Field(default=[], sa_column=Column(ARRAY(Integer)))
  category_ids: List[int] = Field(default=[], sa_column=Column(ARRAY(Integer)))

  created_at: datetime = Field(default_factory=datetime.utcnow)
  updated_at: datetime = Field(default_factory=datetime.utcnow, sa_column_kwargs={"onupdate": datetime.utcnow})
  deleted_at: Optional[datetime] = Field(default=None)