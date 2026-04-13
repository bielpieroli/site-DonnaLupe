import { CrudTable, type CrudField } from "@/components/CrudTable";
import type { CrudItemType } from "@/types/CrudItem";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "@/components/core/Button";
import Card from "@/components/core/Card";
import { ArrowLeft, UserCog } from "lucide-react";

interface UserItem extends CrudItemType {
  email: string;
  cargo: string;
  departamento: string;
}

const sampleUsers: UserItem[] = [
  { id:"1", name: "Ana Beatriz Santos", email: "ana@gmail.com", cargo: "Analista", departamento: "Vendas"},
  { id:"2", name: "Carlos Eduardo Lima", email: "carlos@gmail.com", cargo: "Gerente", departamento: "Marketing" },
  { id:"3", name: "Fernanda Oliveira", email: "fernanda@gmail.com", cargo: "Supervisora", departamento: "Financeiro" },
  { id:"4", name: "Gabriel Costa", email: "gabriel@gmail.com", cargo: "Coordenador", departamento: "TI" },
  { id:"5", name: "Helena Martins", email: "helena@gmail.com", cargo: "Assistente", departamento: "Eventos" },
  { id:"6", name: "Igor Ferreira", email: "igor@gmail.com", cargo: "Consultor", departamento: "Comunicação" },
  { id: "7", name: "Juliana Ramos", email: "juliana@gmail.com", cargo: "Analista", departamento: "Vendas" },
  { id: "8", name: "Lucas Almeida", email: "lucas@gmail.com", cargo: "Gerente", departamento: "Marketing" },
  { id: "9", name: "Marina Pereira", email: "marina@gmail.com", cargo: "Supervisora", departamento: "Financeiro" },
  { id: "10", name: "Nicolas Barbosa", email: "nicolas@gmail.com", cargo: "Coordenador", departamento: "TI" },
  { id: "11", name: "Olívia Souza", email: "olivia@gmail.com", cargo: "Assistente", departamento: "Eventos" },
  { id: "12", name: "Pedro Henrique Nunes", email: "pedro@gmail.com", cargo: "Consultor", departamento: "Comunicação" },
];

const fields: CrudField[] = [
  { value: "name", label: "Nome", type: "text" },
  { value: "email", label: "E-mail", type: "text" },
  { value: "cargo", label: "Cargo", type: "text" },
  { value: "departamento", label: "Departamento", type: "badge", badgeVariants: {
    "TI": "bg-[#2563eb] border border-[#1e40af]",
    "Eventos": "bg-[#b2501f] border border-[#923f19]",
    "Marketing": "bg-[#c0266a] border border-[#9f1239]",
    "Financeiro": "bg-[#b45309] border border-[#92400e]",
    "Diretoria": "bg-[#dc2626] border border-[#991b1b]",
    "Comunicação": "bg-[#f97316] border border-[#c2410c]",
    "Operações": "bg-[#9a3412] border border-[#7c2a0d]",
  }},
];

export default function UsersCRUD() {
  const navigate = useNavigate();
  const [data, setData] = useState<CrudItemType[]>(sampleUsers);

  // TODO: Integrar com backend para persistência real dos dados no BD
  const handleEdit = (item: CrudItemType) => {
    setData(prev => prev.map(i => i.id === item.id ? item : i));
  };
  const handleDelete = (id: string) => setData(prev => prev.filter(i => i.id !== id));
  const handleCreate = (item: CrudItemType) => setData(prev => [...prev, { ...item, id: String(Date.now()) }]);


  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-8 md:px-6 md:py-10 space-y-6 overflow-x-auto scrollbar-hide">
      {/* Header card situando a página */}
      <Card className="relative overflow-hidden border-border bg-panel-gradient">
        <div className="pointer-events-none absolute top-0 right-0 h-72 w-72 rounded-full bg-accent-orb blur-3xl" />
        <div className="pb-4 p-6">
          <div className="flex items-center gap-2 mb-2">
            <UserCog className="h-4 w-4 text-primary" />
            <p className="text-sm font-extrabold uppercase tracking-[0.3em] text-text/70">Usuários</p>
          </div>
          <h1 className="font-display text-2xl font-semibold text-text-h md:text-3xl">
            Gestão de Usuários para Acesso ao Backoffice da DonnaLupe
          </h1>
          <p className="mt-1 text-muted">
            Cadastre e busque usuários do Backoffice, acesse e edite informações, mantenha controle sobre quem possui acesso ao painel Backoffice da Loja de Doces DonnaLupe.
          </p>
        </div>
        <div className="px-6 pb-6">
          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="secondary"
              size="sm"
              className="gap-2 px-3"
              onClick={() => navigate('/home')}
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </Button>
      
          </div>
        </div>
      </Card>

      {/* Tabela com os usuários do Backoffice */}
      <div className="rounded-xl border border-border bg-surface p-5">
        <CrudTable
          data={data}
          fields={fields}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onCreate={handleCreate}
          entityLabel="usuário"
        />
      </div>
    </section>
  );
}