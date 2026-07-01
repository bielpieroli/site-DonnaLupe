# Donna Lupe

Sistema web da Donna Lupe com vitrine pública, backoffice administrativo, API em Go/Gin e banco PostgreSQL.

## Integrantes

- Gabriel de Andrade Abreu - 14571362
- Isabela Beatriz Sousa Nunes Farias - 13823833
- João Gabriel Pieroli da Silva - 15678578

## Visão Geral

O projeto é dividido em quatro serviços no Docker Compose:

| Serviço | Descrição | Porta |
| --- | --- | --- |
| `front` | Site público em React/Vite | `5173` |
| `backoffice` | Painel administrativo em React/Vite | `5174` |
| `backend` | API REST em Go/Gin | `4000` |
| `db` | PostgreSQL 15 | `5432` |

URLs locais:

```text
Site público: http://localhost:5173
Backoffice:   http://localhost:5174
API:          http://localhost:4000
Swagger:      http://localhost:4000/swagger/index.html
```

## Tecnologias

- React 19, Vite, TypeScript e Tailwind CSS no site público e no backoffice
- Go, Gin, GORM, JWT e Swagger no backend
- PostgreSQL 15 para persistência
- Mercado Pago para criação de preferências de checkout e webhook de pagamento

## Como Rodar

Crie o arquivo de ambiente do backend:

```bash
cp backend/.env.example backend/.env
```

Ao rodar com Docker, ajuste o `backend/.env` para usar o host do serviço do Compose:

```env
DB_HOST=db
DB_USER=postgres
DB_PASSWORD=sua_senha
DB_NAME=donnalupe
DB_PORT=5432
ADMIN_EMAIL=admin@email.com
ADMIN_PASSWORD=admin123
JWT_BACKOFFICE_SECRET=um_segredo_forte_aqui
MP_ACCESS_TOKEN=seu_access_token_mp
FRONT_URL=http://localhost:5173
```

Suba tudo:

```bash
make build
```

Comandos úteis:

```bash
make ps
make logs
make logs-backend
make logs-db
make psql
make down
```

Para apagar containers e o volume do banco em ambiente local:

```bash
docker compose -p sitedonnalupe down -v
```

Use `down -v` com cuidado: ele remove os dados persistidos no PostgreSQL.

## Dados Iniciais

Quando o backend sobe, ele executa migrações automáticas com GORM e faz uma carga inicial de dados. O ponto de entrada fica em `backend/cmd/api/main.go`.

O boot da API executa:

- `AutoMigrate`: cria/atualiza tabelas do banco
- `InitializeAdmin`: cria o admin definido por `ADMIN_EMAIL` e `ADMIN_PASSWORD`
- `InitializeAdminPermissions`: dá permissão `write` ao admin nos recursos conhecidos
- `landingService.InitializeDefaults`: cria conteúdos padrão da landing antiga se a tabela estiver vazia
- `productService.InitializeDefaults`: cria produtos padrão se a tabela `products` estiver vazia
- `pageContentService.InitializeDefaults`: cria conteúdos padrão das páginas que ainda não existirem

Os dados hardcoded ficam principalmente em:

```text
backend/internal/services/product.go
backend/internal/services/landing.go
backend/internal/services/page_content.go
```

Se um banco antigo já tiver colunas incompatíveis, o `AutoMigrate` pode não remover essas colunas sozinho. Em desenvolvimento, normalmente o caminho mais simples é resetar o volume com `down -v`.

## Backoffice

O backoffice usa login JWT e permissões por recurso. O token é salvo no `localStorage` e enviado como `Bearer` nas chamadas à API.

Rotas principais:

| Rota | Módulo | Permissão |
| --- | --- | --- |
| `/login` | Login | pública |
| `/home` | Início | autenticado |
| `/products` | Produtos | `products` |
| `/backoffice-users` | Usuários | `users` |
| `/backoffice-permissions` | Permissões | `permissions` |
| `/backoffice-content` | Conteúdos das páginas | `content` |
| `/backoffice-freight` | Frete | `freight` |
| `/backoffice-orders` | Pedidos | `orders` |
| `/backoffice-deliveries` | Entregas | `orders` |
| `/backoffice-ingredients` | Ingredientes | `ingredients` |

Produtos, usuários, permissões, conteúdos, frete, pedidos e ingredientes são carregados da API real. Ainda existem arquivos em `backoffice/src/mocks`, mas eles não são a fonte principal das telas integradas.

## Site Público

Rotas principais:

| Rota | Página |
| --- | --- |
| `/` | Home |
| `/shopping` | Catálogo de cookies |
| `/about` | Sobre |
| `/coffee` | Coffee break |
| `/cart` | Carrinho e checkout |

O site público consome a API em `http://localhost:4000` para produtos, landing e conteúdos de página. Também mantém fallbacks e assets locais para imagens.

## Imagens

As imagens de produtos e conteúdos são salvas no banco como texto:

- Nome de asset local, como `cookie-choco-chunk.jpg`
- URL absoluta ou caminho iniciado por `/`
- Data URL/base64, quando enviada pelo backoffice via seletor de arquivo

Não há endpoint de upload separado nem armazenamento de arquivo em pasta no backend.

## API

Rotas públicas:

```text
POST /admin/auth/login
POST /checkout/preference
POST /freight/quote
GET  /landing
GET  /products
GET  /page-contents/:page
POST /webhook/mp
GET  /swagger/*any
```

Rotas administrativas exigem JWT e permissões:

```text
POST   /admin/auth/register
GET    /admin/users
GET    /admin/users/:email
PUT    /admin/users/:email
DELETE /admin/users/:email
GET    /admin/users/:email/permissions
PUT    /admin/users/:email/permissions

GET    /admin/products
POST   /admin/products
PUT    /admin/products/:id
DELETE /admin/products/:id

GET    /admin/landing
POST   /admin/landing
PUT    /admin/landing/:id
DELETE /admin/landing/:id

GET    /admin/page-contents
POST   /admin/page-contents
PUT    /admin/page-contents/:id
DELETE /admin/page-contents/:id

GET    /admin/freight/rules
POST   /admin/freight/rules
PUT    /admin/freight/rules/:id
DELETE /admin/freight/rules/:id

GET    /admin/orders
GET    /admin/orders/:id
PUT    /admin/orders/:id/delivery-status

GET    /admin/ingredients
POST   /admin/ingredients
PUT    /admin/ingredients/:name
DELETE /admin/ingredients/:name
```

## Estrutura

```text
.
├── backend/       # API Go/Gin, GORM, Swagger e integrações
├── front/         # Site público React/Vite
├── backoffice/    # Painel administrativo React/Vite
├── docker-compose.yml
├── Makefile
└── README.md
```

No backend, o fluxo principal é:

```text
Handler -> Service -> Repository -> PostgreSQL
```

## Desenvolvimento Sem Docker

Backend:

```bash
cd backend
go run cmd/api/main.go
```

Front:

```bash
cd front
npm install
npm run dev
```

Backoffice:

```bash
cd backoffice
npm install
npm run dev
```

Sem Docker, use `DB_HOST=localhost` no `backend/.env` e tenha um PostgreSQL local rodando.
