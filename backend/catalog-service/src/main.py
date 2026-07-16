from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from sqlmodel import SQLModel

from core.config import settings
from core.db import engine

from src.routers.story import router as story_router
from src.routers.genre import router as genre_router
from src.routers.category import router as category_router

from src.seed import create_initial_genre

@asynccontextmanager
async def lifespan(app: FastAPI):
  async with engine.begin() as conn:
    await conn.run_sync(SQLModel.metadata.create_all)

  await create_initial_genre()
  yield

app = FastAPI(
  title=settings.PROJECT_NAME,
  lifespan=lifespan,
  version=settings.VERSION,
  description="Backend dla interaktywnych historii Lorely"
  )

@app.get("/health")
async def health_check():
  return {"status": "ok"}

app.include_router(story_router)
app.include_router(genre_router)
app.include_router(category_router)