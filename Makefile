PROJECT=donnalupe

up:
	docker compose -p $(PROJECT) up -d

build:
	docker compose -p $(PROJECT) up -d --build

down:
	docker compose -p $(PROJECT) down

restart: build down up

logs:
	docker compose -p $(PROJECT) logs -f

logs-front:
	docker compose -p $(PROJECT) logs -f front

logs-backoffice:
	docker compose -p $(PROJECT) logs -f backoffice

bash-front:
	docker compose -p $(PROJECT) exec front sh

bash-backoffice:
	docker compose -p $(PROJECT) exec backoffice sh