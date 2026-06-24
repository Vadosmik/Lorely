from typing import List

from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
  PROJECT_NAME: str = "Lorely File Service API"
  VERSION: str = "0.0.1"
  DEBUG: bool = False

  #  MinIO Settings
  MINIO_ENDPOINT: str
  ACCESS_KEY: str
  SECRET_KEY: str

  # JWT Settings
  JWT_SECRET: str
  JWT_ALGORITHM: str

  model_config = SettingsConfigDict(
    env_file=".env",
    env_file_encoding="utf-8",
    extra="ignore"
  )

  CORS_ORIGINS: List[str] = ["http://localhost"]

settings = Settings()