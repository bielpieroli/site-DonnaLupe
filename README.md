# Donna Lupe

Sistema web com vitrine pública, backoffice administrativo, API Go/Gin e PostgreSQL.

## Rodando com Docker

Crie o arquivo de ambiente:

```bash
cp backend/.env.example backend/.env
```

Para Docker Compose, `backend/.env` deve usar `DB_HOST=db`.

Suba todos os serviços:

```bash
make build
```

URLs locais:

```text
Front público: http://localhost:5173
Backoffice:    http://localhost:5174
Backend:       http://localhost:4000
Swagger:       http://localhost:4000/swagger/index.html
```

## Módulos Administrativos

- Usuários e permissões do backoffice
- Produtos (mock local no backoffice por enquanto)
- Landing Page (mock local no backoffice por enquanto)
- Frete por faixa de distância
- Pedidos e entregas
- Ingredientes com controle de estoque e alerta de baixo estoque

## Ingredientes

Rotas protegidas por token de backoffice e permissão `ingredients`:

```text
GET    /admin/ingredients
POST   /admin/ingredients
PUT    /admin/ingredients/:name
DELETE /admin/ingredients/:name
```

Payload de criação:

```json
{
  "name": "Farinha",
  "stock": 10,
  "unit": "kg",
  "value_reais": 7.5
}
```

O backoffice possui a tela **Ingredientes** em `/backoffice-ingredients`.
