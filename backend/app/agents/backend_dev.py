import time
from typing import Dict, Any
from app.agents.base import BaseAgent, AgentOutput


class BackendDevAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            name="Backend Developer",
            agent_type="backend_dev",
            icon="⚙️",
            color="#10B981",
        )

    async def execute(self, state: Dict[str, Any]) -> AgentOutput:
        start_time = time.time()
        logs = []
        logs.append(self.log("Generating backend code, API routes, and database models..."))

        files = [
            {"path": "app/main.py", "language": "python", "lines": 45},
            {"path": "app/models/project.py", "language": "python", "lines": 35},
            {"path": "app/api/v1/projects.py", "language": "python", "lines": 55},
        ]

        logs.append(self.log(f"Generated {len(files)} backend source code files."))
        exec_time = time.time() - start_time

        return AgentOutput(
            agent_type=self.agent_type,
            agent_name=self.name,
            status="completed",
            summary=f"Built backend API endpoints, database models, and service logic ({len(files)} files).",
            artifacts={"backend_files": files},
            logs=logs,
            execution_time_seconds=round(exec_time, 2),
        )
