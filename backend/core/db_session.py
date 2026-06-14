from typing import Generator
from sqlmodel import create_engine, Session
from core.config import settings

engine = create_engine(
  settings.DATABASE_URL,
  echo=True,
  pool_pre_ping=True
)

def get_db() -> Generator[Session, None, None]:
  with Session(engine) as session:
    try:
      yield session
    finally:
      session.close()