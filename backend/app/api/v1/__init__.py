from fastapi import APIRouter
from app.api.v1.health import router as health_router
from app.api.v1.auth import router as auth_router
from app.api.v1.dashboard import router as dashboard_router
from app.api.v1.workspaces import router as workspaces_router
from app.api.v1.projects import router as projects_router
from app.api.v1.websocket import router as websocket_router
from app.api.v1.files import router as files_router
from app.api.v1.github import router as github_router

api_v1_router = APIRouter()
api_v1_router.include_router(health_router)
api_v1_router.include_router(auth_router)
api_v1_router.include_router(dashboard_router)
api_v1_router.include_router(workspaces_router)
api_v1_router.include_router(projects_router)
api_v1_router.include_router(websocket_router)
api_v1_router.include_router(files_router)
api_v1_router.include_router(github_router)
