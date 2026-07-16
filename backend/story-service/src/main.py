from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from sqlmodel import SQLModel

from core.config import settings
from core.db import engine

from src.routers.story import router as story_router

@asynccontextmanager
async def lifespan(app: FastAPI):
  async with engine.begin() as conn:
    await conn.run_sync(SQLModel.metadata.create_all)
  yield

app = FastAPI(
  title=settings.PROJECT_NAME,
  lifespan=lifespan,
  version=settings.VERSION,
  description="Backend dla interaktywnych historii Lorely"
  )

app.add_middleware(
  CORSMiddleware,
  allow_origins=settings.CORS_ORIGINS,
  allow_methods=["*"],
  allow_headers=["*"],
)

@app.get("/health")
async def health_check():
  return {"status": "ok"}

app.include_router(story_router)