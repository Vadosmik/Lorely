from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from sqlmodel import SQLModel

from core.config import settings
from core.db import engine

from src.routers.users import router as user_router
from src.routers.roles import router as roles_router
from src.routers.admin import router as admin_router
from src.routers.auth import router as auth_router

from src.seed import create_initial_admin

@asynccontextmanager
async def lifespan(app: FastAPI):
  # Tworzenie tabel
  async with engine.begin() as conn:
    await conn.run_sync(SQLModel.metadata.create_all)
  
  # Uruchomienie seeder'a
  await create_initial_admin()
  yield

app = FastAPI(
  title="Lorely User Service",
  lifespan=lifespan,
  version=settings.VERSION,
  description="Backend dla interaktywnych historii Lorely"
  )

app.add_middleware(
  CORSMiddleware,
  allow_origins=settings.CORS_ORIGINS,
  allow_credentials=True,
  allow_methods=["*"],
  allow_headers=["*"],
)

@app.get("/health")
async def health_check():
  return {"status": "ok"}

app.include_router(roles_router)
app.include_router(admin_router)
app.include_router(auth_router)
app.include_router(user_router)
