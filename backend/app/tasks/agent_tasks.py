import asyncio
import uuid
import structlog
from app.worker import celery_app
from app.agents.orchestrator import LangGraphOrchestrator
from app.api.v1.websocket import ws_manager
from app.core.database import sessionmanager
from app.services.project_service import ProjectService
from app.models.project import ProjectStatus

logger = structlog.get_logger(__name__)


@celery_app.task(name="tasks.run_project_orchestration")
def run_project_orchestration_task(project_id: str, project_name: str, description: str, config: dict):
    """Celery task to run the multi-agent orchestration pipeline."""
    logger.info("celery_agent_task_started", project_id=project_id)
    loop = asyncio.get_event_loop()
    if loop.is_closed():
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)

    return loop.run_until_complete(
        _execute_orchestration(project_id, project_name, description, config)
    )


async def _execute_orchestration(project_id: str, project_name: str, description: str, config: dict):
    orchestrator = LangGraphOrchestrator()

    async def on_progress(project_id: str, agent_key: str, progress: int, logs: list, artifacts: dict):
        # Broadcast real-time WebSocket update
        await ws_manager.broadcast(
            project_id=project_id,
            message={
                "event": "agent_progress",
                "agent": agent_key,
                "progress": progress,
                "logs": logs,
                "artifacts": artifacts,
            },
        )

        # Update Database progress
        async with sessionmanager.session() as db:
            service = ProjectService(db)
            project = await service.get_by_id(uuid.UUID(project_id))
            if project:
                new_status = (
                    ProjectStatus.COMPLETED
                    if progress >= 100
                    else ProjectStatus.IN_PROGRESS
                )
                await service.update_project(
                    project,
                    proj_in=None,  # Or direct update
                )
                project.progress = progress
                project.status = new_status
                await db.commit()

    final_state = await orchestrator.run_pipeline(
        project_id=project_id,
        project_name=project_name,
        description=description,
        config=config,
        on_progress_callback=on_progress,
    )

    return final_state
