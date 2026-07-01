import type { CrudField } from "@/components/CrudTable";

export const PRODUCT_FIELDS: CrudField[] = [
  { value: "name", label: "Produto", type: "text" },
  {
    value: "kind",
    label: "Tipo",
    type: "select",
    options: ["Shopping", "Coffee"],
    badgeVariants: {
      Shopping: "bg-[#1d4ed8] border border-[#1e40af]",
      Coffee: "bg-[#7c3aed] border border-[#6d28d9]",
    },
  },
  {
    value: "category",
    label: "Categoria",
    type: "text",
    badgeVariants: {
      "Classico": "bg-[#cc6b2f] border border-[#b25b28]",
      "Intenso": "bg-[#7f56c9] border border-[#6a3fb8]",
      "Cremoso": "bg-[#c44b78] border border-[#9c375f]",
      "Frutado": "bg-[#2fa678] border border-[#248760]",
      "Citrico": "bg-[#d28f2a] border border-[#b37222]",
      "Especial": "bg-[#2563eb] border border-[#1e40af]",
      "Cookies": "bg-[#b45309] border border-[#92400e]",
      "Brownies": "bg-[#7c3aed] border border-[#6d28d9]",
      "Salgados": "bg-[#059669] border border-[#047857]",
      "Bolos": "bg-[#dc2626] border border-[#991b1b]",
    },
  },
  { value: "subtitle", label: "Subtítulo", type: "text" },
  { value: "description", label: "Descrição", type: "textarea" },
  { value: "priceValue", label: "Preço (R$)", type: "number" },
  { value: "stock", label: "Estoque", type: "number" },
  { value: "flavor", label: "Sabor", type: "text" },
  { value: "weight", label: "Peso", type: "text" },
  { value: "ingredientsText", label: "Ingredientes", type: "textarea" },
  { value: "allergens", label: "Alérgenos", type: "text" },
  { value: "badge", label: "Selo", type: "text" },
  { value: "image", label: "Imagem", type: "image" },
  { value: "unit", label: "Unidade Coffee", type: "text" },
  { value: "sizesText", label: "Tamanhos Coffee", type: "text" },
  { value: "sizeCountsText", label: "Unidades por tamanho", type: "text" },
  {
    value: "status",
    label: "Status",
    type: "select",
    options: ["Disponível", "Esgotado", "Em promoção"],
    badgeVariants: {
      Disponível: "bg-[#059669] border border-[#047857]",
      Esgotado: "bg-[#ef4444] border border-[#dc2626]",
      "Em promoção": "bg-[#f59e0b] border border-[#d97706]",
    },
  },
];

// Fields shown in the users table (display only)
export const USER_FIELDS: CrudField[] = [
  { value: "email", label: "E-mail", type: "text" },
];

// Fields for the create modal: email + password
export const USER_CREATE_FIELDS: CrudField[] = [
  { value: "email", label: "E-mail", type: "text" },
  { value: "password", label: "Senha (mín. 8 caracteres)", type: "password" },
];

// Fields for the edit modal: password only (email is the primary key)
export const USER_EDIT_FIELDS: CrudField[] = [
  { value: "password", label: "Nova Senha (mín. 8 caracteres)", type: "password" },
];

export const PAGE_CONTENT_FIELDS: CrudField[] = [
  {
    value: "page",
    label: "Página",
    type: "select",
    options: ["landing", "about", "shopping", "coffee", "footer"],
    badgeVariants: {
      landing: "bg-[#be123c] border border-[#9f1239]",
      about: "bg-[#7c3aed] border border-[#6d28d9]",
      shopping: "bg-[#1d4ed8] border border-[#1e40af]",
      coffee: "bg-[#b45309] border border-[#92400e]",
      footer: "bg-[#475569] border border-[#334155]",
    },
  },
  { value: "section", label: "Seção", type: "text" },
  { value: "name", label: "Nome interno", type: "text" },
  { value: "title", label: "Título", type: "text" },
  { value: "subtitle", label: "Subtítulo", type: "text" },
  { value: "description", label: "Descrição", type: "textarea" },
  { value: "image", label: "Imagem", type: "image" },
  { value: "buttonText", label: "Texto do Botão", type: "text" },
  { value: "buttonLink", label: "Link do Botão", type: "text" },
  {
    value: "status",
    label: "Status",
    type: "select",
    options: ["Ativo", "Inativo"],
    badgeVariants: {
      Ativo: "bg-[#059669] border border-[#047857]",
      Inativo: "bg-[#ef4444] border border-[#dc2626]",
    },
  },
];

export const INGREDIENT_FIELDS: CrudField[] = [
  { value: "name", label: "Ingrediente", type: "text" },
  { value: "stock", label: "Estoque", type: "number" },
  { value: "unit", label: "Unidade", type: "text" },
  { value: "value_reais", label: "Valor por unidade (R$)", type: "number" },
  {
    value: "stock_status",
    label: "Alerta",
    type: "badge",
    badgeVariants: {
      OK: "bg-[#059669] border border-[#047857]",
      "Baixo estoque": "bg-[#f59e0b] border border-[#d97706]",
      Esgotado: "bg-[#ef4444] border border-[#dc2626]",
    },
  },
];

export const INGREDIENT_CREATE_FIELDS: CrudField[] = [
  { value: "name", label: "Ingrediente", type: "text" },
  { value: "stock", label: "Estoque", type: "number" },
  { value: "unit", label: "Unidade", type: "text" },
  { value: "value_reais", label: "Valor por unidade (R$)", type: "number" },
];

export const INGREDIENT_EDIT_FIELDS: CrudField[] = [
  { value: "stock", label: "Estoque", type: "number" },
  { value: "unit", label: "Unidade", type: "text" },
  { value: "value_reais", label: "Valor por unidade (R$)", type: "number" },
];
