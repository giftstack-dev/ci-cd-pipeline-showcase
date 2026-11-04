"""Unit and integration tests for FastAPI endpoints."""

import pytest
from fastapi.testclient import TestClient

from app.config import Settings, get_settings
from app.main import app
from app.routes import reset_deployments_store


@pytest.fixture(autouse=True)
def setup_and_teardown():
    """Reset the in-memory deployments before and after each test."""
    reset_deployments_store()
    yield
    reset_deployments_store()


@pytest.fixture
def client() -> TestClient:
    """Create a FastAPI TestClient instance."""
    return TestClient(app)


def test_health_check_returns_ok(client: TestClient):
    """Test GET /health returns status ok."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data == {"status": "ok"}


def test_version_default_values(client: TestClient):
    """Test GET /version returns valid default provenance metadata."""
    response = client.get("/version")
    assert response.status_code == 200
    data = response.json()
    assert "version" in data
    assert "commit_sha" in data
    assert "build_time" in data
    assert "environment" in data
    assert "uptime_seconds" in data
    assert isinstance(data["uptime_seconds"], (int, float))
    assert data["uptime_seconds"] >= 0


def test_version_env_overrides(client: TestClient):
    """Test GET /version reflects custom settings injected via dependency override."""
    custom_settings = Settings(
        version="2.4.1",
        commit_sha="a1b2c3d4e5f6",
        build_time="2026-11-04T12:00:00Z",
        app_env="production",
        allowed_origins="https://production.app",
    )
    app.dependency_overrides[get_settings] = lambda: custom_settings

    try:
        response = client.get("/version")
        assert response.status_code == 200
        data = response.json()
        assert data["version"] == "2.4.1"
        assert data["commit_sha"] == "a1b2c3d4e5f6"
        assert data["build_time"] == "2026-11-04T12:00:00Z"
        assert data["environment"] == "production"
    finally:
        app.dependency_overrides.clear()


def test_list_deployments_returns_records(client: TestClient):
    """Test GET /deployments returns the initial list of 5 sample records."""
    response = client.get("/deployments")
    assert response.status_code == 200
    records = response.json()
    assert len(records) >= 5
    first = records[0]
    assert "id" in first
    assert "version" in first
    assert "environment" in first
    assert "status" in first
    assert "deployed_at" in first
    assert "duration_seconds" in first


def test_list_deployments_filtered_by_status_success(client: TestClient):
    """Test GET /deployments?status=success filters out non-successful runs."""
    response = client.get("/deployments?status=success")
    assert response.status_code == 200
    records = response.json()
    assert len(records) > 0
    for record in records:
        assert record["status"] == "success"


def test_list_deployments_filtered_by_status_failed(client: TestClient):
    """Test GET /deployments?status=failed returns only failed deployments."""
    response = client.get("/deployments?status=failed")
    assert response.status_code == 200
    records = response.json()
    assert len(records) >= 1
    for record in records:
        assert record["status"] == "failed"


def test_list_deployments_filtered_no_matches(client: TestClient):
    """Test GET /deployments?status=nonexistent returns an empty list."""
    response = client.get("/deployments?status=pending")
    assert response.status_code == 200
    records = response.json()
    assert records == []


def test_create_deployment_success_staging(client: TestClient):
    """Test POST /deployments successfully creates a staging record with 201 status."""
    payload = {"version": "1.2.3", "environment": "staging"}
    response = client.post("/deployments", json=payload)
    assert response.status_code == 201
    created = response.json()
    assert created["version"] == "1.2.3"
    assert created["environment"] == "staging"
    assert created["status"] == "success"
    assert "id" in created
    assert "deployed_at" in created

    # Verify it appears in the listed deployments
    list_resp = client.get("/deployments")
    assert any(d["id"] == created["id"] for d in list_resp.json())


def test_create_deployment_success_production(client: TestClient):
    """Test POST /deployments successfully creates a production record."""
    payload = {"version": "2.0.0-rc.1", "environment": "production"}
    response = client.post("/deployments", json=payload)
    assert response.status_code == 201
    created = response.json()
    assert created["version"] == "2.0.0-rc.1"
    assert created["environment"] == "production"


def test_create_deployment_invalid_environment_returns_422(client: TestClient):
    """Test POST /deployments with unsupported environment returns 422 Unprocessable Entity."""
    payload = {"version": "1.0.0", "environment": "development"}
    response = client.post("/deployments", json=payload)
    assert response.status_code == 422


def test_create_deployment_invalid_version_semver_returns_422(client: TestClient):
    """Test POST /deployments with non-semver version string returns 422 Unprocessable Entity."""
    payload = {"version": "latest-build", "environment": "staging"}
    response = client.post("/deployments", json=payload)
    assert response.status_code == 422
    data = response.json()
    assert "detail" in data


def test_create_deployment_missing_field_returns_422(client: TestClient):
    """Test POST /deployments with missing environment field returns 422."""
    payload = {"version": "1.0.0"}
    response = client.post("/deployments", json=payload)
    assert response.status_code == 422


def test_create_deployment_empty_payload_returns_422(client: TestClient):
    """Test POST /deployments with empty payload returns 422."""
    response = client.post("/deployments", json={})
    assert response.status_code == 422
