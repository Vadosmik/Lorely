from typing import List, Optional
from datetime import date
from fastapi import APIRouter, Depends, status, Body, HTTPException, Query
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import Session
from core.db_session import get_db
from core.security import create_access_token, get_current_user
from src.services.user import UserService
from src.models.user import User, UserRead, UserCreate, UserUpdate, Token
from src.models.reading import ReadHistory

router = APIRouter()

@router.post("/login", response_model=Token)
def login(
    db: Session = Depends(get_db), 
    form_data: OAuth2PasswordRequestForm = Depends()
):
    user_service = UserService(db)
    user = user_service.authenticate(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(subject=user.id)
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserRead)
def read_user_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.get("/me/reading-list", response_model=List[ReadHistory])
def get_my_reading_list(
    status_id: Optional[int] = Query(None, description="Filtracja po statusie czytania"),
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    user_service = UserService(db)
    return user_service.get_user_reading_list(current_user.id, status_id)

@router.get("/", response_model=List[UserRead])
def get_all_users(db: Session = Depends(get_db)):
  user_service = UserService(db)
  return user_service.get_all_users()

@router.get("/{user_id}", response_model=UserRead)
def get_user(user_id: int, db: Session = Depends(get_db)):
  user_service = UserService(db)
  return user_service.get_user_by_id(user_id)

@router.post("/", response_model=UserRead, status_code=status.HTTP_201_CREATED)
def create_user(user_data: UserCreate, db: Session = Depends(get_db)):
  user_service = UserService(db)
  return user_service.create_user(user_data)

@router.put("/{user_id}/profile", response_model=UserRead)
def update_profile(
  user_id: int,
  update_data: UserUpdate,
  db: Session = Depends(get_db)
):
  user_service = UserService(db)
  return user_service.update_user_profile(user_id, update_data)

@router.put("/{user_id}/email", response_model=UserRead)
def update_email(
  user_id: int,
  new_email: str = Body(..., embed=True),
  db: Session = Depends(get_db)
):
  user_service = UserService(db)
  return user_service.update_user_email(user_id, new_email)

@router.put("/{user_id}/password")
def update_password(
  user_id: int,
  current_password: str = Body(...),
  new_password: str = Body(...),
  db: Session = Depends(get_db)
):
  user_service = UserService(db)
  user_service.update_user_password(user_id, current_password, new_password)
  return {"detail": "Password updated successfully"}

@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(user_id: int, db: Session = Depends(get_db)):
  user_service = UserService(db)
  user_service.delete_user(user_id)
  return None
