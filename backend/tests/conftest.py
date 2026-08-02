import pytest
import pytest_asyncio
from httpx import AsyncClient
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from fastapi import FastAPI

from app.main import app
from app.core.database import get_db_session, Base
from app.core.redis import get_redis

# Test Database URL (Use a separate test db or SQLite in-memory)
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

engine = create_async_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = async_sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest_asyncio.fixture(scope="session")
async def setup_database():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

@pytest_asyncio.fixture()
async def db_session(setup_database) -> AsyncGenerator[AsyncSession, None]:
    async with TestingSessionLocal() as session:
        yield session

@pytest.fixture()
def test_app(db_session: AsyncSession):
    app.dependency_overrides[get_db_session] = lambda: db_session
    # Mock redis for tests or provide test redis url
    class MockRedis:
        async def ping(self): return True
        async def close(self): pass
    app.dependency_overrides[get_redis] = lambda: MockRedis()
    yield app
    app.dependency_overrides.clear()

@pytest_asyncio.fixture()
async def async_client(test_app: FastAPI) -> AsyncGenerator[AsyncClient, None]:
    async with AsyncClient(app=test_app, base_url="http://test") as ac:
        yield ac
