import uuid
from typing import Annotated, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db_session
from app.models.user import User
from app.schemas.workspace import (
    WorkspaceCreate,
    WorkspaceUpdate,
    WorkspaceResponse,
)
from app.schemas.common import MessageResponse
from app.services.workspace_service import WorkspaceService
from app.api.deps import get_current_active_user
from app.core.exceptions import NotFoundError

router = APIRouter(prefix="/workspaces", tags=["Workspaces"])


@router.get("", response_model=List[WorkspaceResponse])
async def list_workspaces(
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: Annotated[AsyncSession, Depends(get_db_session)],
):
    service = WorkspaceService(db)
    return await service.get_user_workspaces(current_user.id)


@router.post("", response_model=WorkspaceResponse, status_code=status.HTTP_201_CREATED)
async def create_workspace(
    req: WorkspaceCreate,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: Annotated[AsyncSession, Depends(get_db_session)],
):
    service = WorkspaceService(db)
    return await service.create_workspace(current_user, req)


@router.get("/{workspace_id}", response_model=WorkspaceResponse)
async def get_workspace(
    workspace_id: uuid.UUID,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: Annotated[AsyncSession, Depends(get_db_session)],
):
    service = WorkspaceService(db)
    ws = await service.get_by_id(workspace_id)
    if not ws:
        raise NotFoundError("Workspace not found")
    return ws


@router.put("/{workspace_id}", response_model=WorkspaceResponse)
async def update_workspace(
    workspace_id: uuid.UUID,
    req: WorkspaceUpdate,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: Annotated[AsyncSession, Depends(get_db_session)],
):
    service = WorkspaceService(db)
    ws = await service.get_by_id(workspace_id)
    if not ws:
        raise NotFoundError("Workspace not found")
    return await service.update_workspace(ws, req)


@router.delete("/{workspace_id}", response_model=MessageResponse)
async def delete_workspace(
    workspace_id: uuid.UUID,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: Annotated[AsyncSession, Depends(get_db_session)],
):
    service = WorkspaceService(db)
    ws = await service.get_by_id(workspace_id)
    if not ws:
        raise NotFoundError("Workspace not found")
    await service.delete_workspace(ws)
    return MessageResponse(message="Workspace deleted successfully")
