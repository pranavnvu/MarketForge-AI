from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from shared.utils.logger import setup_logger
from orchestrator.config import orchestrator_config
from orchestrator.workflow import execute_multi_agent_pipeline

logger = setup_logger(orchestrator_config.SERVICE_NAME)

app = FastAPI(
    title=orchestrator_config.SERVICE_NAME,
    description=orchestrator_config.DESCRIPTION,
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class BuildRequest(BaseModel):
    idea: str


@app.get("/health")
async def health_check():
    return {
        "status": "ok",
        "service": orchestrator_config.SERVICE_NAME,
        "port": orchestrator_config.PORT,
        "agents": {
            "project_manager": orchestrator_config.PROJECT_MANAGER_URL,
            "database_agent": orchestrator_config.DATABASE_AGENT_URL,
            "backend_agent": orchestrator_config.BACKEND_AGENT_URL,
            "frontend_agent": orchestrator_config.FRONTEND_AGENT_URL,
            "qa_agent": orchestrator_config.QA_AGENT_URL,
            "documentation_agent": orchestrator_config.DOCUMENTATION_AGENT_URL,
        },
    }


@app.post("/build")
async def build_software(request: BuildRequest):
    """
    Orchestrator Gateway endpoint (POST /build)
    Triggers end-to-end execution across PM -> Database -> Backend -> Frontend -> QA -> Docs microservice agents.
    """
    try:
        logger.info("Received software build request", idea=request.idea)
        state = await execute_multi_agent_pipeline(request.idea)
        return state.to_dict()
    except Exception as exc:
        logger.error("Build execution error", error=str(exc))
        raise HTTPException(status_code=500, detail=str(exc))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=orchestrator_config.PORT, reload=True)
