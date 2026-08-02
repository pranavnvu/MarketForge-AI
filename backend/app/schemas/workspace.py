from datetime import datetime
from typing import Optional, List
from uuid import UUID
from pydantic import BaseModel, ConfigDict
from app.models.workspace import WorkspacePlan, WorkspaceRole


class WorkspaceBase(BaseModel):
    name: str
    description: Optional[str] = None


class WorkspaceCreate(WorkspaceBase):
    plan: WorkspacePlan = WorkspacePlan.FREE


class WorkspaceUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    plan: Optional[WorkspacePlan] = None


class WorkspaceResponse(WorkspaceBase):
    id: UUID
    owner_id: UUID
    plan: WorkspacePlan
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class WorkspaceMemberResponse(BaseModel):
    workspace_id: UUID
    user_id: UUID
    role: WorkspaceRole
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
