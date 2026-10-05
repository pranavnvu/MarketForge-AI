from shared.config.settings import settings


class OrchestratorConfig:
    SERVICE_NAME: str = "orchestrator_service"
    PORT: int = settings.ORCHESTRATOR_PORT
    DESCRIPTION: str = "LangGraph Workflow Orchestrator coordinating independent agent microservices"

    # Microservice API Endpoints
    PROJECT_MANAGER_URL: str = f"http://127.0.0.1:{settings.PROJECT_MANAGER_PORT}"
    DATABASE_AGENT_URL: str = f"http://127.0.0.1:{settings.DATABASE_AGENT_PORT}"
    BACKEND_AGENT_URL: str = f"http://127.0.0.1:{settings.BACKEND_AGENT_PORT}"
    FRONTEND_AGENT_URL: str = f"http://127.0.0.1:{settings.FRONTEND_AGENT_PORT}"
    QA_AGENT_URL: str = f"http://127.0.0.1:{settings.QA_AGENT_PORT}"
    DOCUMENTATION_AGENT_URL: str = f"http://127.0.0.1:{settings.DOCUMENTATION_AGENT_PORT}"


orchestrator_config = OrchestratorConfig()
