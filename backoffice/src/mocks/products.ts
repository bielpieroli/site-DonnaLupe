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
    name: "Chocolate Ao Leite",
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
    name: "Trio Chocolate Ao Leite",
    tipo: "Shopping",
    categoria: "Classico",
    preco: 10,
    estoque: 120,
    sabor: "Chocolate belga ao leite",
    status: "Disponível",
  },
  {
    id: "4",
    name: "Red",
    tipo: "Shopping",
    categoria: "Velvt",
    preco: 13,
    estoque: 60,
    sabor: "Chocolate branco e baunilha",
    status: "Disponível",
  },
  {
    id: "5",
    name: "Cookie Travessa",
    tipo: "Shopping",
    categoria: "Especial",
    preco: 18,
    estoque: 30,
    sabor: "Chocolate ao leite e gotas de chocolate",
    status: "Novo",
  },
  {
    id: "6",
    name: "Caixa de Cookies",
    tipo: "Coffee",
    categoria: "Cookies",
    preco: 28,
    estoque: 18,
    sabor: "Sortidos",
    status: "Disponível",
  },
  {
    id: "7",
    name: "Caixa de Brownies",
    tipo: "Coffee",
    categoria: "Brownies",
    preco: 32,
    estoque: 12,
    sabor: "Chocolate intenso",
    status: "Disponível",
  },
  {
    id: "8",
    name: "Caixa de Coxinhas",
    tipo: "Coffee",
    categoria: "Salgados",
    preco: 42,
    estoque: 10,
    sabor: "Crocante e recheada",
    status: "Disponível",
  },
  {
    id: "9",
    name: "Mini-Empadas",
    tipo: "Coffee",
    categoria: "Bolos",
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
