import type { CrudItemType } from "@/types/CrudItem";

export interface MockPermissionItem extends CrudItemType {
  recurso: string;
  usuariosLeitura: string[];
  usuariosLeituraEscrita: string[];
}

export const MOCK_PERMISSIONS: MockPermissionItem[] = [
  {
    id: "1",
    name: "Acesso a Produtos",
    recurso: "Produtos",
    usuariosLeitura: ["Igor Ferreira", "Olivia Souza"],
    usuariosLeituraEscrita: ["Ana Beatriz Santos", "Carlos Eduardo Lima", "Juliana Ramos"],
  },
  {
    id: "2",
    name: "Acesso a Pedidos",
    recurso: "Pedidos",
    usuariosLeitura: ["Pedro Henrique Nunes", "Olivia Souza"],
    usuariosLeituraEscrita: ["Carlos Eduardo Lima", "Fernanda Oliveira", "Helena Martins"],
  },
  {
    id: "3",
    name: "Acesso a Usuarios",
    recurso: "Usuarios",
    usuariosLeitura: ["Lucas Almeida"],
    usuariosLeituraEscrita: ["Ana Beatriz Santos"],
  },
  {
    id: "4",
    name: "Acesso a Financeiro",
    recurso: "Financeiro",
    usuariosLeitura: ["Marina Pereira"],
    usuariosLeituraEscrita: ["Gabriel Costa"],
  },
  {
    id: "5",
    name: "Acesso a Relatorios",
    recurso: "Relatorios",
    usuariosLeitura: ["Igor Ferreira", "Olivia Souza"],
    usuariosLeituraEscrita: ["Gabriel Costa"],
  },
];
