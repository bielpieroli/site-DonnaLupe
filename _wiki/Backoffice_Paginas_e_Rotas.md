# Backoffice — Páginas e Rotas

Localização: `backoffice/src/`
Stack: React 19 + TypeScript + React Router v7 + Tailwind CSS + Framer Motion + Lucide React

---

## Estrutura de Roteamento

Arquivo: `src/routes/Routes.tsx`
Entrada: `backoffice/src/main.tsx` → `RouterProvider`
Layout: `App.tsx` — `<AuthProvider>` wrapping `<Header />` + `<Outlet />`

```
/ (App — layout com AuthProvider + Header)
├── /          → redirect para /home
├── /login     → LoginPage (pública)
└── <RequireAuth>   ← guard de autenticação
    ├── /home                  → HomePage
    ├── /products              → ProductsPage
    ├── /backoffice-users      → UserBackofficePage
    ├── /backoffice-permissions → PermissionsPage
    ├── /backoffice-landing    → LandingPageBackoffice
    ├── /backoffice-freight    → FreightPage
    ├── /backoffice-orders     → OrdersPage
    ├── /backoffice-deliveries → DeliveriesPage
    └── /backoffice-ingredients → IngredientsBackoffice
```

---

## Guard de Rota

### `RequireAuth` (`src/lib/RequireAuth.tsx`)
- Lê `isAuthenticated` do `AuthContext`
- Se não autenticado → redireciona para `/login` (React Router `<Navigate />`)
- Envolve todas as rotas administrativas

---

## Páginas

### `LoginPage` (`src/pages/Login/index.tsx`)
- Layout dividido: branding à esquerda, formulário à direita
- Campos: `email`, `password`
- Chama `AuthContext.login(email, password)`
- Exibe banner de erro vermelho em caso de falha
- Redireciona para `/home` se já autenticado

### `HomePage` (`src/pages/Home/index.tsx`)
- Saudação dinâmica baseada na hora do dia
- Grid de cards de navegação (responsivo):
  - **Products** → `/products`
  - **Users** → `/backoffice-users`
  - **Permissions** → `/backoffice-permissions`
  - **Landing Page** → `/backoffice-landing`
  - **Frete** → `/backoffice-freight`
  - **Pedidos** → `/backoffice-orders`
  - **Entregas** → `/backoffice-deliveries`
  - **Ingredientes** → `/backoffice-ingredients`
- Cada card: ícone Lucide + label + descrição (dados de `src/constants/Tabs.tsx`)

### `UserBackofficePage` (`src/pages/UserBackoffice/index.tsx`)
- Header card com botão "Voltar"
- `<CrudTable>` com campos de `USER_FIELDS` (`name`, `email`)
- Ações: Create, Edit, Delete
- **Status:** ainda usa dados mock; integração com backend comentada no código

### `ProductsPage` (`src/pages/Products/index.tsx`)
- Header card com botão "Voltar"
- `<CrudTable>` com campos de `PRODUCT_FIELDS`
- **Status:** dados mock (`src/mocks/products.ts`), sem integração real

### `PermissionsPage` (`src/pages/PermissionsBackoffice/`)
- `<CrudTable>` com campos de `PERMISSION_FIELDS`
- Inclui campo `multivalue` para `usuariosLeitura` e `usuariosLeituraEscrita`

### `LandingPageBackoffice` (`src/pages/LandingPageBackoffice/`)
- `<CrudTable>` com campos de `LANDING_FIELDS`
- Gerencia conteúdo dinâmico da vitrine pública

### `IngredientsBackoffice` (`src/pages/IngredientsBackoffice/`)
- Integra com `GET/POST/PUT/DELETE /admin/ingredients`
- Usa `<CrudTable>` com campos de `INGREDIENT_FIELDS`
- Permissão exigida: `ingredients`
- Exibe cards de resumo com total de ingredientes e alertas de baixo estoque
- Considera baixo estoque quando `stock <= 5`; `stock <= 0` aparece como `Esgotado`

---

## Componentes de Layout

### `Header` (`src/components/Header.tsx`)
- Header fixo (sticky) com logo e menu de navegação
- Exibe nome/email do usuário logado + avatar com iniciais
- Botão de logout (chama `AuthContext.logout()`)
- Menu lateral para mobile (com animação, fecha com Escape ou clique fora)
- Acessibilidade: navegação por teclado, atributos ARIA

### `CrudTable` (`src/components/CrudTable.tsx`)
Componente genérico reutilizado em todas as páginas de gestão.

**Props:**
```typescript
{
  data: CrudItem[]
  fields: CrudField[]
  onEdit: (item) => void
  onDelete: (item) => void
  onCreate?: (data) => void
  entityLabel?: string
  defaultPageSize?: number   // opções: 5 | 10 | 20 | 50
}
```

**Recursos:**
- Busca/filtro em tempo real por qualquer campo
- Ordenação (asc/desc) por coluna
- Paginação com seletor de tamanho
- Modais de Create / Edit / Delete
- Tipos de campo suportados: `text`, `textarea`, `select`, `badge`, `date`, `number`, `multivalue`

---

## Core Components (`src/components/core/`)

| Componente | Propósito |
|-----------|-----------|
| `Button.tsx` | variants: primary, secondary, ghost, danger; sizes: sm, md, icon |
| `Card.tsx` | container com borda, background e sombra |
| `Input.tsx` | campo de texto controlado |
| `Select.tsx` | dropdown controlado |
| `Badge.tsx` | tag colorida pequena |
| `Modal.tsx` | dialog com title, body e footer de ações |

### `Notification` (`src/components/Notification.tsx`)
- Toast animado com Framer Motion
- Tipos: `success | reminder | warning | info`
- Auto-dismiss em `duration` ms (padrão: 2500ms)
- Posicionado no topo centralizado com backdrop blur

---

Ver também: [[Backoffice_Contextos_e_Lib]] | [[Integracao_API]] | [[Ambiente_e_Mocks]]
