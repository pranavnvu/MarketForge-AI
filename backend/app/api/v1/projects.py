import uuid
from typing import Annotated, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db_session
from app.models.user import User
from app.schemas.project import (
    ProjectCreate,
    ProjectUpdate,
    ProjectResponse,
    AgentNodeRunRequest,
    AgentSwarmChatRequest,
    FileConsistencyCheckResponse,
)
from app.schemas.common import MessageResponse
from app.services.project_service import ProjectService
from app.api.deps import get_current_active_user
from app.core.exceptions import NotFoundError

router = APIRouter(prefix="/projects", tags=["Projects"])


@router.get("", response_model=List[ProjectResponse])
async def list_projects(
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: Annotated[AsyncSession, Depends(get_db_session)],
):
    service = ProjectService(db)
    return await service.get_user_projects(current_user.id)


@router.post("", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
async def create_project(
    req: ProjectCreate,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: Annotated[AsyncSession, Depends(get_db_session)],
):
    service = ProjectService(db)
    return await service.create_project(current_user, req)


@router.get("/{project_id}", response_model=ProjectResponse)
async def get_project(
    project_id: uuid.UUID,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: Annotated[AsyncSession, Depends(get_db_session)],
):
    service = ProjectService(db)
    project = await service.get_by_id(project_id)
    if not project:
        raise NotFoundError("Project not found")
    return project


@router.put("/{project_id}", response_model=ProjectResponse)
async def update_project(
    project_id: uuid.UUID,
    req: ProjectUpdate,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: Annotated[AsyncSession, Depends(get_db_session)],
):
    service = ProjectService(db)
    project = await service.get_by_id(project_id)
    if not project:
        raise NotFoundError("Project not found")
    return await service.update_project(project, req)


@router.delete("/{project_id}", response_model=MessageResponse)
async def delete_project(
    project_id: uuid.UUID,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: Annotated[AsyncSession, Depends(get_db_session)],
):
    service = ProjectService(db)
    project = await service.get_by_id(project_id)
    if not project:
        raise NotFoundError("Project not found")
    await service.delete_project(project)
    return MessageResponse(message="Project deleted successfully")


@router.post("/{project_id}/run", response_model=ProjectResponse)
async def run_project_pipeline(
    project_id: uuid.UUID,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: Annotated[AsyncSession, Depends(get_db_session)],
):
    """Run the full 10-agent multi-agent orchestration pipeline for this project."""
    service = ProjectService(db)
    project = await service.get_by_id(project_id)
    if not project:
        raise NotFoundError("Project not found")
    await service.run_orchestration(project)
    # Re-fetch the updated project after pipeline completion
    updated = await service.get_by_id(project_id)
    return updated


@router.post("/{project_id}/agents/run", response_model=ProjectResponse)
async def run_agent_node(
    project_id: uuid.UUID,
    req: AgentNodeRunRequest,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: Annotated[AsyncSession, Depends(get_db_session)],
):
    """Run or re-run a specific agent node independently in this project workspace."""
    service = ProjectService(db)
    project = await service.get_by_id(project_id)
    if not project:
        raise NotFoundError("Project not found")
    await service.run_single_agent_node(project, req.agent_key)
    updated = await service.get_by_id(project_id)
    return updated


@router.post("/{project_id}/chat")
async def send_swarm_chat(
    project_id: uuid.UUID,
    req: AgentSwarmChatRequest,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: Annotated[AsyncSession, Depends(get_db_session)],
):
    """Send user instructions to specific agents or the multi-agent swarm."""
    service = ProjectService(db)
    project = await service.get_by_id(project_id)
    if not project:
        raise NotFoundError("Project not found")
    return await service.process_swarm_chat(project, req.agent_key or "all", req.message)


@router.get("/{project_id}/consistency", response_model=FileConsistencyCheckResponse)
async def get_project_file_consistency(
    project_id: uuid.UUID,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: Annotated[AsyncSession, Depends(get_db_session)],
):
    """Retrieve cross-file consistency status matrix for project workspace."""
    service = ProjectService(db)
    project = await service.get_by_id(project_id)
    if not project:
        raise NotFoundError("Project not found")
    return await service.get_file_consistency(project)

