from datetime import datetime
from typing import Optional, Dict, Any
from uuid import UUID
from pydantic import BaseModel, ConfigDict
from app.models.project import ProjectStatus


class ProjectBase(BaseModel):
    name: str
    description: Optional[str] = None
    config: Dict[str, Any] = {}


class ProjectCreate(ProjectBase):
    workspace_id: Optional[UUID] = None  # If omitted, uses default workspace


class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[ProjectStatus] = None
    progress: Optional[int] = None
    config: Optional[Dict[str, Any]] = None


class ProjectResponse(ProjectBase):
    id: UUID
    workspace_id: UUID
    status: ProjectStatus
    progress: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class AgentNodeRunRequest(BaseModel):
    agent_key: str


class AgentSwarmChatRequest(BaseModel):
    agent_key: Optional[str] = "all"
    message: str


class FileConsistencyCheckResponse(BaseModel):
    project_id: UUID
    api_contract_matched: bool
    orm_schemas_aligned: bool
    auth_tokens_verified: bool
    total_files: int
    files_synced: bool

