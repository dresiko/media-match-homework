.PHONY: help dev build up down clean seed logs

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

dev: ## Start development environment
	docker-compose up --build

build: ## Build Docker images
	docker-compose build

up: ## Start containers in detached mode
	docker-compose up -d

down: ## Stop and remove containers
	docker-compose down

clean: ## Stop containers and remove volumes
	docker-compose down -v
	rm -rf api/node_modules frontend/node_modules

seed: ## Seed the database with sample articles
	docker-compose exec api npm run seed

logs: ## Show logs from all containers
	docker-compose logs -f

logs-api: ## Show API logs
	docker-compose logs -f api

logs-frontend: ## Show frontend logs
	docker-compose logs -f frontend

shell-api: ## Open shell in API container
	docker-compose exec api sh

shell-frontend: ## Open shell in frontend container
	docker-compose exec frontend sh

