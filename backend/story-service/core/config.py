from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
  PROJECT_NAME: str = "Lorely Story Service API"
  VERSION: str = "1.0.0"
  DEBUG: bool = False

  # DB Settings
  POSTGRES_USER: str
  POSTGRES_PASSWORD: str
  POSTGRES_DB: str
  POSTGRES_HOST: str
  POSTGRES_PORT: int

  @property
  def DATABASE_URL(self) -> str:
    return f"postgresql+asyncpg://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"

  # JWT Settings
  JWT_SECRET: str
  JWT_ALGORITHM: str

  model_config = SettingsConfigDict(
    env_file=".env",
    env_file_encoding="utf-8",
    extra="ignore" # zignoruje dodatkowe zmienne w .env, które są dla innych serwisów
  )

  CORS_ORIGINS: str = "http://localhost"

settings = Settings()