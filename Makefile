# DjangoCRM Project Makefile
# Unified commands for development, testing, and deployment

.PHONY: help setup setup-backend setup-frontend setup-docker dev dev-backend dev-frontend dev-stop test test-backend test-frontend build build-backend build-frontend clean clean-backend clean-frontend docker-up docker-down docker-logs

# Default target
help:
	@echo "DjangoCRM Project Commands"
	@echo ""
	@echo "Setup Commands:"
	@echo "  make setup              - Setup both backend and frontend"
	@echo "  make setup-backend      - Setup only backend"
	@echo "  make setup-frontend     - Setup only frontend"
	@echo "  make setup-docker       - Setup Docker environment"
	@echo ""
	@echo "Development Commands:"
	@echo "  make dev                - Start both backend and frontend in development"
	@echo "  make dev-backend        - Start backend development server"
	@echo "  make dev-frontend       - Start frontend development server"
	@echo "  make dev-stop           - Stop all development servers"
	@echo ""
	@echo "Testing Commands:"
	@echo "  make test               - Run all tests"
	@echo "  make test-backend       - Run backend tests"
	@echo "  make test-frontend      - Run frontend tests"
	@echo ""
	@echo "Build Commands:"
	@echo "  make build              - Build both backend and frontend"
	@echo "  make build-backend      - Build backend"
	@echo "  make build-frontend     - Build frontend"
	@echo ""
	@echo "Docker Commands:"
	@echo "  make docker-up          - Start Docker services"
	@echo "  make docker-down        - Stop Docker services"
	@echo "  make docker-logs        - Show Docker logs"
	@echo ""
	@echo "Cleanup Commands:"
	@echo "  make clean              - Clean all build artifacts"
	@echo "  make clean-backend      - Clean backend artifacts"
	@echo "  make clean-frontend     - Clean frontend artifacts"

# Setup commands
setup:
	@echo "Setting up DjangoCRM (backend + frontend)..."
	@./setup.sh

setup-backend:
	@echo "Setting up backend..."
	@./setup.sh --backend-only

setup-frontend:
	@echo "Setting up frontend..."
	@./setup.sh --frontend-only

setup-docker:
	@echo "Setting up Docker environment..."
	@./setup.sh --docker

# Development commands
dev:
	@echo "Starting development environment..."
	@echo "Backend will be available at: http://localhost:8000"
	@echo "Frontend will be available at: http://localhost:3000"
	@echo ""
	@echo "Starting Redis..."
	@redis-server --daemonize yes 2>/dev/null || echo "Redis already running or not installed"
	@echo "Starting backend..."
	@cd backend && python manage.py runserver &
	@echo "Starting frontend..."
	@cd frontend && npm run dev &
	@echo ""
	@echo "Development servers started. Press Ctrl+C to stop."

dev-backend:
	@echo "Starting backend development server..."
	@cd backend && python manage.py runserver

dev-frontend:
	@echo "Starting frontend development server..."
	@cd frontend && npm run dev

dev-stop:
	@echo "Stopping development servers..."
	@pkill -f "manage.py runserver" 2>/dev/null || echo "Backend not running"
	@pkill -f "next" 2>/dev/null || echo "Frontend not running"
	@pkill -f "redis-server" 2>/dev/null || echo "Redis not running"
	@echo "Development servers stopped."

# Testing commands
test:
	@echo "Running all tests..."
	@echo "Backend tests:" && make test-backend
	@echo "Frontend tests:" && make test-frontend

test-backend:
	@echo "Running backend tests..."
	@cd backend && python manage.py test

test-frontend:
	@echo "Running frontend tests..."
	@cd frontend && npm test 2>/dev/null || echo "No test script configured for frontend"

# Build commands
build:
	@echo "Building both backend and frontend..."
	@make build-backend
	@make build-frontend

build-backend:
	@echo "Building backend..."
	@cd backend && python manage.py collectstatic --noinput

build-frontend:
	@echo "Building frontend..."
	@cd frontend && npm run build

# Docker commands
docker-up:
	@echo "Starting Docker services..."
	@docker-compose up -d
	@echo "Services started:"
	@echo "  - PostgreSQL: localhost:5432"
	@echo "  - Backend: http://localhost:8000"
	@echo "  - Frontend: http://localhost:3000"

docker-down:
	@echo "Stopping Docker services..."
	@docker-compose down

docker-logs:
	@echo "Showing Docker logs..."
	@docker-compose logs -f

# Cleanup commands
clean:
	@echo "Cleaning all build artifacts..."
	@make clean-backend
	@make clean-frontend
	@echo "Removing Python cache files..."
	@find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	@find . -name "*.pyc" -delete 2>/dev/null || true

clean-backend:
	@echo "Cleaning backend artifacts..."
	@cd backend && rm -rf staticfiles/ media/ *.log
	@cd backend && find . -name "*.pyc" -delete
	@cd backend && find . -name "__pycache__" -type d -exec rm -rf {} + 2>/dev/null || true

clean-frontend:
	@echo "Cleaning frontend artifacts..."
	@cd frontend && rm -rf .next/ out/ node_modules/.cache
	@cd frontend && npm cache clean --force 2>/dev/null || true

# Utility commands
install:
	@echo "Installing all dependencies..."
	@pip install -r backend/requirements.txt
	@cd frontend && npm install

migrate:
	@echo "Running database migrations..."
	@cd backend && python manage.py migrate

createsuperuser:
	@echo "Creating Django superuser..."
	@cd backend && python manage.py createsuperuser

shell:
	@echo "Opening Django shell..."
	@cd backend && python manage.py shell

dbshell:
	@echo "Opening database shell..."
	@cd backend && python manage.py dbshell

# CI/CD commands
ci-setup:
	@echo "Setting up for CI environment..."
	@make setup-backend
	@make setup-frontend

ci-test:
	@echo "Running CI tests..."
	@make test-backend
	@make test-frontend

ci-build:
	@echo "Running CI build..."
	@make build-backend
	@make build-frontend