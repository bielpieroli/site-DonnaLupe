import { Package, Users } from "lucide-react";

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
    bg: "bg-[color-mix(in_oklab,var(--primary)_16%,transparent)]",
    hoverBg: "bg-[color-mix(in_oklab,var(--primary)_24%,transparent)]",
  },
  {
    key: "users",
    label: "Usuários",
    description: "Gerencie os usuários com acesso ao sistema de backoffice.",
    pageNavigate: "/backoffice-users",
    icon: <Users className="w-5 h-5" />,
    bg: "bg-[color-mix(in_oklab,var(--secondary)_16%,transparent)]",
    hoverBg: "bg-[color-mix(in_oklab,var(--secondary)_24%,transparent)]",
  },
];
