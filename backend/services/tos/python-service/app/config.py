# app/config.py
import os
from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Application environment configuration for the TOS Legal Consent Microservice.
    """
    model_config = SettingsConfigDict(
        env_file=None, # Explicitly disabled to preserve zero-disk secret hygiene
        extra="ignore"
    )

    # Server Configuration
    host: str = "0.0.0.0"
    port: int = 8080
    frontend_url: str = "http://localhost:3000"

    # Zero-Trust Cryptography & Auth
    jwt_secret_key: str = os.getenv("JWT_SECRET_KEY", "")

    # PostgreSQL Database Engine
    database_url_raw: str = os.getenv("DATABASE_URL", "")

    # Supabase Document Vault
    supabase_url: str = os.getenv("SUPABASE_URL", "https://qwsgxhtznqnpynsesyyi.supabase.co")
    supabase_service_role_key: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
    supabase_tos_bucket: str = os.getenv("SUPABASE_TOS_BUCKET", "tos-vault")

    # Transactional Mailer
    google_mailer_webhook_url: str = os.getenv("GOOGLE_MAILER_WEBHOOK_URL", "")

    # PDF Security
    pdf_owner_password: str = os.getenv("PDF_OWNER_PASSWORD", "heal-her-strict-internal-secret")

    @property
    def database_url(self) -> str:
        """
        Normalizes the database URL to use asyncpg driver for SQLAlchemy asyncio.
        Handles postgres://, postgresql://, and postgresql+asyncpg:// schemas.
        """
        url = self.database_url_raw.strip()
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
