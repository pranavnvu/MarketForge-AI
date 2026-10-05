import secrets
import hashlib
from datetime import datetime
from typing import List, Annotated
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db_session
from app.api.deps import get_current_active_user
from app.models.user import User
from app.models.auth import ApiKey
from pydantic import BaseModel

router = APIRouter(prefix="/api-keys", tags=["API Keys"])

class ApiKeyCreate(BaseModel):
    name: str

class ApiKeyResponse(BaseModel):
    id: str
    name: str
    prefix: str
    is_active: bool
    created_at: datetime
    last_used_at: datetime = None
    token: str = None  # Only returned on creation

    class Config:
        orm_mode = True

@router.get("", response_model=List[ApiKeyResponse])
async def list_api_keys(
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: Annotated[AsyncSession, Depends(get_db_session)]
):
    result = await db.execute(select(ApiKey).where(ApiKey.user_id == current_user.id))
    keys = result.scalars().all()
    return keys

@router.post("", response_model=ApiKeyResponse)
async def create_api_key(
    req: ApiKeyCreate,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: Annotated[AsyncSession, Depends(get_db_session)]
):
    token = f"df_{secrets.token_hex(20)}"
    token_hash = hashlib.sha256(token.encode()).hexdigest()
    
    new_key = ApiKey(
        user_id=current_user.id,
        name=req.name,
        key_hash=token_hash,
        prefix=token[:10] + "..."
    )
    db.add(new_key)
    await db.commit()
    await db.refresh(new_key)
    
    resp = ApiKeyResponse.from_orm(new_key)
    resp.token = token
    return resp

@router.delete("/{key_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_api_key(
    key_id: str,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: Annotated[AsyncSession, Depends(get_db_session)]
):
    result = await db.execute(select(ApiKey).where(ApiKey.id == key_id, ApiKey.user_id == current_user.id))
    key = result.scalar_one_or_none()
    if not key:
        raise HTTPException(status_code=404, detail="API Key not found")
    await db.delete(key)
    await db.commit()
    return None
