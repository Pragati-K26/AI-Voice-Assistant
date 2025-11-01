.PHONY: help setup-backend setup-frontend init-db run-backend run-frontend run docker-build docker-up docker-down clean test

help:
	@echo "Available commands:"
	@echo "  make setup-backend    - Setup Python backend environment"
	@echo "  make setup-frontend   - Setup Node.js frontend environment"
	@echo "  make init-db          - Initialize database with sample data"
	@echo "  make run-backend      - Run backend server"
	@echo "  make run-frontend     - Run frontend server"
	@echo "  make docker-build     - Build Docker images"
	@echo "  make docker-up        - Start services with Docker Compose"
	@echo "  make docker-down      - Stop Docker services"
	@echo "  make clean            - Clean generated files"

setup-backend:
	cd backend && python -m venv venv && \
	. venv/bin/activate && pip install -r requirements.txt

setup-frontend:
	cd frontend && npm install

init-db:
	cd backend && python scripts/init_db.py

run-backend:
	cd backend && python -m app.main

run-frontend:
	cd frontend && npm run dev

docker-build:
	docker-compose build

docker-up:
	docker-compose up

docker-down:
	docker-compose down

clean:
	find . -type d -name "__pycache__" -exec rm -r {} + 2>/dev/null || true
	find . -type f -name "*.pyc" -delete
	find . -type f -name "*.pyo" -delete
	rm -rf backend/.pytest_cache
	rm -rf frontend/.next
	rm -rf frontend/node_modules
	rm -f backend/*.db

test:
	cd backend && python -m pytest tests/ -v

