import asyncio
from app.core.database import get_db_session
from app.services.project_service import ProjectService

async def run_test():
    async for db in get_db_session():
        service = ProjectService(db)
        project_id = "20a0484b-48aa-4198-b090-b63bdbd970a6"
        project = await service.get_by_id(project_id)
        if not project:
            return
            
        await service.run_orchestration(project)
        return

if __name__ == "__main__":
    asyncio.run(run_test())
