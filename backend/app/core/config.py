from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="allow")

    APP_NAME: str = "ContentPilot AI"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    PORT: int = 8000
    HOST: str = "0.0.0.0"

    # Security & Auth
    SECRET_KEY: str = "contentpilot-secret-jwt-key-2026-build-with-ibm"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours

    # Database
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/contentpilot_ai"
    USE_SQLITE_FALLBACK: bool = True
    SQLITE_DATABASE_URL: str = "sqlite:///./contentpilot.db"

    # CORS
    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173"

    # AI Configuration
    LLM_PROVIDER: str = "mock"
    LLM_API_KEY: str = ""
    LLM_MODEL: str = "gpt-4o-mini"
    LLM_TIMEOUT_SECONDS: int = 30

    @property
    def cors_origin_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    @property
    def active_database_url(self) -> str:
        if self.USE_SQLITE_FALLBACK:
            return self.SQLITE_DATABASE_URL
        return self.DATABASE_URL

settings = Settings()
