# Backend — Arquitetura (Go)

Caminho de entrada: `backend/cmd/api/main.go`
Framework: Gin v1.12.0 | ORM: GORM v1.31.1 | DB: PostgreSQL

---

## Fluxo de Dados

```
HTTP Request
    │
[Gin Router] ─── CORS Middleware
    │
[Auth Middleware]  ← JWT Bearer validation (rotas protegidas)
    │
[Handler]          ← valida payload, chama service
    │
[Service]          ← lógica de negócio, orquestra providers
    │
[Repository]       ← acesso ao banco via GORM
    │
[PostgreSQL]
```

---

## Camadas e Arquivos-Chave

### `cmd/api/main.go`
- Inicializa `db.Connect()`, `gin.Default()`, CORS e rotas
- Chama `services.InitializeAdmin()` na inicialização
- Swagger em `/swagger/*any`
- Escuta na porta `4000`

### `internal/db/db.go`
- `Connect() *gorm.DB` — DSN via env vars, timezone `America/Sao_Paulo`
- `AutoMigrate(&models.UserBackoffice{})` executado no boot

### `internal/handlers/`

| Arquivo | Handler | Responsabilidade |
|---------|---------|-----------------|
| `user_backoffice.go` | `UserBackofficeHandler` | CRUD de usuários admin |
| `auth_backoffice.go` | `AuthBackofficeHandler` | Login e emissão de JWT |

**Métodos de `UserBackofficeHandler`:**
- `Create(c *gin.Context)` — `POST /admin/usersBackoffice`
- `GetAll(c *gin.Context)` — `GET /admin/usersBackoffice` (paginação + filtro)
- `GetByEmail(c *gin.Context)` — `GET /admin/usersBackoffice/:email`
- `Update(c *gin.Context)` — `PUT /admin/usersBackoffice/:email`
- `Delete(c *gin.Context)` — `DELETE /admin/usersBackoffice/:email`

**Métodos de `AuthBackofficeHandler`:**
- `Login(c *gin.Context)` — `POST /admin/auth/login` → retorna `{message, user, token, permissions}`

### `internal/services/`
- `UserBackofficeService`: lógica de negócio + chamadas ao repository + hashing
- `AuthBackofficeService.Login()`: valida credenciais via bcrypt, gera JWT
- `InitializeAdmin()`: cria admin padrão a partir de `ADMIN_EMAIL` / `ADMIN_PASSWORD` do `.env`

### `internal/repository/user_backoffice.go`
- Implementa acesso GORM direto ao banco
- `GetAllUsers()`: filtro ILIKE por email + `LIMIT`/`OFFSET` para paginação
- Métodos espelham a interface do service

### `internal/middleware/auth.go`
- `AuthBackofficeMiddleware()` — extrai e valida Bearer token JWT
- Injeta `email` no contexto Gin para handlers downstream

### `internal/providers/`
- `jwt.go`: `GenerateToBackoffice(email)`, `ParseToBackoffice(tokenStr)` — chave via `JWT_BACKOFFICE_SECRET`
- `cript.go`: `HashPassword(plain)`, `ComparePassword(hash, plain)` — bcrypt

---

## Tabela de Rotas

| Método | Path | Auth | Permissão | Handler |
|--------|------|------|-----------|---------|
| POST | `/admin/auth/login` | Público | — | `AuthBackofficeHandler.Login` |
| POST | `/admin/auth/register` | JWT | write em "users" | `UserBackofficeHandler.Register` |
| GET | `/admin/users` | JWT | read em "users" | `UserBackofficeHandler.GetAllUsers` |
| GET | `/admin/users/:email` | JWT | read em "users" | `UserBackofficeHandler.GetUserByEmail` |
| PUT | `/admin/users/:email` | JWT | write em "users" | `UserBackofficeHandler.UpdateUser` |
| DELETE | `/admin/users/:email` | JWT | write em "users" | `UserBackofficeHandler.DeleteUser` |
| GET | `/admin/users/:email/permissions` | JWT | read em "permissions" | `PermissionHandler.GetPermissions` |
| PUT | `/admin/users/:email/permissions` | JWT | write em "permissions" | `PermissionHandler.SetPermissions` |

---

## Dependências Principais (`go.mod`)

- `github.com/gin-gonic/gin v1.12.0`
- `gorm.io/gorm v1.31.1` + `gorm.io/driver/postgres`
- `github.com/golang-jwt/jwt/v5 v5.3.1`
- `golang.org/x/crypto` (bcrypt)
- `github.com/swaggo/gin-swagger`

---

Ver também: [[Backend_Models]] | [[Integracao_API]] | [[Ambiente_e_Mocks]]
