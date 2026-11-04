"""API routes for health, version provenance, and deployments."""

import time
import uuid
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status

from app.config import Settings, get_settings
from app.models import (
    DeploymentCreate,
    DeploymentRecord,
    HealthResponse,
    VersionResponse,
)

router = APIRouter()

# Server startup time recorded at module import
_START_TIME = time.time()

# Initial in-memory sample deployments
def _generate_initial_deployments() -> List[DeploymentRecord]:
    return [
        DeploymentRecord(
            id="dep-005",
            version="1.0.0",
            environment="production",
            status="success",
            deployed_at="2026-11-04T08:30:00Z",
            duration_seconds=78,
        ),
        DeploymentRecord(
            id="dep-004",
            version="1.0.0-rc.2",
            environment="staging",
            status="success",
            deployed_at="2026-11-04T07:15:00Z",
            duration_seconds=64,
        ),
        DeploymentRecord(
            id="dep-003",
            version="0.9.4",
            environment="production",
            status="success",
            deployed_at="2026-11-02T14:22:00Z",
            duration_seconds=82,
        ),
        DeploymentRecord(
            id="dep-002",
            version="0.9.4-rc.1",
            environment="staging",
            status="failed",
            deployed_at="2026-11-02T13:40:00Z",
            duration_seconds=45,
        ),
        DeploymentRecord(
            id="dep-001",
            version="0.9.3",
            environment="production",
            status="success",
            deployed_at="2026-10-28T10:00:00Z",
            duration_seconds=71,
        ),
    ]


# Mutable in-memory store
_deployments_store: List[DeploymentRecord] = _generate_initial_deployments()


def reset_deployments_store() -> None:
    """Reset the in-memory deployments store to initial state (useful for test isolation)."""
    global _deployments_store
    _deployments_store = _generate_initial_deployments()


@router.get("/health", response_model=HealthResponse, tags=["Monitoring"])
def get_health() -> HealthResponse:
    """Health check endpoint used by Docker HEALTHCHECK and deployment hooks."""
    return HealthResponse(status="ok")


@router.get("/version", response_model=VersionResponse, tags=["Metadata"])
def get_version(settings: Settings = Depends(get_settings)) -> VersionResponse:
    """Returns application release version, commit SHA, build timestamp, and uptime."""
    uptime = max(0.0, round(time.time() - _START_TIME, 2))
    return VersionResponse(
        version=settings.version,
        commit_sha=settings.commit_sha,
        build_time=settings.build_time,
        environment=settings.app_env,
        uptime_seconds=uptime,
    )


@router.get("/deployments", response_model=List[DeploymentRecord], tags=["Deployments"])
def list_deployments(
    status: Optional[str] = Query(
        None,
        description="Filter deployments by status: success, failed, in_progress, pending",
    ),
) -> List[DeploymentRecord]:
    """Retrieve sample deployments, optionally filtered by status."""
    if status is None:
        return _deployments_store

    normalized_status = status.strip().lower()
    return [d for d in _deployments_store if d.status.lower() == normalized_status]


@router.post(
    "/deployments",
    response_model=DeploymentRecord,
    status_code=status.HTTP_201_CREATED,
    tags=["Deployments"],
)
def create_deployment(payload: DeploymentCreate) -> DeploymentRecord:
    """Record a new deployment with validated semantic version and environment."""
    new_record = DeploymentRecord(
        id=f"dep-{uuid.uuid4().hex[:6]}",
        version=payload.version,
        environment=payload.environment,
        status="success",
        deployed_at=datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        duration_seconds=52,
    )
    # Prepend to display latest first
    _deployments_store.insert(0, new_record)
    return new_record
