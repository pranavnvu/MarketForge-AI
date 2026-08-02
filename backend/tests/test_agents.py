import pytest
from app.agents.orchestrator import LangGraphOrchestrator


@pytest.mark.asyncio
async def test_agent_orchestrator_pipeline():
    orchestrator = LangGraphOrchestrator()
    assert len(orchestrator.agents) == 10

    project_id = "test-proj-123"
    project_name = "Automated Test App"
    description = "Test multi-agent workflow"
    config = {"techStack": "fullstack", "language": "typescript"}

    progress_events = []

    async def callback(project_id, agent_key, progress, logs, artifacts):
        progress_events.append((agent_key, progress))

    final_state = await orchestrator.run_pipeline(
        project_id=project_id,
        project_name=project_name,
        description=description,
        config=config,
        on_progress_callback=callback,
    )

    assert final_state["status"] == "completed"
    assert final_state["progress"] == 100
    assert len(final_state["artifacts"]) == 10
    assert len(progress_events) == 11  # 10 agents + 1 completed event
