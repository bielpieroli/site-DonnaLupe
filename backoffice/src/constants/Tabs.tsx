import { LayoutTemplate, Package, ShieldCheck, ShoppingBag, Truck, Users } from "lucide-react";

export const Tabs: {
  key: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  pageNavigate: string;
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
    key: "landing",
    label: "Landing Page",
    description: "Gerencie os conteúdos exibidos na Landing Page da loja.",
    pageNavigate: "/backoffice-landing",
    icon: <LayoutTemplate className="w-5 h-5" />,
    bg: "bg-secondary/10",
    hoverBg: "group-hover:bg-secondary/20",
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
    icon: <Package className="w-5 h-5" />,
    bg: "bg-primary/10",
    hoverBg: "group-hover:bg-primary/20",
  },
];
