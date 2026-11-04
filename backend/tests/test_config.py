"""Tests for configuration parsing, defaults, and CORS origin splitting."""

import os
from unittest import mock
from app.config import Settings, get_settings


def test_settings_defaults():
    """Verify default values when no environment variables are set."""
    settings = Settings()
    assert settings.app_name == "CI/CD Pipeline Showcase Backend"
    assert settings.version == "0.0.0-dev"
    assert settings.commit_sha == "local"
    assert settings.build_time == "unknown"
    assert settings.app_env == "development"
    assert settings.cors_origins == ["http://localhost:5173"]


def test_cors_origins_multiple_parsing():
    """Verify multiple comma-separated CORS origins are correctly split and stripped."""
    settings = Settings(
        allowed_origins="http://localhost:5173, https://app.example.com , https://staging.example.com "
    )
    expected = [
        "http://localhost:5173",
        "https://app.example.com",
        "https://staging.example.com",
    ]
    assert settings.cors_origins == expected


def test_cors_origins_empty_fallback():
    """Verify empty allowed_origins string returns default localhost fallback."""
    settings = Settings(allowed_origins="")
    assert settings.cors_origins == ["http://localhost:5173"]


def test_get_settings_reads_environment_variables():
    """Verify get_settings reads active environment variables."""
    test_env = {
        "VERSION": "3.2.1",
        "COMMIT_SHA": "fedcba987654",
        "BUILD_TIME": "2026-11-04T18:00:00Z",
        "APP_ENV": "staging",
        "ALLOWED_ORIGINS": "https://staging.internal",
    }
    with mock.patch.dict(os.environ, test_env, clear=False):
        # Clear the lru_cache for get_settings
        get_settings.cache_clear()
        settings = get_settings()
        assert settings.version == "3.2.1"
        assert settings.commit_sha == "fedcba987654"
        assert settings.build_time == "2026-11-04T18:00:00Z"
        assert settings.app_env == "staging"
        assert settings.cors_origins == ["https://staging.internal"]
        get_settings.cache_clear()
