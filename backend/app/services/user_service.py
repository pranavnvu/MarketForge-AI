import uuid
from typing import Optional, List
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User, UserRole
from app.models.workspace import Workspace, WorkspaceMember, WorkspacePlan, WorkspaceRole
from app.schemas.user import UserCreate, UserUpdate
from app.core.security import get_password_hash


class UserService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(self, user_id: uuid.UUID) -> Optional[User]:
        result = await self.db.execute(select(User).where(User.id == user_id))
        return result.scalar_one_or_none()

    async def get_by_email(self, email: str) -> Optional[User]:
        result = await self.db.execute(select(User).where(User.email == email.lower()))
        return result.scalar_one_or_none()

    async def create_user(self, user_in: UserCreate, is_verified: bool = False) -> User:
        hashed = get_password_hash(user_in.password)
        user = User(
            email=user_in.email.lower(),
            name=user_in.name,
            hashed_password=hashed,
            role=user_in.role,
            is_verified=is_verified,
            avatar=user_in.avatar,
        )
        self.db.add(user)
        await self.db.flush()

        # Create default personal workspace for user
        default_workspace = Workspace(
            name=f"{user.name}'s Workspace",
            description="Default workspace",
            owner_id=user.id,
            plan=WorkspacePlan.FREE,
        )
        self.db.add(default_workspace)
        await self.db.flush()

        member = WorkspaceMember(
            workspace_id=default_workspace.id,
            user_id=user.id,
            role=WorkspaceRole.OWNER,
        )
        self.db.add(member)
        await self.db.commit()
        await self.db.refresh(user)
        return user

    async def update_user(self, user: User, user_in: UserUpdate) -> User:
        if user_in.name is not None:
            user.name = user_in.name
        if user_in.avatar is not None:
            user.avatar = user_in.avatar
        await self.db.commit()
        await self.db.refresh(user)
        return user

    async def update_password(self, user: User, new_password: str) -> None:
        user.hashed_password = get_password_hash(new_password)
        await self.db.commit()

    async def verify_user_email(self, user: User) -> None:
        user.is_verified = True
        await self.db.commit()

    async def delete_user(self, user: User) -> None:
        await self.db.delete(user)
        await self.db.commit()
