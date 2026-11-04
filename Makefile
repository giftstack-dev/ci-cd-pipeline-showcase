.PHONY: help install lint test build run docker-up docker-down clean

help:
	@echo "Available Makefile commands for CI/CD Pipeline Showcase:"
	@echo "  make install      - Install dependencies for backend and frontend"
	@echo "  make lint         - Run linters (ruff for backend, eslint for frontend)"
	@echo "  make test         - Run test suites (pytest with coverage and vitest)"
	@echo "  make build        - Compile frontend and verify backend package"
	@echo "  make run          - Run both backend and frontend locally in background"
	@echo "  make docker-up    - Build and launch all services via docker-compose"
	@echo "  make docker-down  - Stop and remove docker-compose containers"
	@echo "  make clean        - Clean cache files, dist folders, and coverage logs"

install:
	@echo "--> Installing backend dependencies..."
	cd backend && pip install -r requirements-dev.txt
	@echo "--> Installing frontend dependencies..."
	cd frontend && npm install

lint:
	@echo "--> Linting backend with Ruff..."
	ruff check backend
	ruff format --check backend
	@echo "--> Linting frontend with ESLint..."
	cd frontend && npm run lint

test:
	@echo "--> Running backend test suite with 85% coverage gate..."
	cd backend && pytest --cov=app --cov-report=term-missing --cov-fail-under=85 tests/
	@echo "--> Running frontend test suite with Vitest..."
	cd frontend && npm run test

build:
	@echo "--> Building frontend distribution..."
	cd frontend && npm run build
	@echo "--> Building backend Docker image..."
	docker build -t giftstack-dev/ci-cd-pipeline-showcase-backend:local ./backend

run:
	@echo "--> Starting backend on port 8000 and frontend on port 5173..."
	@echo "In terminal 1: cd backend && uvicorn app.main:app --reload --port 8000"
	@echo "In terminal 2: cd frontend && npm run dev"

docker-up:
	@echo "--> Starting stack with docker-compose..."
	docker compose up --build -d
	@echo "Frontend available at http://localhost:8080"
	@echo "Backend API available at http://localhost:8000"

docker-down:
	@echo "--> Stopping docker-compose stack..."
	docker compose down

clean:
	@echo "--> Cleaning build artifacts, coverage files, and caches..."
	rm -rf dist frontend/dist coverage frontend/coverage backend/coverage.xml backend/.coverage
	rm -rf .pytest_cache backend/.pytest_cache
	find . -type d -name "__pycache__" -exec rm -rf {} +
	find . -type f -name "*.pyc" -delete
