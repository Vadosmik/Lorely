from decimal import Decimal
from typing import List, Optional
from sqlmodel import Field, Relationship, SQLModel
from sqlalchemy import Column, ARRAY, TEXT, DECIMAL, ForeignKey

class ReadingStatus(SQLModel, table=True):
  __tablename__ = "reading_status"
  id: Optional[int] = Field(default=None, primary_key=True)
  slug: str = Field(unique=True, max_length=50)
  title_en: str = Field(max_length=100)
  title_ru: str = Field(max_length=100)

class ReadHistory(SQLModel, table=True):
  __tablename__ = "read_history"
  user_id: int = Field( sa_column_args=[ForeignKey("users.id", ondelete="CASCADE")], primary_key=True )
  story_id: int = Field( sa_column_args=[ForeignKey("story.id", ondelete="CASCADE")], primary_key=True )
  status_id: int = Field(foreign_key="reading_status.id")
  history: List[str] = Field(sa_column=Column(ARRAY(TEXT), nullable=False))
  is_favorite: bool = Field(default=False)

  user: "User" = Relationship(back_populates="reading_histories")
  story: "Story" = Relationship(back_populates="reading_histories")

class Opinion(SQLModel, table=True):
  user_id: int = Field( sa_column_args=[ForeignKey("users.id", ondelete="CASCADE")], primary_key=True )
  story_id: int = Field( sa_column_args=[ForeignKey("story.id", ondelete="CASCADE")], primary_key=True )
  rating: Decimal = Field(sa_column=Column(DECIMAL(3, 2), nullable=False))
  review: str = Field(sa_column=Column(TEXT, nullable=False))
  
  user: "User" = Relationship(back_populates="opinions")
  story: "Story" = Relationship(back_populates="opinions")