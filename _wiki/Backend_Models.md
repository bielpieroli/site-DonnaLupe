# Backend — Models e Esquemas de Dados

Localização: `backend/internal/models/`

---

## Entidade Principal

### `UserBackoffice` (`user_backoffice.go`)
Tabela PostgreSQL gerenciada via GORM `AutoMigrate`.

| Campo | Tipo Go | Restrição DB |
|-------|---------|-------------|
| `Email` | `string` | PK, NOT NULL |
| `PasswordHash` | `string` | NOT NULL |

- Chave primária: `Email` (string, não usa ID autoincremental)
- Sem campos de auditoria (`created_at`, `updated_at`) por padrão na versão atual

### `Ingredient` (`ingredient.go`)
Tabela PostgreSQL gerenciada via GORM `AutoMigrate`.

| Campo | Tipo Go | Restrição DB |
|-------|---------|--------------|
| `Name` | `string` | PK, tamanho 120 |
| `Stock` | `float64` | NOT NULL, `stock >= 0` |
| `Unit` | `string` | NOT NULL, padrão `"un"` |
| `ValueReais` | `float64` | NOT NULL, `value_reais >= 0` |

### `ProductIngredient` (`ingredient.go`)
Tabela pivô preparada para o relacionamento produto × ingrediente.

| Campo | Tipo Go | Restrição DB |
|-------|---------|--------------|
| `ProductID` | `uint` | PK composta |
| `IngredientName` | `string` | PK composta, index |
| `Quantity` | `float64` | NOT NULL, `quantity >= 0` |
| `Unit` | `string` | NOT NULL, padrão `"un"` |

> O vínculo produto × ingrediente ainda não está exposto em rotas neste recorte.

---

## DTOs de Request

### `CreateUserBackofficeRequest`
- `Email string` — requerido
- `Password string` — requerido, mínimo 8 caracteres

### `UpdateUserBackofficeRequest`
- `Password string` — requerido, mínimo 8 caracteres (atualização de senha apenas)

### `LoginUserBackofficeRequest`
- `Email string` — requerido
- `Password string` — requerido

### `CreateIngredientRequest`
- `Name string` — requerido
- `Stock float64` — maior ou igual a 0
- `Unit string` — opcional; padrão `"un"` quando vazio
- `ValueReais float64` — maior ou igual a 0

### `UpdateIngredientRequest`
- `Stock *float64` — opcional, maior ou igual a 0
- `Unit *string` — opcional
- `ValueReais *float64` — opcional, maior ou igual a 0

---

## DTOs de Response

### `SafeUserBackoffice`
- `Email string` — único campo exposto (sem hash de senha)
- Usado em todas as respostas de listagem e retorno pós-login

### `UserBListResult`
Retorno paginado do endpoint `GET /admin/usersBackoffice`:
- `Users []SafeUserBackoffice` — slice de usuários da página
- `TotalRecords int64` — total no banco (sem filtro)
- `FilteredRecords int64` — total após aplicar filtro de busca

---

## Query Parameters de Paginação/Filtro

Aceitos pelo handler `GetAll`:

| Parâmetro | Tipo | Comportamento |
|-----------|------|--------------|
| `page` | int | Página atual (base 1) |
| `limit` | int | Itens por página |
| `search` | string | Filtro ILIKE em `email` |
| `sort` | string | Campo de ordenação |
| `order` | string | `asc` ou `desc` |

---

## Fluxo de Senha

1. Recebe `password` em plain text via request
2. `providers.HashPassword(plain)` → bcrypt hash
3. Armazena apenas `PasswordHash` no banco
4. No login: `providers.ComparePassword(hash, plain)` → valida sem descriptografar

---

## JWT Claims (`internal/providers/jwt.go`)

```go
BackofficeClaims {
    Email string
    jwt.RegisteredClaims  // exp: 24h
}
```

- Secret: variável de ambiente `JWT_BACKOFFICE_SECRET`
- Algoritmo: HMAC-SHA256 (padrão golang-jwt)

---

Ver também: [[Backend_Arquitetura]] | [[Integracao_API]]
