from typing import List, Optional
from datetime import datetime, date
from pydantic import BaseModel, ConfigDict, Field
from enum import Enum

from src.schemas.genre import GenreRead
from src.schemas.category import CategoryRead

class StoryStatus(str, Enum):
  DRAFT = "Draft"
  ANNOUNCEMENT = "Announcement"
  CONTINUES = "Continues"
  FROZEN = "Frozen"
  FINISHED = "Finished"

# -- Story --
class StoryBase(BaseModel):
  title: str = Field(min_length=1, max_length=255)
  description: Optional[str] = Field(min_length=1, max_length=2000)
  age_rate: int = Field(default=18, ge=0, le=22)

class StoryCreate(StoryBase):
  story_json_path: str

class StoryRead(StoryBase):
  id: int
  cover_pic_path: Optional[str]

  liked: int
  viewed: int
  status: StoryStatus
  story_json_path: str
  
  created_at: datetime
  updated_at: datetime
  
  genres: List[GenreRead] = []
  categories: List[CategoryRead] = []

  model_config = ConfigDict(from_attributes=True)

class StoryUpdate(BaseModel):
  title: Optional[str] = Field(None, min_length=1, max_length=255)
  description: Optional[str] = Field(None, min_length=1, max_length=2000)
  age_rate: Optional[int] = Field(None, ge=0, le=22)
  status: Optional[StoryStatus] = None
  cover_pic_path: Optional[str] = None
  story_json_path: Optional[str] = None
  genre_ids: Optional[List[int]] = None
  category_ids: Optional[List[int]] = None

class StoryRelationsPayload(BaseModel):
  genre_ids: List[int] = []
  category_ids: List[int] = []