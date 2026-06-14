from datetime import datetime, date, timezone
from typing import Optional, Sequence
from fastapi import HTTPException, status
from sqlmodel import Session
from core.security import hash_password, verify_password
from src.repositories.user import UserRepository
from src.models.user import User, UserCreate, UserUpdate
from src.models.reading import ReadHistory

class UserService:
  def __init__(self, session: Session):
    self.repo = UserRepository(session)

  def get_user_by_id(self, user_id: int) -> User:
    user = self.repo.get_by_id(user_id)
    if not user:
      raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND, 
        detail=f"User with id {user_id} not found"
      )
    return user

  def get_all_users(self) -> Sequence[User]:
    return self.repo.get_all()

  def create_user(self, user_data: UserCreate) -> User:
    existing_user = self.repo.get_any_by_email(user_data.email)
    if existing_user:
      if existing_user.deleted_at is not None:
        raise HTTPException(
          status_code=status.HTTP_400_BAD_REQUEST,
          detail="This email belongs to a deleted account. Contact support to reactivate."
        )
      raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="Email already registered"
      )
    
    # Konwersja UserCreate na User model bazodanowy
    db_user = User(
      **user_data.model_dump(exclude={"password"}),
      pass_hash=hash_password(user_data.password)
    )
    return self.repo.create(db_user)

  def update_user_profile(self, user_id: int, update_data: UserUpdate) -> User:
    user = self.get_user_by_id(user_id)
    
    data = update_data.model_dump(exclude_unset=True)
    for key, value in data.items():
        setattr(user, key, value)
      
    user.updated_at = datetime.now(timezone.utc)
    self.repo.update()
    return user

  def update_user_email(self, user_id: int, new_email: str) -> User:
    user = self.get_user_by_id(user_id)
    
    if user.email != new_email:
      existing_user = self.repo.get_by_email(new_email)
      if existing_user:
        raise HTTPException(
          status_code=status.HTTP_400_BAD_REQUEST,
          detail="Email already in use"
        )
      user.email = new_email
      user.updated_at = datetime.now(timezone.utc)
      self.repo.update()
    return user

  def update_user_password(self, user_id: int, current_pass: str, new_pass: str) -> User:
    user = self.get_user_by_id(user_id)

    if not verify_password(current_pass, user.pass_hash):
      raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="Incorrect current password"
      )
    
    user.pass_hash = hash_password(new_pass)
    user.updated_at = datetime.now(timezone.utc)
    self.repo.update()
    return user

  def authenticate(self, email: str, password: str) -> Optional[User]:
    user = self.repo.get_by_email(email)
    if not user:
      return None
    if not verify_password(password, user.pass_hash):
      return None
    return user

  def delete_user(self, user_id: int) -> None:
    user = self.get_user_by_id(user_id)
    self.repo.delete(user)

  def get_user_reading_list(self, user_id: int, status_id: Optional[int] = None) -> Sequence[ReadHistory]:
    return self.repo.get_user_read_histories(user_id, status_id)
