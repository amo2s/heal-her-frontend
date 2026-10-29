# app/db/session.py
import logging
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from app.config import get_settings
from app.db.models import Base

logger = logging.getLogger("tos_service.db")

settings = get_settings()

# Configure resilient asynchronous engine with connection health checks
engine = None
async_session_factory = None

if settings.database_url:
    engine = create_async_engine(
        settings.database_url,
        echo=False,
        pool_pre_ping=True,
        pool_size=20,
        max_overflow=10,
        pool_timeout=15.0,
    )
    async_session_factory = async_sessionmaker(
        bind=engine,
        class_=AsyncSession,
        expire_on_commit=False,
        autocommit=False,
        autoflush=False,
    )


async def init_db() -> None:
    """
    Verifies database connectivity and idempotently ensures required tables exist.
    """
    if engine is None:
        logger.warning("DATABASE_URL is not configured; running in stateless mock mode.")
        return

    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info("Database schemas verified and initialized successfully.")
    except Exception as e:
        logger.error(f"Failed to initialize database tables: {e}")
        raise


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    FastAPI dependency yielding an isolated async database session with automatic cleanup.
    """
    if async_session_factory is None:
        raise RuntimeError("Database session factory is not initialized. Verify DATABASE_URL.")

    async with async_session_factory() as session:
        try:
            yield session
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()

