import uuid
from typing import Optional, List
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.project import Project, ProjectStatus
from app.models.user import User
from app.schemas.project import ProjectCreate, ProjectUpdate
from app.services.workspace_service import WorkspaceService
from app.core.exceptions import NotFoundError, AuthorizationError


class ProjectService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.workspace_service = WorkspaceService(db)

    async def get_by_id(self, project_id: uuid.UUID) -> Optional[Project]:
        result = await self.db.execute(select(Project).where(Project.id == project_id))
        return result.scalar_one_or_none()

    async def get_user_projects(self, user_id: uuid.UUID) -> List[Project]:
        workspaces = await self.workspace_service.get_user_workspaces(user_id)
        ws_ids = [w.id for w in workspaces]
        if not ws_ids:
            return []
        result = await self.db.execute(
            select(Project).where(Project.workspace_id.in_(ws_ids)).order_by(Project.created_at.desc())
        )
        return list(result.scalars().all())

    async def create_project(self, user: User, proj_in: ProjectCreate) -> Project:
        target_ws_id = proj_in.workspace_id
        if not target_ws_id:
            workspaces = await self.workspace_service.get_user_workspaces(user.id)
            if not workspaces:
                raise NotFoundError("No default workspace found for user")
            target_ws_id = workspaces[0].id

        project = Project(
            workspace_id=target_ws_id,
            name=proj_in.name,
            description=proj_in.description,
            status=ProjectStatus.PLANNING,
            progress=5,
            config=proj_in.config,
        )
        self.db.add(project)
        await self.db.commit()
        await self.db.refresh(project)
        return project

    async def update_project(self, project: Project, proj_in: ProjectUpdate) -> Project:
        if proj_in.name is not None:
            project.name = proj_in.name
        if proj_in.description is not None:
            project.description = proj_in.description
        if proj_in.status is not None:
            project.status = proj_in.status
        if proj_in.progress is not None:
            project.progress = proj_in.progress
        if proj_in.config is not None:
            project.config = proj_in.config

        await self.db.commit()
        await self.db.refresh(project)
        return project

    async def delete_project(self, project: Project) -> None:
        await self.db.delete(project)
        await self.db.commit()
