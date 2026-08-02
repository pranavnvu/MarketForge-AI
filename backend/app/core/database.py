from __future__ import annotations
import contextlib
from typing import AsyncIterator, Any
from sqlalchemy.ext.asyncio import (
    AsyncConnection,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import declarative_base, Mapped, mapped_column
from sqlalchemy import DateTime, func, String
import uuid
import structlog
from app.core.config import settings

logger = structlog.get_logger(__name__)

# Fallback to local SQLite file for local dev when PostgreSQL is not running
db_url = settings.DATABASE_URL
engine_kwargs: dict[str, Any] = {"pool_pre_ping": True}

if "sqlite" in db_url:
    engine_kwargs = {"connect_args": {"check_same_thread": False}}
else:
    engine_kwargs.update({"pool_size": 10, "max_overflow": 20})


class DatabaseSessionManager:
    def __init__(self, host: str, kwargs: dict[str, Any]):
        self.engine = create_async_engine(host, **kwargs)
        self.session_maker = async_sessionmaker(
            autocommit=False, autoflush=False, bind=self.engine
        )

    async def close(self):
        if self.engine is not None:
            await self.engine.dispose()
            self.engine = None
            self.session_maker = None

    @contextlib.asynccontextmanager
    async def connect(self) -> AsyncIterator[AsyncConnection]:
        if self.engine is None:
            raise Exception("DatabaseSessionManager is not initialized")
        async with self.engine.begin() as connection:
            try:
                yield connection
            except Exception:
                await connection.rollback()
                raise

    @contextlib.asynccontextmanager
    async def session(self) -> AsyncIterator[AsyncSession]:
        if self.session_maker is None:
            raise Exception("DatabaseSessionManager is not initialized")
        session = self.session_maker()
        try:
            yield session
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


sessionmanager = DatabaseSessionManager(db_url, engine_kwargs)


async def get_db_session():
    try:
        async with sessionmanager.session() as session:
            yield session
    except Exception as e:
        logger.warning("db_session_failed", error=str(e))
        yield None


Base = declarative_base()


class UUIDPrimaryKeyMixin:
    id: Mapped[uuid.UUID] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )


class TimestampMixin:
    created_at: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True), onupdate=func.now(), server_default=func.now()
    )
