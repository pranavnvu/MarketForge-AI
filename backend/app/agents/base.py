import abc
import time
from typing import Dict, Any, List, Optional
import structlog
from pydantic import BaseModel

logger = structlog.get_logger(__name__)


class AgentOutput(BaseModel):
    agent_type: str
    agent_name: str
    status: str = "completed"  # completed, failed, warning, retrying
    summary: str
    artifacts: Dict[str, Any] = {}
    files_created: List[Dict[str, Any]] = []
    logs: List[str] = []
    execution_time_seconds: float = 0.0
    retry_count: int = 0
    error: Optional[str] = None
    task_updates: List[Dict[str, Any]] = []


class BaseAgent(abc.ABC):
    def __init__(self, name: str, agent_type: str, icon: str, color: str):
        self.name = name
        self.agent_type = agent_type
        self.icon = icon
        self.color = color

    @abc.abstractmethod
    async def execute(self, state: Dict[str, Any]) -> AgentOutput:
        """Execute agent task based on current graph state."""
        pass

    def log(self, message: str, level: str = "info") -> str:
        formatted = f"[{self.name}] {message}"
        if level == "error":
            logger.error(formatted)
        elif level == "warning":
            logger.warning(formatted)
        else:
            logger.info(formatted)
        return formatted

