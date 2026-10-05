import uuid
from typing import Optional, List, Any
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User, UserRole
from app.models.workspace import Workspace, WorkspaceMember, WorkspacePlan, WorkspaceRole
from app.schemas.user import UserCreate, UserUpdate
from app.core.security import get_password_hash


class UserService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(self, user_id: Any) -> Optional[User]:
        user_id_str = str(user_id)
        result = await self.db.execute(select(User).where(User.id == user_id_str))
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
            role=getattr(user_in, "role", UserRole.USER),
            is_verified=is_verified,
            avatar=getattr(user_in, "avatar", None),
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
        if user_in.email is not None:
            user.email = user_in.email
        if user_in.avatar is not None:
            user.avatar = user_in.avatar
        if user_in.bio is not None:
            user.bio = user_in.bio
        if user_in.location is not None:
            user.location = user_in.location
        if user_in.website is not None:
            user.website = user_in.website
        if user_in.github is not None:
            user.github = user_in.github
        if user_in.job_title is not None:
            user.job_title = user_in.job_title
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
