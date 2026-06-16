# Visão Geral — DonnaLupe

Sistema web para uma loja de cookies artesanais (ICMC-USP, São Carlos - SP), composto por três aplicações independentes orquestradas via Docker Compose.

---

## Escopo Macro

| Camada | Tecnologia | Porta | Propósito |
|--------|-----------|-------|-----------|
| `front/` | React 19 + TypeScript + Vite | 5173 | Vitrine pública para clientes |
| `backoffice/` | React 19 + TypeScript + Vite | 5174 | Painel administrativo |
| `backend/` | Go + Gin + GORM | 4000 | API REST + autenticação |
| `db` | PostgreSQL 15 | 5432 | Persistência de dados |

---

## Arquitetura Geral

```
[Cliente]          [Administrador]
    │                    │
[front:5173]      [backoffice:5174]
    │                    │
    └──────── HTTP ──────┘
                 │
           [backend:4000]
          Gin REST API (Go)
                 │
         [PostgreSQL:5432]
```

- Frontend e Backoffice são SPAs independentes (não compartilham código)
- Backend expõe CORS para `localhost:5173` e `localhost:5174`
- Autenticação via JWT (Bearer token), válido por 24h
- Backoffice ainda usa mocks locais em grande parte; integração real parcial

---

## Módulos Principais

- [[Backend_Arquitetura]] — camadas Go: handlers → services → repository → db
- [[Backend_Models]] — `UserBackoffice`, DTOs de request/response
- [[Front_Paginas_e_Rotas]] — rotas públicas e páginas da vitrine
- [[Front_Hooks_e_Estados]] — hooks, constantes e dados de produtos
- [[Backoffice_Paginas_e_Rotas]] — painel admin com rotas protegidas
- [[Backoffice_Contextos_e_Lib]] — AuthContext, guards e permissões
- [[Integracao_API]] — contratos de API entre frontends e backend
- [[Ambiente_e_Mocks]] — dados falsos e configuração de ambiente

---

## Infraestrutura

- **Orquestração:** `docker-compose.yml` na raiz
- **Automação:** `Makefile` com targets `up`, `down`, `logs`, `bash-{service}`, `psql`
- **Build backend:** Multi-stage (Go builder → distroless), binário `main`
- **Build frontends:** `npm run dev -- --host` (modo dev em container)
- **Variáveis de ambiente:** `.env` na raiz do `backend/` (ver [[Ambiente_e_Mocks]])

---

## Status Atual

- Implementado: API de usuários backend, login com JWT, CRUD table genérico, vitrine de produtos, roteamento completo, containers Docker
- Pendente: integração real do backoffice com backend (Products, Permissions, Landing Page ainda usam mocks)
