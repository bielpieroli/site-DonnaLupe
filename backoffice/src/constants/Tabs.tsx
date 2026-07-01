import { FileText, Package, ShieldCheck, ShoppingBag, Truck, Users, Wheat } from "lucide-react";

export const Tabs: {
  key: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  pageNavigate: string;
  permissionResource?: string;
  bg: string;
  hoverBg: string;
} [] = [
  {
    key: "products",
    label: "Produtos",
    description: "Gerencie os produtos disponíveis na loja de doces Ludogs.",
    pageNavigate: "/products",
    icon: <Package className="w-5 h-5" />,
    bg: "bg-primary/10",
    hoverBg: "group-hover:bg-primary/20",
  },
  {
    key: "users",
    label: "Usuários",
    description: "Gerencie os usuários com acesso ao sistema de backoffice.",
    pageNavigate: "/backoffice-users",
    icon: <Users className="w-5 h-5" />,
    bg: "bg-secondary/10",
    hoverBg: "group-hover:bg-secondary/20",
  },
  {
    key: "permissions",
    label: "Permissões",
    description: "Gerencie o catálogo de permissões por recurso e nível de acesso.",
    pageNavigate: "/backoffice-permissions",
    icon: <ShieldCheck className="w-5 h-5" />,
    bg: "bg-primary/10",
    hoverBg: "group-hover:bg-primary/20",
  },
  {
    key: "content",
    label: "Conteúdos",
    description: "Gerencie textos, imagens e botões das páginas públicas.",
    pageNavigate: "/backoffice-content",
    icon: <FileText className="w-5 h-5" />,
    bg: "bg-primary/10",
    hoverBg: "group-hover:bg-primary/20",
  },
  {
    key: "freight",
    label: "Frete",
    description: "Defina o preço de entrega por faixa de distância (km) a partir da loja.",
    pageNavigate: "/backoffice-freight",
    icon: <Truck className="w-5 h-5" />,
    bg: "bg-primary/10",
    hoverBg: "group-hover:bg-primary/20",
  },
  {
    key: "ingredients",
    label: "Ingredientes",
    description: "Gerencie estoque, unidade, valor e alertas de baixo estoque dos ingredientes.",
    pageNavigate: "/backoffice-ingredients",
    icon: <Wheat className="w-5 h-5" />,
    bg: "bg-secondary/10",
    hoverBg: "group-hover:bg-secondary/20",
  },
  {
    key: "orders",
    label: "Pedidos",
    description: "Visualize todos os pedidos, receita total e relatório de vendas.",
    pageNavigate: "/backoffice-orders",
    icon: <ShoppingBag className="w-5 h-5" />,
    bg: "bg-secondary/10",
    hoverBg: "group-hover:bg-secondary/20",
  },
  {
    key: "deliveries",
    label: "Entregas",
    description: "Acompanhe e atualize o status de cada entrega em andamento.",
    pageNavigate: "/backoffice-deliveries",
    permissionResource: "orders",
    icon: <Package className="w-5 h-5" />,
    bg: "bg-primary/10",
    hoverBg: "group-hover:bg-primary/20",
  },
];
