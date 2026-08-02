import time
from typing import Dict, Any
from app.agents.base import BaseAgent, AgentOutput


class PlannerAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            name="Planner",
            agent_type="planner",
            icon="📊",
            color="#F59E0B",
        )

    async def execute(self, state: Dict[str, Any]) -> AgentOutput:
        start_time = time.time()
        logs = []
        logs.append(self.log("Breaking down architecture into implementation tasks..."))

        tasks = [
            {"id": "task-1", "title": "Setup DB Models & Migrations", "priority": "high", "assignee": "backend_dev"},
            {"id": "task-2", "title": "Build Auth & Project API Endpoints", "priority": "high", "assignee": "backend_dev"},
            {"id": "task-3", "title": "Create React UI Components & Layouts", "priority": "high", "assignee": "frontend_dev"},
            {"id": "task-4", "title": "Write Automated Unit & Integration Tests", "priority": "medium", "assignee": "qa_engineer"},
            {"id": "task-5", "title": "Perform Security Vulnerability Audit", "priority": "medium", "assignee": "security_analyst"},
            {"id": "task-6", "title": "Docker Containerization & CI/CD", "priority": "medium", "assignee": "devops"},
        ]

        logs.append(self.log(f"Generated task breakdown with {len(tasks)} prioritized tasks."))
        exec_time = time.time() - start_time

        return AgentOutput(
            agent_type=self.agent_type,
            agent_name=self.name,
            status="completed",
            summary=f"Created sprint plan with {len(tasks)} execution tasks and dependency graph.",
            artifacts={"tasks": tasks},
            logs=logs,
            execution_time_seconds=round(exec_time, 2),
        )
