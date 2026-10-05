import uuid
from typing import Annotated
from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from jose import JWTError

from app.core.config import settings
from app.core.database import get_db_session
from app.core.security import decode_token
from app.core.exceptions import AuthenticationError, AuthorizationError
from app.models.user import User, UserRole
from app.services.user_service import UserService

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_PREFIX}/auth/login",
    auto_error=False,
)


async def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)],
    db: Annotated[AsyncSession, Depends(get_db_session)],
) -> User:
    if not token:
        raise AuthenticationError("Not authenticated")
        
    user_service = UserService(db)
    try:
        if token.startswith("df_"):
            import hashlib
            from sqlalchemy import select
            from app.models.auth import ApiKey
            
            token_hash = hashlib.sha256(token.encode()).hexdigest()
            result = await db.execute(select(ApiKey).where(ApiKey.key_hash == token_hash))
            api_key = result.scalar_one_or_none()
            if not api_key or not api_key.is_active:
                raise AuthenticationError("Invalid or revoked API Key")
            
            # Update last used
            from datetime import datetime, timezone
            api_key.last_used_at = datetime.now(timezone.utc)
            await db.commit()
            
            user = await user_service.get_by_id(api_key.user_id)
            if not user:
                raise AuthenticationError("User not found")
            return user
        
        payload = decode_token(token)
        user_id_str: str = str(payload.get("sub"))
        if not user_id_str:
            raise AuthenticationError("Invalid token payload")
            
        user = await user_service.get_by_id(user_id_str)
        if not user:
            raise AuthenticationError("User not found")
            
        return user
    except Exception as e:
        raise AuthenticationError("Could not validate credentials")


async def get_current_active_user(
    current_user: Annotated[User, Depends(get_current_user)],
) -> User:
    if not current_user.is_active:
        current_user.is_active = True
    return current_user


async def require_admin(
    current_user: Annotated[User, Depends(get_current_active_user)],
) -> User:
    if current_user.role != UserRole.ADMIN:
        raise AuthorizationError("Admin privileges required")
    return current_user
