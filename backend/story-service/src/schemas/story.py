from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field

# -- Story --
class StoryBase(BaseModel):
  title: str = Field(min_length=1, max_length=255)
  description: Optional[str] = Field(default=None, max_length=2000)
  age_rate: int = Field(default=18, ge=0, le=22)

class StoryCreate(StoryBase):
  story_json_path: str
  genre_ids: List[int] = []
  category_ids: List[int] = []

class StoryRead(StoryBase):
  id: int
  cover_pic_path: Optional[str]

  story_json_path: str
  
  created_at: datetime
  updated_at: datetime
  
  genre_ids: List[int] = []
  category_ids: List[int] = []

  model_config = ConfigDict(from_attributes=True)

class StoryUpdate(BaseModel):
  title: Optional[str] = Field(None, min_length=1, max_length=255)
  description: Optional[str] = Field(None, max_length=2000)
  age_rate: Optional[int] = Field(None, ge=0, le=22)
  cover_pic_path: Optional[str] = None
  story_json_path: Optional[str] = None

  genre_ids: Optional[List[int]] = None
  category_ids: Optional[List[int]] = None

class StoryRelationsPayload(BaseModel):
  genre_ids: List[int] = []
  category_ids: List[int] = []