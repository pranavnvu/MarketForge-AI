from fastapi import APIRouter, Depends
from typing import Annotated
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from redis.asyncio import Redis
from app.core.database import get_db_session
from app.core.redis import get_redis
from app.schemas.common import HealthResponse
import structlog

logger = structlog.get_logger(__name__)

router = APIRouter()

@router.get("/", response_model=HealthResponse)
async def health_check(
    db: Annotated[AsyncSession, Depends(get_db_session)],
    redis: Annotated[Redis, Depends(get_redis)]
):
    db_status = "ok"
    redis_status = "ok"
    
    try:
        await db.execute(text("SELECT 1"))
    except Exception as e:
        logger.error(f"Database health check failed: {e}")
        db_status = "error"
        
    try:
        await redis.ping()
    except Exception as e:
        logger.error(f"Redis health check failed: {e}")
        redis_status = "error"

    status = "ok" if db_status == "ok" and redis_status == "ok" else "error"

    return HealthResponse(
        status=status,
        database=db_status,
        redis=redis_status
    )
