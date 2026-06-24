PROJECT=sitedonnalupe

.PHONY: help up build down restart logs logs-front bash-front logs-backoffice bash-backoffice logs-backend bash-backend psql logs-db ps

help: ## Mostra este menu de ajuda com os comandos disponíveis
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-16s\033[0m %s\n", $$1, $$2}'

restart: ## Reinicia o projeto
	docker compose -p $(PROJECT) down
	docker compose -p $(PROJECT) --env-file ./backend/.env up -d --build

build: ## Reconstrói as imagens e sobe os contêineres
	docker compose -p $(PROJECT) --env-file ./backend/.env up -d --build

down: ## Derruba todos os contêineres 
	docker compose -p $(PROJECT) down

logs: ## Mostra os logs de TODOS os serviços em tempo real
	docker compose -p $(PROJECT) logs -f

logs-front: ## Mostra os logs apenas do contêiner interface
	docker compose -p $(PROJECT) logs -f front

bash-front: ## Abre o terminal interativo dentro do interface
	docker compose -p $(PROJECT) exec front sh

logs-backoffice: ## Mostra os logs apenas do contêiner backoffice
	docker compose -p $(PROJECT) logs -f backoffice

bash-backoffice: ## Abre o terminal interativo dentro do backoffice
	docker compose -p $(PROJECT) exec backoffice sh

logs-backend: ## Mostra os logs apenas do contêiner backend
	docker compose -p $(PROJECT) logs -f backend

bash-backend: ## Abre o terminal (bash) interativo dentro do backend
	docker compose -p $(PROJECT) exec backend sh

psql: ## Acessa o banco de dados PostgreSQL via CLI usando as variáveis do .env
	docker compose -p $(PROJECT) exec db sh -c 'psql -U $$DB_USER -d $$DB_NAME'

logs-db: ## Mostra os logs apenas do banco de dados
	docker compose -p $(PROJECT) logs -f db

reset: 
	docker compose -p $(PROJECT) down -v

ps: ## Lista o status e as portas de todos os contêineres ativos do projeto
	docker compose -p $(PROJECT) ps