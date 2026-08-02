# ===========================================================
# DevForge AI — Makefile
# ===========================================================
# Common commands for development, testing, and deployment
# ===========================================================

.PHONY: help dev dev-services stop build test lint migrate seed clean logs

# Colors
CYAN := \033[36m
GREEN := \033[32m
YELLOW := \033[33m
RED := \033[31m
RESET := \033[0m

help: ## Show this help message
	@echo ""
	@echo "$(CYAN)DevForge AI$(RESET) — Development Commands"
	@echo "============================================"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(GREEN)%-20s$(RESET) %s\n", $$1, $$2}'
	@echo ""

# ============================================
# DEVELOPMENT
# ============================================

dev: ## Start all services (Docker Compose)
	docker-compose up -d
	@echo "$(GREEN)✓ All services started$(RESET)"
	@echo "  Frontend:  http://localhost:3000"
	@echo "  Backend:   http://localhost:8000/docs"
	@echo "  Flower:    http://localhost:5555"
	@echo "  Grafana:   http://localhost:3001"
	@echo "  Prometheus: http://localhost:9090"

dev-services: ## Start only infrastructure services (DB, Redis, Qdrant)
	docker-compose up -d postgres redis qdrant
	@echo "$(GREEN)✓ Infrastructure services started$(RESET)"
	@echo "  PostgreSQL: localhost:5432"
	@echo "  Redis:      localhost:6379"
	@echo "  Qdrant:     localhost:6333"

dev-backend: ## Start backend locally (requires dev-services)
	cd backend && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

dev-frontend: ## Start frontend locally (requires dev-services + backend)
	cd frontend && npm run dev

dev-worker: ## Start Celery worker locally
	cd backend && celery -A app.worker worker -Q default,agent_queue --loglevel=info

stop: ## Stop all Docker services
	docker-compose down
	@echo "$(YELLOW)✓ All services stopped$(RESET)"

restart: ## Restart all services
	docker-compose restart
	@echo "$(GREEN)✓ All services restarted$(RESET)"

# ============================================
# BUILD
# ============================================

build: ## Build all Docker images
	docker-compose build
	@echo "$(GREEN)✓ All images built$(RESET)"

build-backend: ## Build backend Docker image
	docker-compose build backend
	@echo "$(GREEN)✓ Backend image built$(RESET)"

build-frontend: ## Build frontend Docker image
	docker-compose build frontend
	@echo "$(GREEN)✓ Frontend image built$(RESET)"

# ============================================
# DATABASE
# ============================================

migrate: ## Run database migrations
	cd backend && alembic upgrade head
	@echo "$(GREEN)✓ Migrations applied$(RESET)"

migrate-create: ## Create a new migration (usage: make migrate-create MSG="description")
	cd backend && alembic revision --autogenerate -m "$(MSG)"
	@echo "$(GREEN)✓ Migration created$(RESET)"

migrate-downgrade: ## Downgrade database by one revision
	cd backend && alembic downgrade -1
	@echo "$(YELLOW)✓ Downgraded by one revision$(RESET)"

migrate-history: ## Show migration history
	cd backend && alembic history

seed: ## Seed database with demo data
	cd backend && python -m app.utils.seed
	@echo "$(GREEN)✓ Database seeded$(RESET)"

db-reset: ## Reset database (drop + recreate + migrate)
	docker-compose exec postgres psql -U devforge -c "DROP DATABASE IF EXISTS devforge;"
	docker-compose exec postgres psql -U devforge -c "CREATE DATABASE devforge;"
	cd backend && alembic upgrade head
	@echo "$(GREEN)✓ Database reset$(RESET)"

# ============================================
# TESTING
# ============================================

test: ## Run all tests
	@echo "$(CYAN)Running backend tests...$(RESET)"
	cd backend && pytest --cov=app tests/ -v
	@echo "$(CYAN)Running frontend tests...$(RESET)"
	cd frontend && npm run test
	@echo "$(GREEN)✓ All tests passed$(RESET)"

test-backend: ## Run backend tests only
	cd backend && pytest --cov=app tests/ -v

test-frontend: ## Run frontend tests only
	cd frontend && npm run test

# ============================================
# LINTING
# ============================================

lint: ## Run linters on both backend and frontend
	@echo "$(CYAN)Linting backend...$(RESET)"
	cd backend && ruff check .
	@echo "$(CYAN)Linting frontend...$(RESET)"
	cd frontend && npm run lint
	@echo "$(GREEN)✓ Linting passed$(RESET)"

lint-fix: ## Fix linting issues
	cd backend && ruff check --fix .
	cd frontend && npm run lint -- --fix

format: ## Format code
	cd backend && ruff format .
	@echo "$(GREEN)✓ Code formatted$(RESET)"

# ============================================
# LOGS & MONITORING
# ============================================

logs: ## Show logs for all services
	docker-compose logs -f

logs-backend: ## Show backend logs
	docker-compose logs -f backend

logs-frontend: ## Show frontend logs
	docker-compose logs -f frontend

logs-worker: ## Show Celery worker logs
	docker-compose logs -f celery_worker

# ============================================
# UTILITIES
# ============================================

setup: ## Initial project setup
	@echo "$(CYAN)Setting up DevForge AI...$(RESET)"
	cp -n .env.example .env || true
	docker-compose build
	docker-compose up -d postgres redis qdrant
	sleep 5
	cd backend && pip install -r requirements.txt
	cd backend && alembic upgrade head
	cd frontend && npm install
	@echo "$(GREEN)✓ Setup complete!$(RESET)"
	@echo ""
	@echo "Next steps:"
	@echo "  1. Edit .env with your API keys"
	@echo "  2. Run 'make dev' to start all services"

clean: ## Remove all containers, volumes, and cached files
	docker-compose down -v --remove-orphans
	find . -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name .pytest_cache -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name node_modules -exec rm -rf {} + 2>/dev/null || true
	@echo "$(RED)✓ Cleaned up$(RESET)"

status: ## Show status of all services
	docker-compose ps

shell-backend: ## Open Python shell in backend container
	docker-compose exec backend python

shell-db: ## Open PostgreSQL shell
	docker-compose exec postgres psql -U devforge -d devforge

shell-redis: ## Open Redis CLI
	docker-compose exec redis redis-cli
