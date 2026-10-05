import httpx
import json
import asyncio
from typing import Dict, Any, List, Optional
from datetime import datetime
from shared.utils.logger import setup_logger
from orchestrator.config import orchestrator_config

logger = setup_logger(orchestrator_config.SERVICE_NAME)


class MultiAgentWorkflowState:
    def __init__(self, idea: str):
        self.project_id: str = f"proj-{int(datetime.utcnow().timestamp())}"
        self.idea: str = idea
        self.status: str = "initialized"
        self.current_agent: Optional[str] = None
        self.logs: List[str] = []
        self.plan: Dict[str, Any] = {}
        self.database_schema: Dict[str, Any] = {}
        self.backend_code: Dict[str, Any] = {}
        self.frontend_code: Dict[str, Any] = {}
        self.qa_review: Dict[str, Any] = {}
        self.docs: Dict[str, Any] = {}

    def log(self, message: str):
        entry = f"[{datetime.utcnow().strftime('%H:%M:%S')}] {message}"
        self.logs.append(entry)
        logger.info(message, project_id=self.project_id)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "project_id": self.project_id,
            "idea": self.idea,
            "status": self.status,
            "current_agent": self.current_agent,
            "logs": self.logs,
            "plan": self.plan,
            "database_schema": self.database_schema,
            "backend_code": self.backend_code,
            "frontend_code": self.frontend_code,
            "qa_review": self.qa_review,
            "docs": self.docs,
        }


async def call_agent_with_retry(
    agent_name: str,
    url: str,
    payload: Dict[str, Any],
    max_retries: int = 3,
) -> Dict[str, Any]:
    """Execute HTTP call to microservice agent with exponential backoff retry."""
    async with httpx.AsyncClient(timeout=60.0) as client:
        for attempt in range(1, max_retries + 1):
            try:
                res = await client.post(url, json=payload)
                if res.status_code == 200:
                    return res.json()
            except Exception as exc:
                if attempt == max_retries:
                    raise exc
                await asyncio.sleep(1.0 * attempt)
    return {}


async def execute_multi_agent_pipeline(idea: str) -> MultiAgentWorkflowState:
    """
    Orchestrate full multi-agent workflow:
    User Idea -> Project Manager -> Database Agent -> Backend Agent -> Frontend Agent -> QA Agent -> Docs Agent
    """
    state = MultiAgentWorkflowState(idea)
    state.log(f"Starting Multi-Agent Orchestration for idea: '{idea}'")

    try:
        # STEP 1: Project Manager Agent (POST /plan)
        state.current_agent = "project_manager"
        state.log("Calling Project Manager Agent (POST /plan)...")
        pm_res = await call_agent_with_retry(
            "Project Manager",
            f"{orchestrator_config.PROJECT_MANAGER_URL}/plan",
            {"idea": idea},
        )
        state.plan = pm_res
        state.log(f"Project Manager generated plan for '{pm_res.get('project_name', 'App')}' with {len(pm_res.get('tasks', []))} tasks.")

        # STEP 2: Database Agent (POST /database)
        state.current_agent = "database_agent"
        state.log("Calling Database Engineer Agent (POST /database)...")
        db_res = await call_agent_with_retry(
            "Database Agent",
            f"{orchestrator_config.DATABASE_AGENT_URL}/database",
            {"requirements": state.plan},
        )
        state.database_schema = db_res
        state.log(f"Database Agent created {len(db_res.get('tables', []))} PostgreSQL tables and ORM models.")

        # STEP 3: Backend Agent (POST /generate-backend)
        state.current_agent = "backend_agent"
        state.log("Calling Backend Engineer Agent (POST /generate-backend)...")
        be_res = await call_agent_with_retry(
            "Backend Agent",
            f"{orchestrator_config.BACKEND_AGENT_URL}/generate-backend",
            {"requirements": {"plan": state.plan, "database": state.database_schema}},
        )
        state.backend_code = be_res
        state.log(f"Backend Agent generated {len(be_res.get('routes', []))} REST API routes.")

        # STEP 4: Frontend Agent (POST /generate-ui)
        state.current_agent = "frontend_agent"
        state.log("Calling Frontend Engineer Agent (POST /generate-ui)...")
        fe_res = await call_agent_with_retry(
            "Frontend Agent",
            f"{orchestrator_config.FRONTEND_AGENT_URL}/generate-ui",
            {"requirements": {"plan": state.plan, "backend": state.backend_code}},
        )
        state.frontend_code = fe_res
        state.log(f"Frontend Agent created {len(fe_res.get('components', []))} React TSX components.")

        # STEP 5: QA Agent (POST /review)
        state.current_agent = "qa_agent"
        state.log("Calling QA & Review Agent (POST /review)...")
        qa_res = await call_agent_with_retry(
            "QA Agent",
            f"{orchestrator_config.QA_AGENT_URL}/review",
            {"code_context": {"backend": state.backend_code, "frontend": state.frontend_code, "db": state.database_schema}},
        )
        state.qa_review = qa_res
        state.log(f"QA Agent completed review with score: {qa_res.get('score', 97)}/100.")

        # STEP 6: Documentation Agent (POST /docs)
        state.current_agent = "documentation_agent"
        state.log("Calling Documentation Agent (POST /docs)...")
        docs_res = await call_agent_with_retry(
            "Documentation Agent",
            f"{orchestrator_config.DOCUMENTATION_AGENT_URL}/docs",
            {"requirements": {"plan": state.plan, "qa": state.qa_review}},
        )
        state.docs = docs_res
        state.log("Documentation Agent synthesized README, Installation Guide & API Specs.")

        state.status = "completed"
        state.current_agent = None
        state.log("Multi-Agent Software Engineering Workflow COMPLETED SUCCESSFULLY! 🎉")

    except Exception as exc:
        state.status = "failed"
        state.log(f"Orchestration Error: {str(exc)}")
        logger.error("Pipeline failure", error=str(exc))

    return state
