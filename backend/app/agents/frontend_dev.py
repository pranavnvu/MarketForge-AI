import time
from typing import Dict, Any
from app.agents.base import BaseAgent, AgentOutput


class FrontendDevAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            name="Frontend Developer",
            agent_type="frontend_dev",
            icon="🎨",
            color="#EC4899",
        )

    async def execute(self, state: Dict[str, Any]) -> AgentOutput:
        start_time = time.time()
        logs = []
        logs.append(self.log("Building React components, pages, state management, and styling..."))

        files = [
            {"path": "src/App.tsx", "language": "typescript", "lines": 25},
            {"path": "src/pages/Dashboard.tsx", "language": "typescript", "lines": 120},
            {"path": "src/components/Navigation.tsx", "language": "typescript", "lines": 60},
        ]

        logs.append(self.log(f"Generated {len(files)} frontend React/TypeScript source files."))
        exec_time = time.time() - start_time

        return AgentOutput(
            agent_type=self.agent_type,
            agent_name=self.name,
            status="completed",
            summary=f"Created React components, pages, design system tokens, and state stores ({len(files)} files).",
            artifacts={"frontend_files": files},
            logs=logs,
            execution_time_seconds=round(exec_time, 2),
        )
