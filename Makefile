.DEFAULT_GOAL := help

.PHONY: help setup up down restart logs ps backend frontend test lint format db-shell fresh

help:
	@echo "make setup     - Create env files, build images, and install dependencies"
	@echo "make up        - Start all containers"
	@echo "make down      - Stop all containers"
	@echo "make restart   - Restart all containers"
	@echo "make logs      - Follow container logs"
	@echo "make ps        - Show container status"
	@echo "make backend   - Open a shell in the Laravel container"
	@echo "make frontend  - Open a shell in the Next.js container"
	@echo "make test      - Run Laravel tests"
	@echo "make lint      - Run PHP and frontend linters"
	@echo "make format    - Format PHP code"
	@echo "make db-shell  - Open the MySQL client"
	@echo "make fresh     - Recreate the database (deletes development data)"

setup:
	@test -f .env || cp .env.example .env
	@test -f backend/.env || cp backend/.env.example backend/.env
	@test -f frontend/.env.local || cp frontend/.env.example frontend/.env.local
	docker compose build
	docker compose run --rm backend composer install
	docker compose run --rm backend php artisan key:generate
	docker compose run --rm frontend npm install
	docker compose up -d
	@echo "Setup complete: frontend=http://localhost:3000 backend=http://localhost:8081/up"

up:
	docker compose up -d

down:
	docker compose down

restart:
	docker compose restart

logs:
	docker compose logs -f

ps:
	docker compose ps

backend:
	docker compose exec backend bash

frontend:
	docker compose exec frontend sh

test:
	docker compose exec backend php artisan test

lint:
	docker compose exec backend ./vendor/bin/pint --test
	docker compose exec frontend npm run lint

format:
	docker compose exec backend ./vendor/bin/pint

db-shell:
	docker compose exec mysql sh -c 'mysql -u"$$MYSQL_USER" -p"$$MYSQL_PASSWORD" "$$MYSQL_DATABASE"'

fresh:
	docker compose exec backend php artisan migrate:fresh --seed
