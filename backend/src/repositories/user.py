from typing import Optional, Sequence
from sqlmodel import Session, select
from datetime import datetime
from src.models.user import User
from src.models.reading import ReadHistory

class UserRepository:
  def __init__(self, session: Session):
    self.session = session

  def get_all(self) -> Sequence[User]:
    statement = select(User).where(User.deleted_at == None)
    return self.session.exec(statement).all()

  def get_by_id(self, user_id: int) -> Optional[User]:
    statement = select(User).where(User.id == user_id, User.deleted_at == None)
    return self.session.exec(statement).first()

  def get_by_email(self, email: str) -> Optional[User]:
    statement = select(User).where(User.email == email, User.deleted_at == None)
    return self.session.exec(statement).first()
  
  def get_any_by_email(self, email: str) -> Optional[User]:
    statement = select(User).where(User.email == email)
    return self.session.exec(statement).first()

  def create(self, user: User) -> User:
    self.session.add(user)
    self.session.commit()
    self.session.refresh(user)
    return user

  # SQLModel automatycznie śledzi zmiany w obiekcie, wystarczy wywołać commit na sesji
  def update(self) -> None:
    self.session.commit()

  def delete(self, user: User) -> None:
    user.deleted_at = datetime.utcnow()
    user.is_active = False
    self.session.commit()

  def get_user_read_histories(self, user_id: int, status_id: Optional[int] = None) -> Sequence[ReadHistory]:
    statement = select(ReadHistory).where(ReadHistory.user_id == user_id)
    if status_id:
      statement = statement.where(ReadHistory.status_id == status_id)
    return self.session.exec(statement).all()