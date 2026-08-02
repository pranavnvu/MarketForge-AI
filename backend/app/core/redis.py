from __future__ import annotations
from typing import AsyncGenerator, Optional
import redis.asyncio as redis
import structlog
from app.core.config import settings

logger = structlog.get_logger(__name__)

redis_client: Optional[redis.Redis] = None


async def init_redis():
    global redis_client
    try:
        redis_client = redis.from_url(settings.REDIS_URL, decode_responses=True)
    except Exception as e:
        logger.warning("redis_init_failed", error=str(e))
        redis_client = None


async def close_redis():
    global redis_client
    if redis_client:
        try:
            await redis_client.close()
        except Exception:
            pass


async def get_redis() -> AsyncGenerator[Optional[redis.Redis], None]:
    yield redis_client
