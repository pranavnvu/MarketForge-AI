import uuid
from typing import Optional, List, Any
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.workspace import Workspace, WorkspaceMember, WorkspaceRole
from app.models.user import User
from app.schemas.workspace import WorkspaceCreate, WorkspaceUpdate


class WorkspaceService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(self, workspace_id: Any) -> Optional[Workspace]:
        ws_id_str = str(workspace_id)
        result = await self.db.execute(select(Workspace).where(Workspace.id == ws_id_str))
        return result.scalar_one_or_none()

    async def get_user_workspaces(self, user_id: Any) -> List[Workspace]:
        user_id_str = str(user_id)
        result = await self.db.execute(
            select(Workspace)
            .join(WorkspaceMember, WorkspaceMember.workspace_id == Workspace.id)
            .where(WorkspaceMember.user_id == user_id_str)
        )
        return list(result.scalars().all())

    async def create_workspace(self, user: User, ws_in: WorkspaceCreate) -> Workspace:
        user_id_str = str(user.id)
        ws = Workspace(
            name=ws_in.name,
            description=ws_in.description,
            owner_id=user_id_str,
            plan=ws_in.plan,
        )
        self.db.add(ws)
        await self.db.flush()

        member = WorkspaceMember(
            workspace_id=str(ws.id),
            user_id=user_id_str,
            role=WorkspaceRole.OWNER,
        )
        self.db.add(member)
        await self.db.commit()
        await self.db.refresh(ws)
        return ws

    async def update_workspace(self, ws: Workspace, ws_in: WorkspaceUpdate) -> Workspace:
        if ws_in.name is not None:
            ws.name = ws_in.name
        if ws_in.description is not None:
            ws.description = ws_in.description
        if ws_in.plan is not None:
            ws.plan = ws_in.plan
        await self.db.commit()
        await self.db.refresh(ws)
        return ws

    async def delete_workspace(self, ws: Workspace) -> None:
        await self.db.delete(ws)
        await self.db.commit()
