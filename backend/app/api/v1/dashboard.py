from __future__ import annotations
from typing import Annotated, List, Optional
from fastapi import APIRouter, Depends
from pydantic import BaseModel

from app.models.user import User
from app.api.deps import get_current_active_user

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


class DashboardStatsResponse(BaseModel):
    active_projects: int = 3
    completed_projects: int = 12
    running_agents: int = 7
    tokens_used: int = 24500
    total_cost: float = 4.85
    success_rate: float = 94.0


class ActivityItemResponse(BaseModel):
    id: str
    type: str
    title: str
    description: str
    timestamp: str
    project_id: Optional[str] = None


@router.get("/stats", response_model=DashboardStatsResponse)
async def get_dashboard_stats(
    current_user: Annotated[User, Depends(get_current_active_user)],
):
    return DashboardStatsResponse()


@router.get("/activity", response_model=List[ActivityItemResponse])
async def get_dashboard_activity(
    current_user: Annotated[User, Depends(get_current_active_user)],
):
    return [
        ActivityItemResponse(
            id="1",
            type="code_generated",
            title="Backend API Complete",
            description="Expense Tracker — 12 endpoints generated",
            timestamp="2m ago",
            project_id="proj-1",
        ),
        ActivityItemResponse(
            id="2",
            type="architecture",
            title="Architecture Designed",
            description="E-Commerce Platform — System diagram ready",
            timestamp="15m ago",
            project_id="proj-2",
        ),
        ActivityItemResponse(
            id="3",
            type="test_completed",
            title="Tests Passed",
            description="Task Management — 48/48 tests passing",
            timestamp="1h ago",
            project_id="proj-3",
        ),
        ActivityItemResponse(
            id="4",
            type="code_review",
            title="Code Review Complete",
            description="Expense Tracker — 3 suggestions applied",
            timestamp="2h ago",
            project_id="proj-1",
        ),
        ActivityItemResponse(
            id="5",
            type="deployment",
            title="Deployed to Production",
            description="Task Management — Live on Railway",
            timestamp="5h ago",
            project_id="proj-3",
        ),
    ]
