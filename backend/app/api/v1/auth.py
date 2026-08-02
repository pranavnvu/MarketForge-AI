from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi.security import OAuth2PasswordRequestForm

from app.core.database import get_db_session
from app.models.user import User
from app.schemas.user import UserResponse, UserUpdate
from app.schemas.auth import (
    RegisterRequest,
    LoginRequest,
    TokenResponse,
    TokenRefreshRequest,
    TokenRefreshResponse,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    ChangePasswordRequest,
)
from app.schemas.common import MessageResponse
from app.services.auth_service import AuthService
from app.services.user_service import UserService
from app.api.deps import get_current_active_user

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(
    req: RegisterRequest,
    db: Annotated[AsyncSession, Depends(get_db_session)],
):
    auth_service = AuthService(db)
    user, access_token, refresh_token = await auth_service.register(req)
    return TokenResponse(
        user=UserResponse.model_validate(user),
        access_token=access_token,
        refresh_token=refresh_token,
    )


@router.post("/login", response_model=TokenResponse)
async def login(
    req: LoginRequest,
    db: Annotated[AsyncSession, Depends(get_db_session)],
):
    auth_service = AuthService(db)
    user, access_token, refresh_token = await auth_service.login(req)
    return TokenResponse(
        user=UserResponse.model_validate(user),
        access_token=access_token,
        refresh_token=refresh_token,
    )


@router.post("/token", response_model=TokenResponse, include_in_schema=False)
async def login_for_access_token(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    db: Annotated[AsyncSession, Depends(get_db_session)],
):
    """OAuth2 compatible token login for FastAPI docs UI."""
    auth_service = AuthService(db)
    user, access_token, refresh_token = await auth_service.login(
        LoginRequest(email=form_data.username, password=form_data.password)
    )
    return TokenResponse(
        user=UserResponse.model_validate(user),
        access_token=access_token,
        refresh_token=refresh_token,
    )


@router.post("/refresh", response_model=TokenRefreshResponse)
async def refresh_token(
    req: TokenRefreshRequest,
    db: Annotated[AsyncSession, Depends(get_db_session)],
):
    auth_service = AuthService(db)
    new_access_token = await auth_service.refresh_tokens(req.refresh_token)
    return TokenRefreshResponse(access_token=new_access_token)


@router.post("/logout", response_model=MessageResponse)
async def logout(
    req: TokenRefreshRequest,
    db: Annotated[AsyncSession, Depends(get_db_session)],
):
    auth_service = AuthService(db)
    await auth_service.revoke_refresh_token(req.refresh_token)
    return MessageResponse(message="Successfully logged out")


@router.get("/me", response_model=UserResponse)
async def get_me(
    current_user: Annotated[User, Depends(get_current_active_user)],
):
    return UserResponse.model_validate(current_user)


@router.put("/me", response_model=UserResponse)
async def update_me(
    req: UserUpdate,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: Annotated[AsyncSession, Depends(get_db_session)],
):
    user_service = UserService(db)
    updated_user = await user_service.update_user(current_user, req)
    return UserResponse.model_validate(updated_user)


@router.put("/change-password", response_model=MessageResponse)
async def change_password(
    req: ChangePasswordRequest,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: Annotated[AsyncSession, Depends(get_db_session)],
):
    from app.core.security import verify_password
    if not verify_password(req.current_password, current_user.hashed_password or ""):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect current password",
        )
    user_service = UserService(db)
    await user_service.update_password(current_user, req.new_password)
    return MessageResponse(message="Password changed successfully")


@router.post("/forgot-password", response_model=MessageResponse)
async def forgot_password(
    req: ForgotPasswordRequest,
    db: Annotated[AsyncSession, Depends(get_db_session)],
):
    auth_service = AuthService(db)
    token = await auth_service.create_forgot_password_token(req.email)
    if not token:
        import secrets
        token = secrets.token_urlsafe(32)

    from app.services.email_service import EmailService
    await EmailService.send_password_reset_email(req.email, token)

    return MessageResponse(
        message="If an account with that email exists, a password reset link has been sent."
    )


@router.post("/reset-password", response_model=MessageResponse)
async def reset_password(
    req: ResetPasswordRequest,
    db: Annotated[AsyncSession, Depends(get_db_session)],
):
    auth_service = AuthService(db)
    await auth_service.reset_password_with_token(req.token, req.new_password)
    return MessageResponse(message="Password has been reset successfully")


@router.get("/verify-email/{token}", response_model=MessageResponse)
async def verify_email(
    token: str,
    db: Annotated[AsyncSession, Depends(get_db_session)],
):
    auth_service = AuthService(db)
    success = await auth_service.verify_email_with_token(token)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired verification token",
        )
    return MessageResponse(message="Email verified successfully")


# OAuth Stubs (Google / GitHub)
@router.get("/google")
async def google_login():
    return {"message": "Google OAuth redirect endpoint placeholder"}


@router.get("/google/callback")
async def google_callback(code: str = Query(...)):
    return {"message": "Google OAuth callback placeholder", "code": code}


@router.get("/github")
async def github_login():
    return {"message": "GitHub OAuth redirect endpoint placeholder"}


@router.get("/github/callback")
async def github_callback(code: str = Query(...)):
    return {"message": "GitHub OAuth callback placeholder", "code": code}
