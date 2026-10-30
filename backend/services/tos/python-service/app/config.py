# app/config.py
import os
from functools import lru_cache
from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

# Strictly load dedicated Python microservice environment
ENV_PATH = Path(__file__).resolve().parent.parent / ".env"


class Settings(BaseSettings):
    """
    Application environment configuration for the TOS Legal Consent Microservice.
    Loads isolated settings from backend/services/tos/python-service/.env.
    """
    model_config = SettingsConfigDict(
        env_file=ENV_PATH if ENV_PATH.exists() else None,
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # Server Configuration
    host: str = "0.0.0.0"
    port: int = 8080
    frontend_url: str = "http://localhost:3000"

    # Zero-Trust Cryptography & Auth
    jwt_secret_key: str = ""

    # PostgreSQL Database Engine
    database_url_raw: str = Field(default="", validation_alias="DATABASE_URL")

    # Dynamic Document Versioning Engine
    active_tos_version: str = Field(default="1.0", validation_alias="ACTIVE_TOS_VERSION")

    # Supabase Document Vault
    supabase_url: str = "https://rtkyzqqlhgsjoennhurc.supabase.co"
    supabase_service_role_key: str = ""
    supabase_tos_bucket: str = "tos-vault"

    # Transactional Mailer
    google_mailer_webhook_url: str = ""

    # PDF Security
    pdf_owner_password: str = "heal-her-strict-internal-secret"

    @property
    def database_url(self) -> str:
        """
        Normalizes the database URL to use asyncpg driver for SQLAlchemy asyncio.
        Handles postgres://, postgresql://, and postgresql+asyncpg:// schemas.
        """
        raw = self.database_url_raw or os.getenv("DATABASE_URL", "")
        url = raw.strip()
        if not url:
            return ""
        if url.startswith("postgres://"):
            return url.replace("postgres://", "postgresql+asyncpg://", 1)
        if url.startswith("postgresql://") and not url.startswith("postgresql+asyncpg://"):
            return url.replace("postgresql://", "postgresql+asyncpg://", 1)
        return url


@lru_cache()
def get_settings() -> Settings:
    return Settings()
