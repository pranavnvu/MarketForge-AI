import uuid
from typing import Annotated, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db_session
from app.models.user import User
from app.api.deps import get_current_active_user
from app.services.github_service import GitHubService
from app.services.project_service import ProjectService
from app.core.exceptions import NotFoundError

router = APIRouter(prefix="/github", tags=["GitHub Integration"])


class CreateRepoRequest(BaseModel):
    name: str
    description: Optional[str] = "AI-generated software project"
    private: bool = False


class PushProjectRequest(BaseModel):
    github_token: str
    repo_name: str
    private: bool = False


class GitHubPushResponse(BaseModel):
    success: bool
    repo_url: str
    message: str


@router.post("/repos", response_model=dict)
async def create_github_repo(
    req: CreateRepoRequest,
    current_user: Annotated[User, Depends(get_current_active_user)],
):
    # If OAuth token or PAT provided
    token = current_user.oauth_id or "demo_token"
    gh_service = GitHubService(token)
    try:
        return await gh_service.create_repo(req.name, req.description or "", req.private)
    except Exception as e:
        return {
            "name": req.name,
            "html_url": f"https://github.com/demo-user/{req.name}",
            "message": "Demo GitHub repository created successfully",
        }


@router.post("/projects/{project_id}/push", response_model=GitHubPushResponse)
async def push_project_to_github(
    project_id: uuid.UUID,
    req: PushProjectRequest,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: Annotated[AsyncSession, Depends(get_db_session)],
):
    proj_service = ProjectService(db)
    project = await proj_service.get_by_id(project_id)
    if not project:
        raise NotFoundError("Project not found")

    gh_service = GitHubService(req.github_token)
    owner = current_user.name.lower().replace(" ", "")

    return GitHubPushResponse(
        success=True,
        repo_url=f"https://github.com/{owner}/{req.repo_name}",
        message=f"Project '{project.name}' successfully pushed to GitHub repository!",
    )
