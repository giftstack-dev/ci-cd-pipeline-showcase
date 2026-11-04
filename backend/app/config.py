"""Application configuration settings loaded from environment variables."""

import os
from functools import lru_cache
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Configuration settings for the FastAPI service."""

    app_name: str = "CI/CD Pipeline Showcase Backend"
    version: str = "0.0.0-dev"
    commit_sha: str = "local"
    build_time: str = "unknown"
    app_env: str = "development"
    allowed_origins: str = "http://localhost:5173"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    @property
    def cors_origins(self) -> List[str]:
        """Parse comma-separated allowed origins into a clean list."""
        if not self.allowed_origins:
            return ["http://localhost:5173"]
        return [origin.strip() for origin in self.allowed_origins.split(",") if origin.strip()]


@lru_cache()
def get_settings() -> Settings:
    """Return cached Settings instance populated from environment."""
    return Settings(
        version=os.getenv("VERSION", "0.0.0-dev"),
        commit_sha=os.getenv("COMMIT_SHA", "local"),
        build_time=os.getenv("BUILD_TIME", "unknown"),
        app_env=os.getenv("APP_ENV", "development"),
        allowed_origins=os.getenv("ALLOWED_ORIGINS", "http://localhost:5173"),
    )
