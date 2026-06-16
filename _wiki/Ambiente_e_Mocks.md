# Ambiente e Mocks

Documentação de configuração local, variáveis de ambiente e dados falsos usados para desenvolvimento isolado.

---

## Variáveis de Ambiente (Backend)

Arquivo: `backend/.env` (criado a partir de `backend/.env.example`)

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `DB_HOST` | Host do PostgreSQL | `db` (serviço Docker) |
| `DB_USER` | Usuário do banco | `postgres` |
| `DB_PASSWORD` | Senha do banco | `password` |
| `DB_NAME` | Nome do banco | `donnalupe` |
| `DB_PORT` | Porta do banco | `5432` |
| `ADMIN_EMAIL` | Email do admin inicial | `admin@admin.com` |
| `ADMIN_PASSWORD` | Senha do admin inicial | `admin1234` |
| `JWT_BACKOFFICE_SECRET` | Chave de assinatura JWT | string longa aleatória |
| `MP_ACCESS_TOKEN` | Access Token do Mercado Pago (criação de preferências) | obtido em mercadopago.com.br/developers |
| `FRONT_URL` | URL pública do frontend (back_urls do MP) | `http://localhost:5173` |

- O backend chama `InitializeAdmin()` no boot usando `ADMIN_EMAIL` + `ADMIN_PASSWORD`
- Sem `.env` configurado, o serviço falha ao conectar no banco

---

## Serviços Docker (`docker-compose.yml`)

| Serviço | Imagem | Porta | Depende de |
|---------|--------|-------|-----------|
| `front` | Node (Dockerfile local) | 5173 | — |
| `backoffice` | Node (Dockerfile local) | 5174 | — |
| `backend` | Go multi-stage (Dockerfile local) | 4000 | `db` (healthy) |
| `db` | `postgres:15` | 5432 | — |

- Volume persistente: `db_data` (dados do PostgreSQL sobrevivem a `make down`)
- Health check do `db`: `pg_isready` antes do backend subir

### Comandos Makefile

| Target | Ação |
|--------|------|
| `make up` / `make build` | Sobe todos os containers |
| `make down` | Para e remove containers |
| `make restart` | Para e sobe novamente |
| `make logs` | Logs de todos os serviços |
| `make logs-backend` | Logs só do backend |
| `make bash-backend` | Shell no container backend |
| `make psql` | CLI do PostgreSQL |

---

## Mocks do Frontend Público (`front/src/`)

### `src/mocks/cookies.json`
6 produtos estáticos com estrutura completa:

| Campo | Tipo | Exemplo |
|-------|------|---------|
| `id` | string | `"1"` |
| `name` | string | `"Choco Chunk"` |
| `subtitle` | string | Slogan do produto |
| `category` | string | `"chocolate"` |
| `description` | string | Texto longo |
| `price` | number | `12.90` |
| `weight` | string | `"80g"` |
| `ingredients` | string[] | Lista de ingredientes |
| `allergens` | string | Aviso de alergênicos |
| `badge` | string | `"Mais Vendido"` |
| `imageFile` | string | Nome do arquivo em `assets/img/` |

Produtos: Choco Chunk, Double Chocolate, Caramelo, Morango, Limao, Matcha

Pipeline: `cookies.json` → `src/data/products.tsx` (mapeia imagens) → `PRODUCTS: CookieDetail[]`

---

## Mocks do Backoffice (`backoffice/src/`)

### `src/mocks/users.ts`
- `MOCK_USERS`: 12 usuários com `{ id, name, email, password: "password123" }`
- Usados pelo `AuthContext.login()` para simular autenticação
- **Credenciais padrão de dev:** qualquer email de `MOCK_USERS` + senha `password123`

### `src/mocks/products.ts`
- 11 produtos (6 Shopping, 5 Coffee)
- Campos: `{ id, name, tipo, categoria, preco, estoque, sabor, status }`
- Usados pela `ProductsPage` via `CrudTable`

### `src/mocks/permissions.ts`
- Mock de permissões com campos `recurso`, `usuariosLeitura[]`, `usuariosLeituraEscrita[]`
- Usado pela `PermissionsPage`

### `src/mocks/landing.ts`
- Mock de seções da landing page pública
- Campos: `secao`, `titulo`, `subtitulo`, `descricao`, `imagem`, `botaoTexto`, `botaoLink`, `status`

---

## Desenvolvimento Isolado

- **Frontend público** roda independente: sem backend, dados de `cookies.json`
- **Backoffice** roda independente: sem backend, login via `MOCK_USERS`, CRUD via mocks
- **Backend** precisa do banco: requer `db` saudável + `.env` configurado
- Para testar integração real: subir `make up` com `.env` válido

---

Ver também: [[Visao_Geral]] | [[Integracao_API]] | [[Backend_Arquitetura]]
