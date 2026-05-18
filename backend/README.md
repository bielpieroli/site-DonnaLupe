# Backend — Go + Gin + PostgreSQL

API RESTful desenvolvida em Go com o framework Gin e PostgreSQL como banco de dados.


## Tecnologias

- **[Go](https://golang.org/)** — linguagem principal
- **[Gin](https://github.com/gin-gonic/gin)** — framework HTTP
- **[pgx](https://github.com/jackc/pgx)** — driver PostgreSQL
- **[godotenv](https://github.com/joho/godotenv)** — carregamento de variáveis de ambiente


## Pré-requisitos

- Go 1.21+
- PostgreSQL instalado e rodando localmente


## Configuração do banco de dados

Acesse o `psql` e crie o usuário e banco:

```sql
CREATE USER seu_usuario WITH PASSWORD 'sua_senha';
CREATE DATABASE meu_banco OWNER seu_usuario;
```


## Variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
PORT=8080
DATABASE_URL=postgres://seu_usuario:sua_senha@localhost:5432/meu_banco?sslmode=disable
```


## Instalação

```bash
# Instale as dependências
go mod tidy
```


## Executando

```bash
make run
```
Ou ainda,
```bash
go run cmd/main.go
```


A API estará disponível em `http://localhost:8080`.


## Estrutura do projeto

```
meu-backend/
├── cmd/
│   ├── api/
│   │   └── main.go
├── internal/
│   ├── config/              # Leitura e validação das variáveis de ambiente
│   ├── db/                  # Conexão com o PostgreSQL   
│   ├── handlers/            # Camada HTTP: recebe requisições e monta respostas
│   ├── services/            # Camada de negócio: regras, validações e orquestrações
│   ├── repository/          # Camada de dados: queries ao banco
│   └── models/              # Structs compartilhadas entre as camadas
├── .env
├── go.mod
└── go.sum
```

### Fluxo entre camadas

```
Request HTTP
    ↓
Handler      →  valida entrada, monta resposta HTTP
    ↓
Service      →  aplica regras de negócio
    ↓
Repository   →  executa queries no PostgreSQL
```

