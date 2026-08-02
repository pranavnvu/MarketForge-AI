import uuid
import secrets
from datetime import datetime, timedelta, timezone
from typing import Optional, Tuple
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.models.auth import RefreshToken, PasswordResetToken, EmailVerificationToken
from app.schemas.auth import RegisterRequest, LoginRequest, TokenResponse
from app.services.user_service import UserService
from app.core.security import verify_password, create_access_token, create_refresh_token
from app.core.config import settings
from app.core.exceptions import AuthenticationError, ValidationError, NotFoundError


class AuthService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.user_service = UserService(db)

    async def register(self, req: RegisterRequest) -> Tuple[User, str, str]:
        existing = await self.user_service.get_by_email(req.email)
        if existing:
            raise ValidationError("A user with this email address already exists")

        # In dev, auto-verify for smooth testing
        is_verified = settings.DEBUG
        user = await self.user_service.create_user(req, is_verified=is_verified)

        access_token, refresh_token = await self.issue_tokens(user)
        return user, access_token, refresh_token

    async def login(self, req: LoginRequest) -> Tuple[User, str, str]:
        user = await self.user_service.get_by_email(req.email)
        if not user or not user.hashed_password:
            raise AuthenticationError("Invalid email or password")

        if not verify_password(req.password, user.hashed_password):
            raise AuthenticationError("Invalid email or password")

        if not user.is_active:
            raise AuthenticationError("User account is inactive")

        access_token, refresh_token = await self.issue_tokens(user)
        return user, access_token, refresh_token

    async def issue_tokens(self, user: User) -> Tuple[str, str]:
        access_token = create_access_token(subject=str(user.id))
        raw_refresh_token = create_refresh_token(subject=str(user.id))

        expires_at = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)

        token_record = RefreshToken(
            user_id=user.id,
            token=raw_refresh_token,
            expires_at=expires_at,
        )
        self.db.add(token_record)
        await self.db.commit()

        return access_token, raw_refresh_token

    async def refresh_tokens(self, refresh_token_str: str) -> str:
        result = await self.db.execute(
            select(RefreshToken).where(
                RefreshToken.token == refresh_token_str,
                RefreshToken.is_revoked == False
            )
        )
        token_record = result.scalar_one_or_none()
        if not token_record:
            raise AuthenticationError("Invalid or revoked refresh token")

        if token_record.expires_at < datetime.now(timezone.utc):
            raise AuthenticationError("Refresh token expired")

        user = await self.user_service.get_by_id(token_record.user_id)
        if not user or not user.is_active:
            raise AuthenticationError("User not found or inactive")

        new_access_token = create_access_token(subject=str(user.id))
        return new_access_token

    async def revoke_refresh_token(self, refresh_token_str: str) -> None:
        result = await self.db.execute(
            select(RefreshToken).where(RefreshToken.token == refresh_token_str)
        )
        token_record = result.scalar_one_or_none()
        if token_record:
            token_record.is_revoked = True
            await self.db.commit()

    async def create_forgot_password_token(self, email: str) -> Optional[str]:
        user = await self.user_service.get_by_email(email)
        if not user:
            return None

        raw_token = secrets.token_urlsafe(32)
        expires_at = datetime.now(timezone.utc) + timedelta(hours=2)

        reset_record = PasswordResetToken(
            user_id=user.id,
            token=raw_token,
            expires_at=expires_at,
        )
        self.db.add(reset_record)
        await self.db.commit()

        return raw_token

    async def reset_password_with_token(self, token: str, new_password: str) -> None:
        result = await self.db.execute(
            select(PasswordResetToken).where(
                PasswordResetToken.token == token,
                PasswordResetToken.is_used == False,
            )
        )
        reset_record = result.scalar_one_or_none()
        if not reset_record:
            raise ValidationError("Invalid or expired password reset token")

        if reset_record.expires_at < datetime.now(timezone.utc):
            raise ValidationError("Password reset token expired")

        user = await self.user_service.get_by_id(reset_record.user_id)
        if not user:
            raise NotFoundError("User not found")

        await self.user_service.update_password(user, new_password)
        reset_record.is_used = True
        await self.db.commit()

    async def verify_email_with_token(self, token: str) -> bool:
        result = await self.db.execute(
            select(EmailVerificationToken).where(
                EmailVerificationToken.token == token,
                EmailVerificationToken.is_used == False,
            )
        )
        ver_record = result.scalar_one_or_none()
        if not ver_record or ver_record.expires_at < datetime.now(timezone.utc):
            return False

        user = await self.user_service.get_by_id(ver_record.user_id)
        if not user:
            return False

        await self.user_service.verify_user_email(user)
        ver_record.is_used = True
        await self.db.commit()
        return True
