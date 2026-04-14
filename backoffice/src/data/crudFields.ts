import type { CrudField } from "@/components/CrudTable";
import { MOCK_USER_NAMES } from "@/mocks/users";

export const PRODUCT_FIELDS: CrudField[] = [
  { value: "name", label: "Produto", type: "text" },
  {
    value: "tipo",
    label: "Tipo",
    type: "badge",
    badgeVariants: {
      "Shopping": "bg-[#1d4ed8] border border-[#1e40af]",
      "Coffee": "bg-[#7c3aed] border border-[#6d28d9]",
    },
  },
  {
    value: "categoria",
    label: "Categoria",
    type: "badge",
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
  { value: "preco", label: "Preço", type: "text" },
  { value: "estoque", label: "Estoque", type: "text" },
  { value: "sabor", label: "Sabor", type: "text" },
  {
    value: "status",
    label: "Status",
    type: "badge",
    badgeVariants: {
      Disponível: "bg-[#059669] border border-[#047857]",
      Esgotado: "bg-[#ef4444] border border-[#dc2626]",
      "Em promoção": "bg-[#f59e0b] border border-[#d97706]",
    },
  },
];

export const USER_FIELDS: CrudField[] = [
  { value: "name", label: "Nome", type: "text" },
  { value: "email", label: "E-mail", type: "text" },
];

export const PERMISSION_FIELDS: CrudField[] = [
  { value: "name", label: "Permissao", type: "text" },
  {
    value: "recurso",
    label: "Recurso",
    type: "badge",
    badgeVariants: {
      Produtos: "bg-[#1d4ed8] border border-[#1e40af]",
      Pedidos: "bg-[#c2410c] border border-[#9a3412]",
      Usuarios: "bg-[#7c3aed] border border-[#6d28d9]",
      Relatorios: "bg-[#475569] border border-[#334155]",
      Financeiro: "bg-[#b45309] border border-[#92400e]",
      Atendimento: "bg-[#15803d] border border-[#166534]",
    },
  },
  {
    value: "usuariosLeitura",
    label: "Usuários com leitura (R)",
    type: "multivalue",
    multiValueOptions: MOCK_USER_NAMES,
  },
  {
    value: "usuariosLeituraEscrita",
    label: "Usuários com leitura/escrita (RW)",
    type: "multivalue",
    multiValueOptions: MOCK_USER_NAMES,
  },
  { value: "descricao", label: "Descricao", type: "text" },
];
