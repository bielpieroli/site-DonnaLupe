import type { CrudItemType } from "@/types/CrudItem";

export interface MockPermissionItem extends CrudItemType {
  recurso: string;
  usuariosLeitura: string[];
  usuariosLeituraEscrita: string[];
  descricao: string;
}

export const MOCK_PERMISSIONS: MockPermissionItem[] = [
  {
    id: "1",
    name: "Acesso a Produtos",
    recurso: "Produtos",
    usuariosLeitura: ["Igor Ferreira", "Olivia Souza"],
    usuariosLeituraEscrita: ["Ana Beatriz Santos", "Carlos Eduardo Lima", "Juliana Ramos"],
    descricao: "Permite consultar catalogo, criar, editar e remover produtos.",
  },
  {
    id: "2",
    name: "Acesso a Pedidos",
    recurso: "Pedidos",
    usuariosLeitura: ["Pedro Henrique Nunes", "Olivia Souza"],
    usuariosLeituraEscrita: ["Carlos Eduardo Lima", "Fernanda Oliveira", "Helena Martins"],
    descricao: "Permite acompanhar pedidos e alterar status quando houver escrita.",
  },
  {
    id: "3",
    name: "Acesso a Usuarios",
    recurso: "Usuarios",
    usuariosLeitura: ["Lucas Almeida"],
    usuariosLeituraEscrita: ["Ana Beatriz Santos"],
    descricao: "Permite visualizar e administrar usuarios do backoffice.",
  },
  {
    id: "4",
    name: "Acesso a Financeiro",
    recurso: "Financeiro",
    usuariosLeitura: ["Marina Pereira"],
    usuariosLeituraEscrita: ["Gabriel Costa"],
    descricao: "Permite visualizar dados financeiros e editar quando RW.",
  },
  {
    id: "5",
    name: "Acesso a Relatorios",
    recurso: "Relatorios",
    usuariosLeitura: ["Igor Ferreira", "Olivia Souza"],
    usuariosLeituraEscrita: ["Gabriel Costa"],
    descricao: "Permite consultar relatorios e gerenciar versoes quando RW.",
  },
];
