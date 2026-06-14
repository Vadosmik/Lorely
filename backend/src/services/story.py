import json
import os
from datetime import datetime
from typing import List, Optional, Sequence
from fastapi import HTTPException, status
from sqlmodel import Session, select
from src.repositories.story import StoryRepository, StorySortOption
from src.models.story import Story, StoryCatalogOut, StoryPreviewOut, StoryCreate, StoryUpdate, Category, Genre
from src.models.reading import ReadHistory, Opinion

class StoryService:
  def __init__(self, session: Session):
    self.session = session
    self.repo = StoryRepository(session)

  def get_catalog_stories(
    self, 
    genre_ids: Optional[List[int]] = None, 
    category_ids: Optional[List[int]] = None, 
    sort_by: StorySortOption = StorySortOption.DATE_DESC
  ) -> List[StoryCatalogOut]:
    
    stories = self.repo.get_catalog(
      genre_ids=genre_ids, 
      category_ids=category_ids, 
      sort_by=sort_by
    )
    
    result = []
    for s in stories:
      avg_rating = self.repo.get_average_rating(s.id)
      result.append(StoryCatalogOut(
        id=s.id,
        title=s.title,
        cover_path=s.cover_path,
        age_rating=s.age_rating,
        likes=s.likes,
        views=s.views,
        average_rating=avg_rating
      ))
    return result

  def get_story_preview(self, story_id: int) -> StoryPreviewOut:
    story = self.repo.get_by_id(story_id)
    if not story:
      raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Story not found")

    avg_rating = self.repo.get_average_rating(story.id)
    
    status_slug = story.status.slug if story.status else "draft"

    return StoryPreviewOut(
      id=story.id, 
      title=story.title, 
      summary=story.summary, 
      cover_path=story.cover_path,
      age_rating=story.age_rating, 
      likes=story.likes, 
      views=story.views, 
      created_at=story.created_at,
      status_slug=status_slug,
      author_username=story.author.username if story.author else "Unknown",
      categories=story.categories, 
      genres=story.genres,
      average_rating=avg_rating
    )

  def get_story_content(self, story_id: int, user_id: Optional[int] = None) -> dict:
    story = self.repo.get_by_id(story_id)
    if not story:
      raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Story not found")
    
    story.views += 1
    self.repo.update()

    # Automatyczne dodanie do historii "w trakcie" jeśli user_id jest podane
    if user_id:
      self.save_progress(user_id, story_id, [])
    
    try:
      with open(story.story_json_path, "r", encoding="utf-8") as f:
        game_data = json.load(f)
      return {"story_id": story.id, "title": story.title, "nodes": game_data}
    except Exception:
      raise HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
        detail="Story scenario file is missing on server"
      )

  def create_story(self, author_id: int, story_data: StoryCreate) -> Story:
    # Ścieżka do plików JSON (uproszczone)
    os.makedirs("uploads/stories", exist_ok=True)
    filename = f"story_{datetime.utcnow().timestamp()}.json"
    file_path = os.path.join("uploads/stories", filename)
    
    # Tworzenie pustego szablonu JSON
    default_content = {"nodes": [], "edges": []}
    with open(file_path, "w", encoding="utf-8") as f:
      json.dump(default_content, f)

    db_story = Story(
      author_id=author_id,
      title=story_data.title,
      summary=story_data.summary,
      cover_path=story_data.cover_path or "/uploads/covers/default_cover.png",
      age_rating=story_data.age_rating,
      status_id=story_data.status_id,
      story_json_path=file_path
    )

    # Kategorie i Gatunki
    if story_data.category_ids:
      categories = self.session.exec(select(Category).where(Category.id.in_(story_data.category_ids))).all()
      db_story.categories = list(categories)
    
    if story_data.genre_ids:
      genres = self.session.exec(select(Genre).where(Genre.id.in_(story_data.genre_ids))).all()
      db_story.genres = list(genres)

    return self.repo.create(db_story)

  def update_story(self, story_id: int, author_id: int, story_data: StoryUpdate) -> Story:
    story = self.repo.get_by_id(story_id)
    if not story:
      raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Story not found")
    
    if story.author_id != author_id:
      raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to edit this story")

    data = story_data.model_dump(exclude_unset=True)
    
    if "category_ids" in data:
      category_ids = data.pop("category_ids")
      categories = self.session.exec(select(Category).where(Category.id.in_(category_ids))).all()
      story.categories = list(categories)
    
    if "genre_ids" in data:
      genre_ids = data.pop("genre_ids")
      genres = self.session.exec(select(Genre).where(Genre.id.in_(genre_ids))).all()
      story.genres = list(genres)

    for key, value in data.items():
      setattr(story, key, value)
    
    self.repo.update()
    return story

  def delete_story(self, story_id: int, author_id: int) -> None:
    story = self.repo.get_by_id(story_id)
    if not story:
      raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Story not found")
    
    if story.author_id != author_id:
      raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to delete this story")
    
    self.repo.delete(story)

  # Reading Progress
  def save_progress(self, user_id: int, story_id: int, nodes: List[str]) -> ReadHistory:
    history = self.repo.get_read_history(user_id, story_id)
    if not history:
        history = ReadHistory(
            user_id=user_id,
            story_id=story_id,
            status_id=1, # Założenie: 1 to 'w trakcie'
            history=nodes
        )
        return self.repo.create_read_history(history)
    
    if nodes: # Tylko jeśli przesłano nową historię (nie przy start_reading [])
        history.history = nodes
    self.repo.update()
    return history

  # Opinions
  def add_opinion(self, user_id: int, story_id: int, rating: float, review: str) -> Opinion:
    existing = self.repo.get_opinion(user_id, story_id)
    if existing:
        existing.rating = rating
        existing.review = review
        self.repo.update()
        return existing
    
    opinion = Opinion(
        user_id=user_id,
        story_id=story_id,
        rating=rating,
        review=review
    )
    return self.repo.create_opinion(opinion)

  def get_story_opinions(self, story_id: int) -> Sequence[Opinion]:
    return self.repo.get_story_opinions(story_id)