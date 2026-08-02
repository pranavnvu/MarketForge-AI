import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_health_check(async_client: AsyncClient):
    response = await async_client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["app_name"] == "DevForge AI"


@pytest.mark.asyncio
async def test_register_and_login(async_client: AsyncClient):
    # 1. Register new user
    user_payload = {
        "name": "Test Developer",
        "email": "testdev@example.com",
        "password": "SecurePassword123!",
    }
    reg_response = await async_client.post("/api/v1/auth/register", json=user_payload)
    assert reg_response.status_code == 201
    reg_data = reg_response.json()
    assert "access_token" in reg_data
    assert "refresh_token" in reg_data
    assert reg_data["user"]["email"] == "testdev@example.com"
    assert reg_data["user"]["name"] == "Test Developer"

    # 2. Login with valid credentials
    login_payload = {
        "email": "testdev@example.com",
        "password": "SecurePassword123!",
    }
    login_response = await async_client.post("/api/v1/auth/login", json=login_payload)
    assert login_response.status_code == 200
    login_data = login_response.json()
    assert "access_token" in login_data
    assert "refresh_token" in login_data

    # 3. Access /auth/me with Bearer token
    access_token = login_data["access_token"]
    headers = {"Authorization": f"Bearer {access_token}"}
    me_response = await async_client.get("/api/v1/auth/me", headers=headers)
    assert me_response.status_code == 200
    me_data = me_response.json()
    assert me_data["email"] == "testdev@example.com"


@pytest.mark.asyncio
async def test_login_invalid_password(async_client: AsyncClient):
    login_payload = {
        "email": "testdev@example.com",
        "password": "WrongPassword123!",
    }
    response = await async_client.post("/api/v1/auth/login", json=login_payload)
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_duplicate_registration(async_client: AsyncClient):
    user_payload = {
        "name": "Duplicate User",
        "email": "testdev@example.com",
        "password": "AnotherPassword123!",
    }
    response = await async_client.post("/api/v1/auth/register", json=user_payload)
    assert response.status_code == 422
