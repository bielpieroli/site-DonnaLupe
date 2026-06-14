# Frontend Público — Páginas e Rotas

Localização: `front/src/`
Stack: React 19 + TypeScript + React Router v7 + Tailwind CSS + Vite

---

## Estrutura de Roteamento

Arquivo: `src/routes/Routes.tsx`
Entrada: `src/main.tsx` → `RouterProvider`

```
/ (App — layout raiz com CartProvider + Header + Outlet)
├── /          → HomePage
├── /shopping  → ShoppingPage
├── /about     → AboutPage
├── /coffee    → CoffeePage
└── /cart      → CartPage
```

- Sem rotas protegidas (vitrine 100% pública)
- `App.tsx` envolve tudo em `<CartProvider>`, que fornece estado global do carrinho via localStorage

---

## Páginas

### `HomePage` (`src/pages/Home/index.tsx`)
- Seção hero com banner de marketing
- Seção "Favoritos": 3 produtos em destaque (dados de `PRODUCTS`)
- Slider de produtos com controles de scroll manuais
- Carrossel de depoimentos com rotação
- CTA com botões linkando para `/shopping`

### `ShoppingPage` (`src/pages/Shopping/index.tsx`)
- Grid responsivo de produtos (1 col mobile / 2 col md / 3 col xl)
- Fonte de dados: `PRODUCTS` de `src/data/products.tsx`
- Ao clicar no card → abre `ProductDetailCard` (modal)
- Controle de quantidade (+/-) dentro do modal
- "Adicionar" chama `useCart().addItem` — botão vira verde "Adicionado ✓" por 800ms, depois fecha o modal

### `CartPage` (`src/pages/Cart/index.tsx`)
- Estado vazio: ilustração + link para `/shopping`
- Lista de itens: imagem, nome, peso, preço/un, controle de qty, subtotal por linha, remover
- **Calculadora de frete** (seção sticky no desktop):
  - Input de CEP com máscara `XXXXX-XXX`
  - Chama `services/freight.ts → calculateFreight()` (stub — retorna erro até integração)
  - Quando implementado: lista de opções de envio com radio buttons
- **Resumo do pedido**: subtotal + frete selecionado + total
- **Checkout**: botão chama `services/payment.ts → createPaymentPreference()` (stub MP)
  - Desabilitado até frete ser selecionado
  - Redireciona para `pref.initPoint` quando integrado

### `AboutPage` (`src/pages/About/`)
- Página institucional sobre a marca

### `CoffeePage` (`src/pages/Coffee/`)
- Exibe produtos da categoria café/bebidas

---

## Componentes de Layout

### `Header` (`src/components/Header.tsx`)
- Logo centralizado (`src/assets/img/logo.png`)
- Tabs de navegação: Home, About, Shopping, Coffee
- Indicador de tab ativa (borda inferior)
- **Ícone de carrinho** (canto direito) com badge numérico via `useCart().totalItems`
- Menu hamburger para mobile (escondido em `2xl+`)
- Usa `TabKey` e `tabs` de `src/constants/Tabs.ts`

### `Footer` (`src/components/Footer/index.tsx`)
- Informações da empresa (de `DonnaLupeInfo`)
- Localização: ICMC-USP, São Carlos - SP
- Links de redes sociais e contato

### `ProductDetailCard` (`src/components/ProductDetailCard.tsx`)
Props: `{ product, quantity, onDecrease, onIncrease, onClose, onAddToCart?, added? }`
- Badge no canto superior esquerdo (com backdrop blur)
- Tags de ingredientes
- Caixa de alergênicos (destaque vermelho)
- Controles de quantidade + botão "Adicionar R$ X,XX"
- `onAddToCart(qty)` dispara ao clicar; `added=true` muda o botão para "Adicionado ✓" (verde)

---

## Tipo Central de Dados

### `CookieDetail` (inferido de `src/data/products.tsx`)
| Campo | Tipo |
|-------|------|
| `id` | string |
| `name` | string |
| `subtitle` | string |
| `category` | string |
| `description` | string |
| `price` | number |
| `weight` | string |
| `ingredients` | string[] |
| `allergens` | string |
| `badge` | string |
| `img` | ReactNode/string |

---

## Constantes de Navegação

### `src/constants/Tabs.ts`
```typescript
type TabKey = "cart" | "shopping" | "about" | "home" | "profile" | "coffee"
tabs: Array<{ key: TabKey, label: string, path: string }>
```

### `src/constants/DonnaLupeInfo.ts`
- `LOCATION`, `EMAIL`, `INSTAGRAM`, `TELEFONE` da loja

---

## Carrinho (estado global)

### `src/contexts/CartContext.tsx`
- `CartProvider` envolve `App` — contexto disponível em todas as páginas
- Persistência via `localStorage` (`donnalupe-cart`)
- `CartItem`: `{ id, name, subtitle, price, priceValue, img, weight, quantity }`
- API: `addItem(product, qty)` · `removeItem(id)` · `updateQuantity(id, delta)` · `clearCart()`
- Valores derivados: `totalItems`, `subtotal`
- Hook: `useCart()`

## Integrações futuras (stubs prontos)

### `src/services/freight.ts`
- `calculateFreight({ cep, totalWeightGrams }) → FreightQuote[]`
- **TODO**: integrar com Melhor Envio ou API Correios SIGEP. Origem: São Carlos-SP.
- Backend esperado: `POST /freight/quote`

### `src/services/payment.ts`
- `createPaymentPreference(items, freightCost) → MPPreference`
- **TODO**: backend deve criar preferência MP server-side e retornar `{ preferenceId, initPoint }`
- Backend esperado: `POST /checkout/preference`

---

Ver também: [[Front_Hooks_e_Estados]] | [[Ambiente_e_Mocks]] | [[Visao_Geral]]
