import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_projects_flow(async_client: AsyncClient):
    # 1. Register & login
    reg = await async_client.post(
        "/api/v1/auth/register",
        json={"name": "Project Dev", "email": "projdev@example.com", "password": "Password123!"},
    )
    token = reg.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Get workspaces (should have 1 default workspace)
    ws_resp = await async_client.get("/api/v1/workspaces", headers=headers)
    assert ws_resp.status_code == 200
    workspaces = ws_resp.json()
    assert len(workspaces) == 1
    default_ws_id = workspaces[0]["id"]

    # 3. Create project
    proj_payload = {
        "name": "AI Expense Tracker",
        "description": "Smart expense tracking with receipt scanning",
        "workspace_id": default_ws_id,
        "config": {
            "techStack": "fullstack",
            "language": "typescript",
            "deployTarget": "docker",
        },
    }
    create_resp = await async_client.post("/api/v1/projects", json=proj_payload, headers=headers)
    assert create_resp.status_code == 201
    proj_data = create_resp.json()
    assert proj_data["name"] == "AI Expense Tracker"
    assert proj_data["status"] == "planning"
    project_id = proj_data["id"]

    # 4. List projects
    list_resp = await async_client.get("/api/v1/projects", headers=headers)
    assert list_resp.status_code == 200
    projects = list_resp.json()
    assert len(projects) == 1

    # 5. Get project detail
    detail_resp = await async_client.get(f"/api/v1/projects/{project_id}", headers=headers)
    assert detail_resp.status_code == 200
    assert detail_resp.json()["id"] == project_id

    # 6. Update project progress
    update_resp = await async_client.put(
        f"/api/v1/projects/{project_id}",
        json={"progress": 50, "status": "in_progress"},
        headers=headers,
    )
    assert update_resp.status_code == 200
    assert update_resp.json()["progress"] == 50
    assert update_resp.json()["status"] == "in_progress"
