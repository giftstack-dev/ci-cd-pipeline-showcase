# ========================================================
# Stage 1: Build virtualenv and install dependencies
# ========================================================
FROM python:3.12-slim AS builder

WORKDIR /build

# Install build essentials if needed (none needed for pure wheels, keeps image lean)
RUN apt-get update && \
    apt-get install -y --no-install-recommends curl && \
    rm -rf /var/lib/apt/lists/*

# Create virtualenv
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# ========================================================
# Stage 2: Final runtime container
# ========================================================
FROM python:3.12-slim AS runner

# Create a non-root user and group
RUN groupadd -r appgroup && useradd -r -g appgroup -u 10001 -d /app appuser

WORKDIR /app

# Copy virtualenv from builder
COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH" \
    PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1

# Build arguments for CI/CD metadata injection
ARG VERSION="0.0.0-dev"
ARG COMMIT_SHA="local"
ARG BUILD_TIME="unknown"
ARG APP_ENV="production"

# Persist build arguments into runtime environment variables
ENV VERSION=${VERSION} \
    COMMIT_SHA=${COMMIT_SHA} \
    BUILD_TIME=${BUILD_TIME} \
    APP_ENV=${APP_ENV} \
    PORT=8000

# Copy application source code
COPY --chown=appuser:appgroup app/ /app/app/

# Switch to non-root user
USER appuser

EXPOSE 8000

# Container healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health').read()" || exit 1

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
