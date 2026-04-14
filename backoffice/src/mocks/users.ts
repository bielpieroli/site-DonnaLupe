import type { CrudItemType } from "@/types/CrudItem";

export interface MockUserItem extends CrudItemType {
  email: string;
  password: string;
}

export const MOCK_USERS: MockUserItem[] = [
  { id: "1", name: "Ana Beatriz Santos", email: "ana@gmail.com", password: "password123" },
  { id: "2", name: "Carlos Eduardo Lima", email: "carlos@gmail.com", password: "password123" },
  { id: "3", name: "Fernanda Oliveira", email: "fernanda@gmail.com", password: "password123" },
  { id: "4", name: "Gabriel Costa", email: "gabriel@gmail.com", password: "password123" },
  { id: "5", name: "Helena Martins", email: "helena@gmail.com", password: "password123" },
  { id: "6", name: "Igor Ferreira", email: "igor@gmail.com", password: "password123" },
  { id: "7", name: "Juliana Ramos", email: "juliana@gmail.com", password: "password123" },
  { id: "8", name: "Lucas Almeida", email: "lucas@gmail.com", password: "password123" },
  { id: "9", name: "Marina Pereira", email: "marina@gmail.com", password: "password123" },
  { id: "10", name: "Nicolas Barbosa", email: "nicolas@gmail.com", password: "password123" },
  { id: "11", name: "Olivia Souza", email: "olivia@gmail.com", password: "password123" },
  { id: "12", name: "Pedro Henrique Nunes", email: "pedro@gmail.com", password: "password123" },
];

export const MOCK_USER_NAMES = MOCK_USERS.map((user) => user.name);
