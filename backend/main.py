from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from core.config import settings
from src.controllers import user, story

app = FastAPI(
  title=settings.PROJECT_NAME,
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

# Prosty endpoint testowy (Health Check)
@app.get("/", tags=["Health"])
def root():
  return {
    "message": f"Welcome to {settings.PROJECT_NAME}",
    "status": "online",
    "version": settings.VERSION
  }

app.include_router(user.router, prefix="/users", tags=["Users"])
app.include_router(story.router, prefix="/stories", tags=["Stories"])

if __name__ == "__main__":
  import uvicorn
  uvicorn.run("main:app", host="0.0.0.0", port=8080, reload=True)
