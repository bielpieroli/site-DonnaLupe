# Frontend Público — Hooks e Estados

Localização: `front/src/`
Gerenciamento de estado: local (useState/hooks), sem contexto global ou biblioteca de estado

---

## Custom Hooks

### `useWindowDimensions` (`src/hooks/useWindowDimentions.ts`)
- Retorna: `{ width: number, height: number }`
- Escuta `window.resize` via `addEventListener`
- Atualiza estado a cada redimensionamento
- Usado para lógica de layout responsivo (ex.: slider na HomePage)

---

## Dados de Produtos

### Pipeline de Dados (`src/data/products.tsx`)
```
src/mocks/cookies.json   ← fonte de dados bruta (JSON estático)
        │
src/data/products.tsx    ← importa JSON, mapeia imagens, exporta PRODUCTS
        │
Páginas / Componentes    ← consomem PRODUCTS: CookieDetail[]
```

- Mapeamento de `imageFile` (string do JSON) → import de imagem real de `src/assets/img/`
- Exporta `PRODUCTS: CookieDetail[]` como array pronto para consumo
- Sem chamada de API: dados 100% estáticos no bundle

---

## Estado Local nas Páginas

### `ShoppingPage`
- `selectedProduct: CookieDetail | null` — produto selecionado para exibir no modal
- `quantity: number` — quantidade atual do produto no modal
- Handlers: `handleOpenModal`, `handleCloseModal`, `handleIncrease`, `handleDecrease`

### `HomePage`
- Estado interno para o carrossel de depoimentos (índice ativo)
- Estado para posição do slider de produtos (scroll offset)

---

## Constantes e Configurações

### `src/constants/Tabs.ts`
```typescript
type TabKey = "cart" | "shopping" | "about" | "home" | "profile" | "coffee"
interface Tab { key: TabKey; label: string; path: string }
export const tabs: Tab[]
```

### `src/constants/DonnaLupeInfo.ts`
Exporta objeto com dados institucionais estáticos:
- `LOCATION`: "ICMC-USP, São Carlos - SP"
- `EMAIL`, `INSTAGRAM`, `TELEFONE`

---

## Assets

- `src/assets/img/`: 6 imagens de cookies + logo da marca
- Imagens importadas estaticamente em `src/data/products.tsx` e mapeadas por `imageFile`

---

## Padrão de Composição

O frontend público segue o padrão de **prop drilling simples**:
- Sem Context API
- Sem Redux ou Zustand
- Estado elevado até o componente de página, descido via props para componentes filhos
- Adequado para a escala atual (sem lógica de carrinho real implementada)

---

Ver também: [[Front_Paginas_e_Rotas]] | [[Ambiente_e_Mocks]]
