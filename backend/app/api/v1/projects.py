import uuid
from typing import Annotated, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db_session
from app.models.user import User
from app.schemas.project import ProjectCreate, ProjectUpdate, ProjectResponse
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
