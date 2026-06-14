from datetime import datetime
from typing import List, Optional
from decimal import Decimal
from pydantic import BaseModel
from sqlmodel import Field, Relationship, SQLModel
from sqlalchemy import Column, TEXT, ForeignKey

class StoryCategory(SQLModel, table=True):
  __tablename__ = "story_category"
  story_id: int = Field( sa_column_args=[ForeignKey("story.id", ondelete="CASCADE")], primary_key=True )
  category_id: int = Field( sa_column_args=[ForeignKey("category.id", ondelete="CASCADE")], primary_key=True )

class StoryGenre(SQLModel, table=True):
  __tablename__ = "story_genre"
  story_id: int = Field( sa_column_args=[ForeignKey("story.id", ondelete="CASCADE")], primary_key=True )
  genre_id: int = Field( sa_column_args=[ForeignKey("genre.id", ondelete="CASCADE")], primary_key=True )

class StoryStatus(SQLModel, table=True):
  __tablename__ = "story_status"
  id: Optional[int] = Field(default=None, primary_key=True)
  slug: str = Field(unique=True, max_length=50)
  title_en: str = Field(max_length=100)
  title_ru: str = Field(max_length=100)

class Category(SQLModel, table=True):
  id: Optional[int] = Field(default=None, primary_key=True)
  slug: str = Field(unique=True, max_length=50)
  title_en: str = Field(max_length=100)
  title_ru: str = Field(max_length=100)

class Genre(SQLModel, table=True):
  id: Optional[int] = Field(default=None, primary_key=True)
  slug: str = Field(unique=True, max_length=50)
  title_en: str = Field(max_length=100)
  title_ru: str = Field(max_length=100)

class Story(SQLModel, table=True):
  id: Optional[int] = Field(default=None, primary_key=True)
  author_id: int = Field( sa_column_args=[ForeignKey("users.id", ondelete="CASCADE")])

  cover_path: Optional[str] = Field(default="/uploads/covers/default_cover.png", sa_column=Column(TEXT))
  title: str = Field(max_length=255, nullable=False)
  summary: Optional[str] = Field(default=None, sa_column=Column(TEXT))
  likes: int = Field(default=0)
  views: int = Field(default=0)
  age_rating: Optional[int] = Field(default=None)
  status_id: int = Field(sa_column_args=[ForeignKey("story_status.id")])
  story_json_path: str = Field(sa_column=Column(TEXT, nullable=False))
  created_at: datetime = Field(default_factory=datetime.utcnow)
  updated_at: datetime = Field(default_factory=datetime.utcnow)
  deleted_at: Optional[datetime] = Field(default=None)
  
  author: "User" = Relationship(back_populates="stories")
  categories: List[Category] = Relationship(link_model=StoryCategory)
  genres: List[Genre] = Relationship(link_model=StoryGenre)
  reading_histories: List["ReadHistory"] = Relationship(back_populates="story")
  opinions: List["Opinion"] = Relationship(back_populates="story")

  status: StoryStatus = Relationship()

class StoryCatalogOut(BaseModel):
  id: int
  title: str
  cover_path: Optional[str]
  age_rating: Optional[int] = None
  likes: int
  views: int
  average_rating: Optional[Decimal] = None

  class Config:
    from_attributes = True

class StoryPreviewOut(BaseModel):
  id: int
  title: str
  summary: Optional[str] = None
  cover_path: Optional[str]
  age_rating: Optional[int] = None
  likes: int
  views: int
  created_at: datetime
  status_slug: str
  author_username: str
  categories: List[Category] = []
  genres: List[Genre] = []
  average_rating: Optional[Decimal] = None

  class Config:
    from_attributes = True

class StoryCreate(BaseModel):
  title: str
  summary: Optional[str] = None
  cover_path: Optional[str] = None
  age_rating: Optional[int] = None
  status_id: int
  category_ids: List[int] = []
  genre_ids: List[int] = []

class StoryUpdate(BaseModel):
  title: Optional[str] = None
  summary: Optional[str] = None
  cover_path: Optional[str] = None
  age_rating: Optional[int] = None
  status_id: Optional[int] = None
  category_ids: Optional[List[int]] = None
  genre_ids: Optional[List[int]] = None
