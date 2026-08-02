from typing import Annotated
from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from app.core.config import settings
from app.core.security import decode_token
from app.core.exceptions import AuthenticationError, AuthorizationError

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_PREFIX}/auth/login")

class MockUser: # Replace with actual user model later
    id: str
    is_active: bool
    role: str
    def __init__(self, user_id, is_active=True, role="user"):
        self.id = user_id
        self.is_active = is_active
        self.role = role

async def get_current_user(token: Annotated[str, Depends(oauth2_scheme)]):
    try:
        payload = decode_token(token)
        user_id: str = payload.get("sub")
        if user_id is None:
            raise AuthenticationError()
        # Fetch user from DB here
        user = MockUser(user_id=user_id) 
        if user is None:
            raise AuthenticationError()
        return user
    except JWTError:
        raise AuthenticationError()

async def get_current_active_user(current_user = Depends(get_current_user)):
    if not current_user.is_active:
        raise AuthenticationError("Inactive user")
    return current_user

async def require_admin(current_user = Depends(get_current_active_user)):
    if current_user.role != "admin":
        raise AuthorizationError("Admin privileges required")
    return current_user
