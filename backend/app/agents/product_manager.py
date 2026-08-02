import time
from typing import Dict, Any
from app.agents.base import BaseAgent, AgentOutput


class ProductManagerAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            name="Product Manager",
            agent_type="product_manager",
            icon="📋",
            color="#8B5CF6",
        )

    async def execute(self, state: Dict[str, Any]) -> AgentOutput:
        start_time = time.time()
        logs = []
        logs.append(self.log("Analyzing user software idea and requirements..."))
        
        project_name = state.get("project_name", "Software Application")
        description = state.get("description", "A modern web application")
        target_users = state.get("config", {}).get("targetUsers", "End Users")

        logs.append(self.log(f"Formulating PRD and User Stories for {project_name}..."))

        prd = {
            "title": f"{project_name} — Product Requirements Document",
            "overview": description,
            "target_audience": target_users,
            "user_stories": [
                f"As a user, I want to sign up and authenticate securely.",
                f"As a user, I want a main dashboard to manage resources.",
                f"As an admin, I want analytics and activity logs.",
            ],
            "acceptance_criteria": [
                "Authentication with JWT token rotation",
                "Responsive UI for desktop and mobile",
                "API response latency under 200ms",
            ],
        }

        logs.append(self.log("PRD generated successfully with 3 user stories and acceptance criteria."))
        exec_time = time.time() - start_time

        return AgentOutput(
            agent_type=self.agent_type,
            agent_name=self.name,
            status="completed",
            summary=f"Created Product Requirements Document with {len(prd['user_stories'])} core user stories.",
            artifacts={"prd": prd},
            logs=logs,
            execution_time_seconds=round(exec_time, 2),
        )
