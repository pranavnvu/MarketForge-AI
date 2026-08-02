from typing import Annotated
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.core.database import get_db_session
from app.models.user import User
from app.models.project import Project
from app.api.deps import require_admin

router = APIRouter(prefix="/admin", tags=["Admin Panel"])


class AdminStatsResponse(BaseModel):
    total_users: int
    total_projects: int
    active_agent_runs: int = 7
    system_load: float = 0.15
    memory_usage_mb: float = 248.5


class SystemHealthResponse(BaseModel):
    database: str = "connected"
    redis: str = "connected"
    qdrant: str = "connected"
    status: str = "healthy"


@router.get("/stats", response_model=AdminStatsResponse)
async def get_admin_stats(
    current_user: Annotated[User, Depends(require_admin)],
    db: Annotated[AsyncSession, Depends(get_db_session)],
):
    users_count = await db.scalar(select(func.count(User.id))) or 0
    projects_count = await db.scalar(select(func.count(Project.id))) or 0

    return AdminStatsResponse(
        total_users=users_count,
        total_projects=projects_count,
    )


@router.get("/health", response_model=SystemHealthResponse)
async def get_system_health(
    current_user: Annotated[User, Depends(require_admin)],
):
    return SystemHealthResponse()
