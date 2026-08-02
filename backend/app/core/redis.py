import redis.asyncio as redis
from typing import AsyncGenerator
from app.core.config import settings

redis_client: redis.Redis | None = None

async def init_redis():
    global redis_client
    redis_client = redis.from_url(settings.REDIS_URL, decode_responses=True)

async def close_redis():
    global redis_client
    if redis_client:
        await redis_client.close()

async def get_redis() -> AsyncGenerator[redis.Redis, None]:
    if redis_client is None:
        raise Exception("Redis not initialized")
    yield redis_client
