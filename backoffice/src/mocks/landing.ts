import type { CrudItemType } from "@/types/CrudItem";

export type LandingSection = "Hero" | "Favoritos" | "Depoimentos" | "CTA Final";
export type LandingStatus = "Ativo" | "Inativo";

export interface MockLandingContentItem extends CrudItemType {
  secao: LandingSection;
  titulo: string;
  subtitulo: string;
  descricao: string;
  imagem: string;
  botaoTexto: string;
  botaoLink: string;
  status: LandingStatus;
}

export const MOCK_LANDING_CONTENT: MockLandingContentItem[] = [
  {
    id: "1",
    name: "Hero - Cookies que fazem sorrir",
    secao: "Hero",
    titulo: "Cookies que fazem sorrir",
    subtitulo: "Cookies & Coffee Break",
    descricao:
      "Feitos à mão com ingredientes de verdade, muito amor e uma pitada de magia. Cada mordida é um abraço quentinho.",
    imagem: "cookie-home.png",
    botaoTexto: "Ver cookies",
    botaoLink: "/shopping",
    status: "Ativo",
  },
  {
    id: "2",
    name: "Favoritos - Cookie Red",
    secao: "Favoritos",
    titulo: "Cookie Red",
    subtitulo: "Os mais amados!",
    descricao: "Cookie artesanal com chocolate branco e notas suaves de baunilha.",
    imagem: "cookie-red.png",
    botaoTexto: "Quero Esse!",
    botaoLink: "/shopping",
    status: "Ativo",
  },
  {
    id: "3",
    name: "Favoritos - Chocolate Ao Leite",
    secao: "Favoritos",
    titulo: "Chocolate Ao Leite",
    subtitulo: "Os mais amados!",
    descricao: "Cookie artesanal com chocolate belga ao leite, crocante por fora e derretido por dentro.",
    imagem: "cookie-choco-chunk.png",
    botaoTexto: "Quero Esse!",
    botaoLink: "/shopping",
    status: "Ativo",
  },
  {
    id: "4",
    name: "Favoritos - Double Chocolate",
    secao: "Favoritos",
    titulo: "Double Chocolate",
    subtitulo: "Os mais amados!",
    descricao: "Cookie artesanal com massa de cacau 70% e gotas de chocolate meio amargo.",
    imagem: "cookie-double-choc.png",
    botaoTexto: "Quero Esse!",
    botaoLink: "/shopping",
    status: "Ativo",
  },
  {
    id: "5",
    name: "Depoimentos - Ana Clara",
    secao: "Depoimentos",
    titulo: "Ana Clara",
    subtitulo: "Declarações de Amor",
    descricao:
      "Gente, eu CHOREI comendo o de chocolate ao leite. Não é exagero. É viciante demais!",
    imagem: "",
    botaoTexto: "",
    botaoLink: "",
    status: "Ativo",
  },
  {
    id: "6",
    name: "Depoimentos - Mariana",
    secao: "Depoimentos",
    titulo: "Mariana",
    subtitulo: "Declarações de Amor",
    descricao:
      "Comprei para dividir e me arrependi. Queria tudo pra mim. A massa é macia e o recheio é perfeito.",
    imagem: "",
    botaoTexto: "",
    botaoLink: "",
    status: "Ativo",
  },
  {
    id: "7",
    name: "Depoimentos - Carlos",
    secao: "Depoimentos",
    titulo: "Carlos",
    subtitulo: "Declarações de Amor",
    descricao:
      "Pedi no fim da tarde e chegou quentinho. Virou meu ritual de sexta com café.",
    imagem: "",
    botaoTexto: "",
    botaoLink: "",
    status: "Ativo",
  },
  {
    id: "8",
    name: "CTA Final - Fazer meu pedido",
    secao: "CTA Final",
    titulo: "Tá esperando o que pra experimentar?",
    subtitulo: "Peça online e receba seus cookies quentinhos em minutos.",
    descricao:
      "Delivery ou retirada — você escolhe!",
    imagem: "",
    botaoTexto: "Fazer meu pedido 🍪",
    botaoLink: "/cart",
    status: "Ativo",
  },
  {
    id: "9",
    name: "CTA Final - Ver cardápio",
    secao: "CTA Final",
    titulo: "Tá esperando o que pra experimentar?",
    subtitulo: "Peça online e receba seus cookies quentinhos em minutos.",
    descricao:
      "Delivery ou retirada — você escolhe!",
    imagem: "",
    botaoTexto: "Ver cardápio",
    botaoLink: "/shopping",
    status: "Ativo",
  },
];