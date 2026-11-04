"""Pydantic schemas and models for requests and responses."""

import re
from typing import Literal, Optional
from pydantic import BaseModel, Field, field_validator

# SemVer regex matching standard Semantic Versioning (e.g. 1.0.0, 1.2.3-beta.1, v1.0.0)
SEMVER_REGEX = re.compile(
    r"^v?(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)"
    r"(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?"
    r"(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$"
)


class HealthResponse(BaseModel):
    """Health check response."""

    status: Literal["ok"] = "ok"


class VersionResponse(BaseModel):
    """Version metadata response containing build and runtime provenance."""

    version: str = Field(description="Semantic version of the application")
    commit_sha: str = Field(description="Git commit SHA of the current build")
    build_time: str = Field(description="Timestamp when the build was generated")
    environment: str = Field(description="Target runtime environment")
    uptime_seconds: float = Field(description="Elapsed seconds since application startup")


class DeploymentCreate(BaseModel):
    """Payload to trigger and record a new deployment."""

    version: str = Field(..., description="Semantic version to deploy (e.g., 1.2.3)")
    environment: Literal["staging", "production"] = Field(
        ..., description="Deployment target environment: staging or production"
    )

    @field_validator("version")
    @classmethod
    def validate_semver(cls, value: str) -> str:
        """Validate that the version string strictly adheres to Semantic Versioning."""
        cleaned = value.strip()
        if not SEMVER_REGEX.match(cleaned):
            raise ValueError(
                f"Version '{value}' is not valid semantic versioning (expected format: X.Y.Z, e.g. 1.2.0)"
            )
        return cleaned


class DeploymentRecord(BaseModel):
    """Record representing a past or current deployment."""

    id: str = Field(..., description="Unique deployment identifier")
    version: str = Field(..., description="Deployed semantic version")
    environment: Literal["staging", "production"] = Field(
        ..., description="Target environment"
    )
    status: Literal["success", "failed", "in_progress", "pending"] = Field(
        ..., description="Deployment status"
    )
    deployed_at: str = Field(..., description="ISO 8601 deployment timestamp")
    duration_seconds: int = Field(..., description="Duration of deployment pipeline execution in seconds")
