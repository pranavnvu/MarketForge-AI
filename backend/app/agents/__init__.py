from app.agents.base import BaseAgent, AgentOutput
from app.agents.product_manager import ProductManagerAgent
from app.agents.architect import ArchitectAgent
from app.agents.planner import PlannerAgent
from app.agents.backend_dev import BackendDevAgent
from app.agents.frontend_dev import FrontendDevAgent
from app.agents.qa_engineer import QAEngineerAgent
from app.agents.security_analyst import SecurityAnalystAgent
from app.agents.code_reviewer import CodeReviewerAgent
from app.agents.documentation import DocumentationAgent
from app.agents.devops import DevOpsAgent

ALL_AGENTS = {
    "product_manager": ProductManagerAgent,
    "architect": ArchitectAgent,
    "planner": PlannerAgent,
    "backend_dev": BackendDevAgent,
    "frontend_dev": FrontendDevAgent,
    "qa_engineer": QAEngineerAgent,
    "security_analyst": SecurityAnalystAgent,
    "code_reviewer": CodeReviewerAgent,
    "documentation": DocumentationAgent,
    "devops": DevOpsAgent,
}

__all__ = [
    "BaseAgent",
    "AgentOutput",
    "ProductManagerAgent",
    "ArchitectAgent",
    "PlannerAgent",
    "BackendDevAgent",
    "FrontendDevAgent",
    "QAEngineerAgent",
    "SecurityAnalystAgent",
    "CodeReviewerAgent",
    "DocumentationAgent",
    "DevOpsAgent",
    "ALL_AGENTS",
]
