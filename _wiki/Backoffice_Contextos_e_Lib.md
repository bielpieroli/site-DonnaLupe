# Backoffice — Contextos, Lib e Permissões

Localização: `backoffice/src/`
Gerenciamento de estado global: React Context API + `src/lib/api.ts`

---

## AuthContext (`src/contexts/AuthContext.tsx`)

Principal contexto global do backoffice. **Login agora é real via API.**

### Tipos

```typescript
// src/types/api.ts
type PermissionLevel = 'none' | 'read' | 'write'

interface Permission { backoffice_email, resource, level: PermissionLevel }

interface AuthUser { email: string; name: string }

interface StoredSession extends AuthUser { token: string; permissions: Permission[] }
```

### Interface do Contexto

```typescript
{
  isAuthenticated: boolean
  user: AuthUser | null
  permissions: Permission[]
  login(email, password): Promise<string | null>  // null = sucesso, string = mensagem de erro
  logout(): void
}
```

### Comportamento

- `login()` chama `POST /auth/login` via `api.auth.login()`
- Armazena `{ email, name, token, permissions }` em localStorage (`semcomp-backoffice-auth`)
- Restaura sessão completa no mount a partir do localStorage
- `logout()` limpa estado + localStorage
- `token` é lido diretamente do localStorage por `api.ts` (não fica no estado React)

### Hook auxiliar

```typescript
// Verifica permissão de um recurso com mínimo de nível exigido
useHasPermission(resource: string, level: 'read' | 'write'): boolean
```

---

## API Client (`src/lib/api.ts`)

Centraliza todos os `fetch` contra `http://localhost:4000`.

### Leitura do token

Lê `token` de `localStorage['semcomp-backoffice-auth']` automaticamente em cada request.

### Métodos disponíveis

| Namespace | Método | Endpoint |
|-----------|--------|----------|
| `api.auth` | `login(email, password)` | `POST /auth/login` |
| `api.auth` | `register(email, password, permissions?)` | `POST /auth/register` |
| `api.users` | `getAll(params?)` | `GET /admin/users` |
| `api.users` | `update(email, password)` | `PUT /admin/users/:email` |
| `api.users` | `delete(email)` | `DELETE /admin/users/:email` |
| `api.permissions` | `getByUser(email)` | `GET /admin/users/:email/permissions` |
| `api.permissions` | `setByUser(email, permissions)` | `PUT /admin/users/:email/permissions` |

### Tratamento de erros

Todos os métodos lançam `ApiError(status, message)` em caso de resposta não-ok.
Componentes fazem `catch (err)` e verificam `err instanceof ApiError` para exibir mensagem correta.

---

## Guard de Rota (`src/lib/RequireAuth.tsx`)

Sem alterações — ainda consome `AuthContext.isAuthenticated`, redireciona para `/login` se falso.

---

## Constantes de Navegação (`src/constants/Tabs.tsx`)

Sem alterações — tabs: Products, Users, Permissions, Landing Page.

---

## Campos CRUD (`src/data/crudFields.ts`)

### `USER_FIELDS` — colunas exibidas na tabela
`email`

### `USER_CREATE_FIELDS` — campos no modal de criação
`email` + `password` (type: password)

### `USER_EDIT_FIELDS` — campos no modal de edição
`password` apenas (email é PK e não pode ser alterado)

### `PRODUCT_FIELDS`, `LANDING_FIELDS`
Sem alterações — ainda usam dados mock.

### `PERMISSION_FIELDS`
Removida da página de permissões (redesenhada — não usa CrudTable).

---

## Tipos API (`src/types/api.ts`)

Exports: `PermissionLevel`, `Permission`, `AuthUser`, `StoredSession`, `LoginResponse`,
`BackofficeUser`, `UserListResponse`, `PermissionsResponse`, `ApiError`

---

## Modelo de Permissões (Integrado)

- **Página redesenhada:** mostra tabela de usuários × recursos com badges de nível
- **Recursos conhecidos** (em `PermissionsBackoffice/index.tsx` — manter em sincronia com `backend/internal/models/permission.go → KnownResources`):
  - `users`, `products`, `permissions`, `landing`
- **Níveis:** `write` = RW (verde), `read` = R (azul), `none` = — (cinza)
- Edição via modal com `<Select>` por recurso → chama `PUT /admin/users/:email/permissions`

---

Ver também: [[Backoffice_Paginas_e_Rotas]] | [[Integracao_API]] | [[Ambiente_e_Mocks]]
