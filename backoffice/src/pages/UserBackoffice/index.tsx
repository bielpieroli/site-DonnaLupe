import { CrudTable, type CrudField } from "@/components/CrudTable";
import type { CrudItemType } from "@/types/CrudItem";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "@/components/core/Button";
import Card from "@/components/core/Card";
import { ArrowLeft, UserCog } from "lucide-react";
import { MOCK_USERS } from "@/mocks/users";

const fields: CrudField[] = [
  { value: "name", label: "Nome", type: "text" },
  { value: "email", label: "E-mail", type: "text" },
];

export default function UsersCRUD() {
  const navigate = useNavigate();
  const [data, setData] = useState<CrudItemType[]>(MOCK_USERS);

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
            Cadastro de Usuários do Backoffice
          </h1>
          <p className="mt-1 text-muted">
            Cadastre e mantenha os usuários do backoffice. A atribuição de acesso R e RW por recurso é feita na seção de permissões.
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