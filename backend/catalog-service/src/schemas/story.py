from typing import List, Optional
from datetime import datetime, date
from pydantic import BaseModel, ConfigDict, Field
from enum import Enum

from src.schemas.genre import GenreRead
from src.schemas.category import CategoryRead

class StoryStatus(str, Enum):
  ANNOUNCEMENT = "Announcement"
  CONTINUES = "Continues"
  FROZEN = "Frozen"
  FINISHED = "Finished"

# -- Story --
class StoryBase(BaseModel):
  title: str = Field(min_length=1, max_length=255)
  description: Optional[str] = Field(default=None, max_length=2000)
  age_rate: int = Field(default=18, ge=0, le=22)

class StoryCreate(StoryBase):
  id: int
  author_id: int = 0
  cover_pic_path: Optional[str] = Field(default=None)
  age_rate: int = Field(default=18)
  status: StoryStatus = Field(default=StoryStatus.ANNOUNCEMENT)
  story_json_path: Optional[str] = Field(default=None)

  genre_ids: Optional[List[int]] = None
  category_ids: Optional[List[int]] = None

class StoryGetCatalog(StoryBase):
  id: int
  cover_pic_path: Optional[str]


  author_id: int
  status: StoryStatus
  
  published_at: datetime
  updated_at: datetime

  genre_ids: Optional[List[int]] = None
  category_ids: Optional[List[int]] = None

  model_config = ConfigDict(from_attributes=True)

class StoryRead(StoryBase):
  id: int
  cover_pic_path: Optional[str]
  author_id: int

  liked: int
  viewed: int
  status: StoryStatus

  story_json_path: Optional[str] = Field(default=None)
  
  published_at: datetime
  updated_at: datetime
  
  genres: List[GenreRead] = []
  categories: List[CategoryRead] = []

  model_config = ConfigDict(from_attributes=True)

class StoryUpdate(BaseModel):
  title: Optional[str] = Field(None, min_length=1, max_length=255)
  description: Optional[str] = Field(None, max_length=2000)
  age_rate: Optional[int] = Field(None, ge=0, le=22)
  status: Optional[StoryStatus] = None
  cover_pic_path: Optional[str] = None
  story_json_path: Optional[str] = None
  genre_ids: Optional[List[int]] = None
  category_ids: Optional[List[int]] = None

class StoryUpdateLikeView(BaseModel):
  liked: Optional[int] = None
  viewed: Optional[int] = None

class StoryRelationsPayload(BaseModel):
  genre_ids: List[int] = []
  category_ids: List[int] = []

class StoryFilterPayload(BaseModel):
  genre_ids: Optional[List[int]] = None
  category_ids: Optional[List[int]] = None