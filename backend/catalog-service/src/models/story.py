from typing import List, Optional
from datetime import datetime, timezone
from enum import Enum
from sqlmodel import SQLModel, Field, Relationship

# 1. Status(Enum)
class StoryStatus(str, Enum):
  ANNOUNCEMENT = "Announcement"
  CONTINUES = "Continues"
  FROZEN = "Frozen"
  FINISHED = "Finished"

class StoryGenre(SQLModel, table=True):
  __tablename__ = "story_genres"

  story_id: Optional[int] = Field(default=None, foreign_key="story.id", primary_key=True)
  genre_id: Optional[int] = Field(default=None, foreign_key="genres.id", primary_key=True)

class StoryCategory(SQLModel, table=True):
  __tablename__ = "story_categories"

  story_id: Optional[int] = Field(default=None, foreign_key="story.id", primary_key=True)
  category_id: Optional[int] = Field(default=None, foreign_key="categories.id", primary_key=True)

# 2. Dictionary (Genre / Category)
class Genre(SQLModel, table=True):
  __tablename__ = "genres"
  id: Optional[int] = Field(default=None, primary_key=True)
  slug: str = Field(unique=True)

  en: str = Field(unique=True)
  ru: str = Field(unique=True)
  pl: str = Field(unique=True)
  by: str = Field(unique=True)

  stories: List["Story"] = Relationship(back_populates="genres", link_model=StoryGenre)

class Category(SQLModel, table=True):
  __tablename__ = "categories"
  id: Optional[int] = Field(default=None, primary_key=True)
  slug: str = Field(unique=True)

  en: str = Field(unique=True)
  ru: str = Field(unique=True)
  pl: str = Field(unique=True)
  by: str = Field(unique=True)

  stories: List["Story"] = Relationship(back_populates="categories", link_model=StoryCategory)

# 3. Model Story
class Story(SQLModel, table=True):
  __tablename__ = "story"

  id: Optional[int] = Field(autoincrement=False, primary_key=True)
  
  author_id: int
  cover_pic_path: Optional[str] = Field(default=None)
  title: str
  description: Optional[str] = Field(default=None, nullable=True)

  liked: int = Field(default=0)
  viewed: int = Field(default=0)
  age_rate: int = Field(default=18)
  
  status: StoryStatus = Field(default=StoryStatus.ANNOUNCEMENT)
  story_json_path: str

  published_at: datetime = Field(default_factory=datetime.utcnow)
  updated_at: datetime = Field(default_factory=datetime.utcnow, sa_column_kwargs={"onupdate": datetime.utcnow})

  genres: List[Genre] = Relationship(back_populates="stories", link_model=StoryGenre)
  categories: List[Category] = Relationship(back_populates="stories", link_model=StoryCategory)