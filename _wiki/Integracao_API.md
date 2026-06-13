# Integração API

Base URL: `http://localhost:4000`
Documentação interativa: `http://localhost:4000/swagger/index.html`
Autenticação: Bearer JWT no header `Authorization`

---

## Endpoints Implementados

### Autenticação (`/admin/auth`)

#### `POST /admin/auth/login` — Público
- **Body:** `{ "email": "string", "password": "string" }`
- **Response 200:** `{ "message", "user": {"email"}, "token", "permissions": [{backoffice_email, resource, level}] }`
- **Erros:** 401 (credenciais inválidas), 400 (payload inválido)

#### `POST /admin/auth/register` — JWT + write em "users"
- **Body:** `{ "email", "password (min 8)", "permissions?": [{resource, level}] }`
- **Response 201:** `{ "message", "user": {"email"} }`
- **Erros:** 409 (email já existe), 400 (validação), 403 (sem permissão)

---

### Usuários (`/admin/users`) — JWT obrigatório

| Método | Path | Permissão | Descrição |
|--------|------|-----------|-----------|
| GET | `/admin/users` | read em "users" | Lista com paginação/filtro |
| GET | `/admin/users/:email` | read em "users" | Busca por email |
| PUT | `/admin/users/:email` | write em "users" | Atualiza senha |
| DELETE | `/admin/users/:email` | write em "users" | Remove usuário e permissões |

**Query params de `GET /admin/users`:**

| Param | Tipo | Descrição |
|-------|------|-----------|
| `page` | int | Página (base 1) |
| `limit` | int | Itens por página |
| `sort_by` | string | Campo de ordenação |
| `sort_order` | string | `asc` \| `desc` |
| `search_by` | string | Campo de busca |
| `search_value` | string | Valor de busca |

---

### Permissões (`/admin/users/:email/permissions`) — JWT obrigatório

#### `GET /admin/users/:email/permissions` — read em "permissions"
- Retorna todas as permissões do usuário, incluindo `"none"` para recursos sem entrada
- **Response 200:** `{ "email", "permissions": [{backoffice_email, resource, level}] }`

#### `PUT /admin/users/:email/permissions` — write em "permissions"
- Substitui todas as permissões do usuário atomicamente
- Entradas com `level: "none"` são ignoradas (ausência = sem acesso)
- **Body:** `{ "permissions": [{resource, level}] }`
- **Response 200:** `{ "message", "permissions": [...] }` (lista atualizada)

---

## Status de Integração por Módulo

| Módulo | Status | Observações |
|--------|--------|-------------|
| Login (backoffice) | **Integrado** | `AuthContext.login()` chama `POST /auth/login`; armazena token + permissões |
| Register (backoffice) | **Integrado** | `UsersCRUD.handleCreate` chama `POST /auth/register` |
| Users CRUD (backoffice) | **Integrado** | `GET/PUT/DELETE /admin/users` com notificações de feedback |
| Permissions CRUD (backoffice) | **Integrado** | Página redesenhada: tabela usuário × recurso + modal de edição |
| Products CRUD (backoffice) | Mock local | Endpoints de products no backend ainda não existem |
| Landing Page (backoffice) | Mock local | Endpoints de landing no backend ainda não existem |
| Vitrine (front) | Estático | Dados em `cookies.json`, sem API |

---

## Próximas Integrações Necessárias

### 1. Adicionar Novos Recursos ao Sistema de Permissões
- Adicionar a string do recurso em `models.KnownResources` (`internal/models/permission.go`)
- Aplicar `permMW("novo-recurso", models.PermRead/Write)` nas novas rotas em `main.go`
- Nenhuma mudança de schema necessária

### 3. Endpoints Faltantes (backend a implementar)
- `GET/POST/PUT/DELETE /admin/products`
- `GET/POST/PUT/DELETE /admin/landing`

---

## CORS Backend

Configurado em `backend/cmd/api/main.go`:
- Origens permitidas: `http://localhost:5173` (front), `http://localhost:5174` (backoffice)
- Métodos: GET, POST, PUT, DELETE, OPTIONS
- Headers: Content-Type, Authorization

---

Ver também: [[Backend_Arquitetura]] | [[Backend_Models]] | [[Backoffice_Contextos_e_Lib]] | [[Ambiente_e_Mocks]]
