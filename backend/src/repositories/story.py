from typing import Optional, Sequence, List
from decimal import Decimal
from datetime import datetime
from enum import Enum
from sqlmodel import Session, select, func, or_
from sqlalchemy.orm import joinedload
from src.models.story import Story
from src.models.reading import Opinion, ReadHistory

class StorySortOption(str, Enum):
  AZ = "az"                   # Alfabetycznie A-Z
  ZA = "za"                   # Alfabetycznie Z-A
  LIKES = "likes"             # Najwięcej polubień
  VIEWS = "views"             # Najwięcej wyświetleń
  DATE_DESC = "date_desc"     # Od najnowszych (domyślnie)
  DATE_ASC = "date_asc"       # Od najstarszych

class StoryRepository:
  def __init__(self, session: Session):
    self.session = session
  
  def get_by_id(self, story_id: int) -> Optional[Story]:
    statement = (
      select(Story)
      .where(Story.id == story_id, Story.deleted_at == None)
      .options(
        joinedload(Story.author),
        joinedload(Story.categories),
        joinedload(Story.genres),
        joinedload(Story.status)
      )
    )
    return self.session.exec(statement).first()

  def get_catalog(
    self, 
    genre_ids: Optional[List[int]] = None, 
    category_ids: Optional[List[int]] = None, 
    sort_by: StorySortOption = StorySortOption.DATE_DESC
  ) -> Sequence[Story]:
    statement = select(Story).where(Story.deleted_at == None)
    
    # Filtrowanie
    if genre_ids:
      genre_filters = [Story.genres.any(id=g_id) for g_id in genre_ids]
      statement = statement.filter(or_(*genre_filters))

    # Filtrowanie
    if category_ids:
      category_filters = [Story.categories.any(id=c_id) for c_id in category_ids]
      statement = statement.filter(or_(*category_filters))
    
    # Sortowanie
    if sort_by == StorySortOption.AZ:
      statement = statement.order_by(Story.title.asc())
    elif sort_by == StorySortOption.ZA:
      statement = statement.order_by(Story.title.desc())
    elif sort_by == StorySortOption.LIKES:
      statement = statement.order_by(Story.likes.desc(), Story.created_at.desc())
    elif sort_by == StorySortOption.VIEWS:
      statement = statement.order_by(Story.views.desc(), Story.created_at.desc())
    elif sort_by == StorySortOption.DATE_ASC:
      statement = statement.order_by(Story.created_at.asc())
    else:
      statement = statement.order_by(Story.created_at.desc())
      
    return self.session.exec(statement).all()

  def get_average_rating(self, story_id: int) -> Optional[Decimal]:
    statement = select(func.avg(Opinion.rating)).where(Opinion.story_id == story_id)
    result = self.session.exec(statement).first()
    return round(Decimal(result), 2) if result else None

  def get_author_stories(self, author_id: int) -> Sequence[Story]:
    statement = select(Story).where(Story.author_id == author_id, Story.deleted_at == None)
    return self.session.exec(statement).all()

  def create(self, story: Story) -> Story:
    self.session.add(story)
    self.session.commit()
    self.session.refresh(story)
    return story
  
  def update(self) -> None:
    self.session.commit()
  
  def delete(self, story: Story) -> None:
    story.deleted_at = datetime.utcnow()
    self.session.commit()

  # Opinions
  def get_opinion(self, user_id: int, story_id: int) -> Optional[Opinion]:
    statement = select(Opinion).where(
      Opinion.user_id == user_id, 
      Opinion.story_id == story_id
    )
    return self.session.exec(statement).first()

  def create_opinion(self, opinion: Opinion) -> Opinion:
    self.session.add(opinion)
    self.session.commit()
    self.session.refresh(opinion)
    return opinion

  def get_story_opinions(self, story_id: int) -> Sequence[Opinion]:
    statement = select(Opinion).where(Opinion.story_id == story_id)
    return self.session.exec(statement).all()

  # Reading History (Progress)
  def get_read_history(self, user_id: int, story_id: int) -> Optional[ReadHistory]:
    statement = select(ReadHistory).where(
      ReadHistory.user_id == user_id, 
      ReadHistory.story_id == story_id
    )
    return self.session.exec(statement).first()

  def create_read_history(self, history: ReadHistory) -> ReadHistory:
    self.session.add(history)
    self.session.commit()
    self.session.refresh(history)
    return history
