import type { CrudItemType } from "@/types/CrudItem";

export interface MockProductItem extends CrudItemType {
  tipo: "Shopping" | "Coffee";
  categoria: string;
  preco: number;
  estoque: number;
  sabor?: string;
  status: string;
}

export const MOCK_PRODUCTS: MockProductItem[] = [
  {
    id: "1",
    name: "Choco Chunk",
    tipo: "Shopping",
    categoria: "Classico",
    preco: 12,
    estoque: 120,
    sabor: "Chocolate belga ao leite",
    status: "Disponível",
  },
  {
    id: "2",
    name: "Double Chocolate",
    tipo: "Shopping",
    categoria: "Intenso",
    preco: 14,
    estoque: 96,
    sabor: "Cacau 70%",
    status: "Disponível",
  },
  {
    id: "3",
    name: "Caramelo",
    tipo: "Shopping",
    categoria: "Cremoso",
    preco: 13.5,
    estoque: 84,
    sabor: "Caramelo artesanal",
    status: "Disponível",
  },
  {
    id: "4",
    name: "Morango",
    tipo: "Shopping",
    categoria: "Frutado",
    preco: 13,
    estoque: 60,
    sabor: "Chocolate branco e morango",
    status: "Disponível",
  },
  {
    id: "5",
    name: "Limao",
    tipo: "Shopping",
    categoria: "Citrico",
    preco: 12.5,
    estoque: 36,
    sabor: "Raspas de limao",
    status: "Em promoção",
  },
  {
    id: "6",
    name: "Matcha",
    tipo: "Shopping",
    categoria: "Especial",
    preco: 15,
    estoque: 24,
    sabor: "Matcha japones",
    status: "Disponível",
  },
  {
    id: "7",
    name: "Caixa de Cookies",
    tipo: "Coffee",
    categoria: "Cookies",
    preco: 28,
    estoque: 18,
    sabor: "Sortidos",
    status: "Disponível",
  },
  {
    id: "8",
    name: "Caixa de Brownies",
    tipo: "Coffee",
    categoria: "Brownies",
    preco: 32,
    estoque: 12,
    sabor: "Chocolate intenso",
    status: "Disponível",
  },
  {
    id: "9",
    name: "Mini-Empadas",
    tipo: "Coffee",
    categoria: "Salgados",
    preco: 48,
    estoque: 8,
    sabor: "Recheios variados",
    status: "Em promoção",
  },
  {
    id: "10",
    name: "Bolo Caseiro",
    tipo: "Coffee",
    categoria: "Bolos",
    preco: 35,
    estoque: 0,
    sabor: "Do dia",
    status: "Esgotado",
  },
  {
    id: "11",
    name: "Caixa de Coxinhas",
    tipo: "Coffee",
    categoria: "Salgados",
    preco: 42,
    estoque: 10,
    sabor: "Crocante e recheada",
    status: "Disponível",
  },
];
