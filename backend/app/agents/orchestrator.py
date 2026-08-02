import asyncio
from typing import Dict, Any, List, TypedDict
import structlog

from app.agents import ALL_AGENTS, BaseAgent, AgentOutput

logger = structlog.get_logger(__name__)


class ProjectOrchestrationState(TypedDict):
    project_id: str
    project_name: str
    description: str
    config: Dict[str, Any]
    current_agent: str
    progress: int
    artifacts: Dict[str, Any]
    logs: List[str]
    status: str


class LangGraphOrchestrator:
    """LangGraph multi-agent workflow state machine orchestrator."""

    def __init__(self):
        self.agents: Dict[str, BaseAgent] = {
            key: cls() for key, cls in ALL_AGENTS.items()
        }
        self.pipeline_order = [
            "product_manager",
            "architect",
            "planner",
            "backend_dev",
            "frontend_dev",
            "qa_engineer",
            "security_analyst",
            "code_reviewer",
            "documentation",
            "devops",
        ]

    async def run_pipeline(
        self,
        project_id: str,
        project_name: str,
        description: str,
        config: Dict[str, Any],
        on_progress_callback=None,
    ) -> ProjectOrchestrationState:
        state: ProjectOrchestrationState = {
            "project_id": project_id,
            "project_name": project_name,
            "description": description,
            "config": config,
            "current_agent": self.pipeline_order[0],
            "progress": 0,
            "artifacts": {},
            "logs": [f"Starting multi-agent software engineering workflow for '{project_name}'..."],
            "status": "in_progress",
        }

        total_steps = len(self.pipeline_order)

        for idx, agent_key in enumerate(self.pipeline_order):
            agent = self.agents[agent_key]
            state["current_agent"] = agent_key
            state["progress"] = int(((idx) / total_steps) * 100)

            logger.info("executing_agent", agent=agent.name, project_id=project_id)
            output: AgentOutput = await agent.execute(state)

            state["artifacts"][agent_key] = output.artifacts
            state["logs"].extend(output.logs)

            if on_progress_callback:
                await on_progress_callback(
                    project_id=project_id,
                    agent_key=agent_key,
                    progress=state["progress"],
                    logs=output.logs,
                    artifacts=output.artifacts,
                )

            # Micro pause for real-time visualization streaming
            await asyncio.sleep(0.5)

        state["progress"] = 100
        state["status"] = "completed"
        state["current_agent"] = "completed"
        state["logs"].append("Multi-agent software engineering lifecycle completed successfully! 🎉")

        if on_progress_callback:
            await on_progress_callback(
                project_id=project_id,
                agent_key="completed",
                progress=100,
                logs=["Multi-agent lifecycle completed successfully!"],
                artifacts={},
            )

        return state
