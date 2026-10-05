import json
from typing import Optional, Any
from redis.asyncio import Redis
from shared.config.settings import settings

redis_instance: Optional[Redis] = None


async def get_redis_client() -> Redis:
    global redis_instance
    if redis_instance is None:
        try:
            redis_instance = Redis.from_url(
                settings.REDIS_URL,
                decode_responses=True,
                socket_connect_timeout=3.0,
            )
        except Exception:
            redis_instance = None
    return redis_instance


async def cache_set(key: str, value: Any, ttl: int = 3600):
    try:
        client = await get_redis_client()
        if client:
            val_str = json.dumps(value) if not isinstance(value, str) else value
            await client.set(key, val_str, ex=ttl)
    except Exception:
        pass


async def cache_get(key: str) -> Optional[Any]:
    try:
        client = await get_redis_client()
        if client:
            val = await client.get(key)
            if val:
                try:
                    return json.loads(val)
                except Exception:
                    return val
    except Exception:
        pass
    return None
