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
| Checkout MP (front→backend) | **Integrado** | `POST /checkout/preference` cria preferência server-side; requer `MP_ACCESS_TOKEN` no `.env` |

---

---

### Frete (`/freight` e `/admin/freight`)

#### `POST /freight/quote` — Público
- Geocodifica o endereço via **Nominatim (OSM)** e calcula distância de rota via **OSRM** — sem API key.
- Coordenadas fixas da loja: `lat=-22.0019, lon=-47.9337` (ICMC-USP, São Carlos-SP).
- Retorna o preço conforme a menor faixa que cobre a distância.
- **Body:** `{ "cep": "13565905", "number": "400", "complement": "" }`
- **Response 200:** `{ "quote": { "distance_km", "price_reais", "max_distance_km" } }`
- **Erros:** 422 (endereço não encontrado, rota impossível, fora da área de entrega)

#### `GET /admin/freight/rules` — JWT + read em "freight"
- **Response 200:** `{ "rules": [{ "id", "max_distance_km", "price_reais" }] }` (ordenado por distância)

#### `POST /admin/freight/rules` — JWT + write em "freight"
- **Body:** `{ "max_distance_km": 3.0, "price_reais": 8.50 }`
- **Response 201:** `{ "rule": { ... } }`

#### `PUT /admin/freight/rules/:id` — JWT + write em "freight"
- **Body:** igual ao POST
- **Response 200:** `{ "rule": { ... } }`

#### `DELETE /admin/freight/rules/:id` — JWT + write em "freight"
- **Response 200:** `{ "message": "Regra removida com sucesso" }`

---

### Checkout / Mercado Pago (`/checkout`)

#### `POST /checkout/preference` — Público
- Cria uma preferência de pagamento no Mercado Pago server-side e retorna o link de checkout.
- **Body:** `{ "items": [{ "id", "name", "quantity", "price_value" }], "freight_cost": 0.0, "pickup_mode": false }`
- **Response 201:** `{ "preferenceId", "initPoint" }` — o frontend redireciona para `initPoint`
- **Erros:** 400 (payload inválido), 502 (erro ao chamar MP ou `MP_ACCESS_TOKEN` ausente)
- Quando `pickup_mode: true`, frete não é adicionado como item MP.
- Back URLs configuradas via `FRONT_URL` (padrão `http://localhost:5173`): `/cart?status=success|failure|pending`

---

## Próximas Integrações Necessárias

### 1. Adicionar Novos Recursos ao Sistema de Permissões
- Adicionar a string do recurso em `models.KnownResources` (`internal/models/permission.go`)
- Aplicar `permMW("novo-recurso", models.PermRead/Write)` nas novas rotas em `main.go`
- **Adicionar o recurso também ao array `RESOURCES` em `backoffice/src/pages/PermissionsBackoffice/index.tsx`** — esse array é hardcoded e deve espelhar exatamente o `KnownResources` do backend; se ficar desatualizado, a página não exibirá as colunas novas e um "Salvar" irá apagar as permissões daquele recurso no banco (o PUT faz replace completo)
- Nenhuma mudança de schema necessária

### 2. Endpoints Faltantes (backend a implementar)
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
