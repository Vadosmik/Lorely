from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status, Body
from sqlmodel import Session
from core.db_session import get_db
from core.security import get_current_user
from src.services.story import StoryService
from src.repositories.story import StorySortOption
from src.models.story import Story, StoryCatalogOut, StoryPreviewOut, StoryCreate, StoryUpdate
from src.models.user import User
from src.models.reading import ReadHistory, Opinion

router = APIRouter()

@router.get("/", response_model=List[StoryCatalogOut])
def get_catalog(
  genre_ids: Optional[List[int]] = Query(None, description="Lista ID gatunków"),
  category_ids: Optional[List[int]] = Query(None, description="Lista ID kategorii"),
  sort_by: StorySortOption = Query(StorySortOption.DATE_DESC, description="Opcja sortowania"),
  db: Session = Depends(get_db)
):
  story_service = StoryService(db)
  return story_service.get_catalog_stories(
    genre_ids=genre_ids, 
    category_ids=category_ids, 
    sort_by=sort_by
  )

@router.post("/", response_model=Story, status_code=status.HTTP_201_CREATED)
def create_story(
  story_data: StoryCreate,
  current_user: User = Depends(get_current_user),
  db: Session = Depends(get_db)
):
  story_service = StoryService(db)
  return story_service.create_story(current_user.id, story_data)

@router.get("/{story_id}", response_model=StoryPreviewOut)
def get_story_preview(story_id: int, db: Session = Depends(get_db)):
  story_service = StoryService(db)
  return story_service.get_story_preview(story_id)

@router.put("/{story_id}", response_model=Story)
def update_story(
  story_id: int,
  story_data: StoryUpdate,
  current_user: User = Depends(get_current_user),
  db: Session = Depends(get_db)
):
  story_service = StoryService(db)
  return story_service.update_story(story_id, current_user.id, story_data)

@router.delete("/{story_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_story(
  story_id: int,
  current_user: User = Depends(get_current_user),
  db: Session = Depends(get_db)
):
  story_service = StoryService(db)
  story_service.delete_story(story_id, current_user.id)
  return None

@router.get("/{story_id}/read")
def start_reading_story(
  story_id: int, 
  db: Session = Depends(get_db),
  current_user: Optional[User] = Depends(get_current_user)
):
  story_service = StoryService(db)
  user_id = current_user.id if current_user else None
  return story_service.get_story_content(story_id, user_id)

# Progress & Opinions
@router.post("/{story_id}/progress", response_model=ReadHistory)
def save_reading_progress(
    story_id: int,
    nodes: List[str] = Body(..., embed=True),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    story_service = StoryService(db)
    return story_service.save_progress(current_user.id, story_id, nodes)

@router.post("/{story_id}/opinion", response_model=Opinion)
def add_story_opinion(
    story_id: int,
    rating: float = Body(...),
    review: str = Body(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    story_service = StoryService(db)
    return story_service.add_opinion(current_user.id, story_id, rating, review)

@router.get("/{story_id}/opinions", response_model=List[Opinion])
def get_story_opinions(story_id: int, db: Session = Depends(get_db)):
    story_service = StoryService(db)
    return story_service.get_story_opinions(story_id)
