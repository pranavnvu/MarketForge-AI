import time
from typing import Dict, Any
from app.agents.base import BaseAgent, AgentOutput


class ArchitectAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            name="Architect",
            agent_type="architect",
            icon="🏗️",
            color="#06B6D4",
        )

    async def execute(self, state: Dict[str, Any]) -> AgentOutput:
        start_time = time.time()
        logs = []
        logs.append(self.log("Reviewing PRD and designing system architecture..."))

        tech_stack = state.get("config", {}).get("techStack", "fullstack")
        language = state.get("config", {}).get("language", "typescript")

        architecture = {
            "system_type": tech_stack,
            "primary_language": language,
            "database_schema": {
                "tables": ["users", "workspaces", "projects", "tasks", "logs"]
            },
            "api_endpoints": [
                "POST /api/v1/auth/login",
                "POST /api/v1/auth/register",
                "GET /api/v1/projects",
                "POST /api/v1/projects",
            ],
            "mermaid_diagram": "graph TD;\n  UI[React UI] --> API[FastAPI Backend];\n  API --> DB[(PostgreSQL)];\n  API --> Redis[(Redis)];",
        }

        logs.append(self.log("System architecture and database schema designed successfully."))
        exec_time = time.time() - start_time

        return AgentOutput(
            agent_type=self.agent_type,
            agent_name=self.name,
            status="completed",
            summary="Designed system architecture, API endpoints, database schema, and Mermaid ER diagram.",
            artifacts={"architecture": architecture},
            logs=logs,
            execution_time_seconds=round(exec_time, 2),
        )
