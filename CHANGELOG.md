# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-11-04

### Added
- **FastAPI Backend Service**:
  - `/health` endpoint for Docker and deployment probers.
  - `/version` endpoint exposing injected build provenance (`version`, `commit_sha`, `build_time`, `environment`, and `uptime_seconds`).
  - `/deployments` listing with status filter query parameter.
  - `POST /deployments` with strict Pydantic validation (SemVer check and environment constraints).
  - CORS middleware support with configurable origins.
  - Multi-stage Dockerfile using `python:3.12-slim`, non-root user, and builtin healthcheck.
  - 100% test coverage with pytest across Python 3.11 and 3.12.
- **React Frontend Dashboard**:
  - "Pipeline Dashboard" built with React 19, TypeScript, Vite, and Tailwind CSS.
  - Live backend health monitoring and version provenance polling every 15 seconds.
  - Automatic demo mode fallback when backend is disconnected.
  - Interactive deployment audit table with status filtering and inline validation modal.
  - Visual horizontal 7-stage CI/CD pipeline stepper.
  - Vitest + React Testing Library suite with 100% pass rate.
  - Unprivileged multi-stage Nginx Dockerfile with SPA routing support.
- **GitHub Actions Workflows**:
  - `ci.yml`: Ruff linting/formatting, pytest matrix (3.11 & 3.12) with 85% coverage gate, frontend build/test/lint, actionlint, and unified `ci-success` gate.
  - `security.yml`: CodeQL SAST, PR dependency review, Gitleaks secret scan, pip-audit, and npm audit.
  - `build-and-deploy.yml`: Docker Buildx with GitHub Actions layer caching, Trivy security scan, GHCR container publication, automated GitHub Pages deployment, and staging deployment verification.
  - `release.yml`: Tag-to-VERSION consistency verification, production image publication (`latest` + SemVer tags), GitHub release generation with attached assets, and protected production environment promotion.
  - `rollback.yml`: Manual workflow dispatch for rapid zero-downtime rollback to any prior container tag.
  - `dependabot.yml`: Automated weekly dependency audits across pip, npm, actions, and Docker ecosystems.
- **Developer Experience**:
  - `docker-compose.yml` for unified local container execution.
  - Standardized `Makefile` providing `install`, `lint`, `test`, `build`, `run`, `docker-up`, `docker-down`, and `clean`.
  - Comprehensive documentation in `docs/PIPELINE.md` and `docs/SETUP.md`.
