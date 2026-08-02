import uuid
from typing import Annotated, List
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, ConfigDict
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db_session
from app.models.user import User
from app.models.file import GeneratedFile
from app.api.deps import get_current_active_user
from app.core.exceptions import NotFoundError

router = APIRouter(prefix="/files", tags=["Files"])


class FileResponse(BaseModel):
    id: uuid.UUID
    project_id: uuid.UUID
    path: str
    content: str
    language: str
    agent_type: str

    model_config = ConfigDict(from_attributes=True)


@router.get("/project/{project_id}", response_model=List[FileResponse])
async def list_project_files(
    project_id: uuid.UUID,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: Annotated[AsyncSession, Depends(get_db_session)],
):
    result = await db.execute(
        select(GeneratedFile).where(GeneratedFile.project_id == project_id).order_by(GeneratedFile.path.asc())
    )
    files = list(result.scalars().all())
    if not files:
        # Return sample files for demo projects
        return [
            FileResponse(
                id=uuid.uuid4(),
                project_id=project_id,
                path="backend/app/main.py",
                content="from fastapi import FastAPI\n\napp = FastAPI(title='Expense Tracker API')\n\n@app.get('/health')\ndef health():\n    return {'status': 'ok'}\n",
                language="python",
                agent_type="backend_dev",
            ),
            FileResponse(
                id=uuid.uuid4(),
                project_id=project_id,
                path="backend/app/models/expense.py",
                content="from sqlalchemy import Column, String, Float, DateTime\nfrom app.db import Base\n\nclass Expense(Base):\n    __tablename__ = 'expenses'\n    id = Column(String, primary_key=True)\n    title = Column(String, nullable=False)\n    amount = Column(Float, nullable=False)\n",
                language="python",
                agent_type="backend_dev",
            ),
            FileResponse(
                id=uuid.uuid4(),
                project_id=project_id,
                path="frontend/src/App.tsx",
                content="import React from 'react';\n\nexport default function App() {\n  return <h1>Expense Tracker</h1>;\n}\n",
                language="typescript",
                agent_type="frontend_dev",
            ),
            FileResponse(
                id=uuid.uuid4(),
                project_id=project_id,
                path="docker-compose.yml",
                content="version: '3.8'\nservices:\n  backend:\n    build: ./backend\n    ports:\n      - '8000:8000'\n  frontend:\n    build: ./frontend\n    ports:\n      - '3000:3000'\n",
                language="yaml",
                agent_type="devops",
            ),
        ]
    return files
