import { CrudTable } from "@/components/CrudTable";
import type { CrudItemType } from "@/types/CrudItem";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "@/components/core/Button";
import Card from "@/components/core/Card";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { MOCK_PERMISSIONS } from "@/mocks/permissions";
import { PERMISSION_FIELDS } from "@/data/crudFields";

export default function PermissionsCRUD() {
  const navigate = useNavigate();
  const [data, setData] = useState<CrudItemType[]>(MOCK_PERMISSIONS);

  const handleEdit = (item: CrudItemType) => {
    setData((prev) => prev.map((i) => (i.id === item.id ? item : i)));
  };

  const handleDelete = (id: string) => {
    setData((prev) => prev.filter((i) => i.id !== id));
  };

  const handleCreate = (item: CrudItemType) => {
    setData((prev) => [...prev, { ...item, id: String(Date.now()) }]);
  };

  return (
    <section className="mx-auto w-full max-w-7xl space-y-6 px-4 py-8 md:px-6 md:py-10">
      <Card className="relative overflow-hidden border-border bg-panel-gradient">
        <div className="pointer-events-none absolute right-0 top-0 h-72 w-72 rounded-full bg-accent-orb blur-3xl" />
        <div className="p-6 pb-4">
          <div className="mb-2 flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary" />
            <p className="text-sm font-extrabold uppercase tracking-[0.3em] text-text/70">Permissoes</p>
          </div>
          <h1 className="font-display text-2xl font-semibold text-text-h md:text-3xl">
            Catalogo de Permissoes do Backoffice
          </h1>
          <p className="mt-1 text-muted">
            Atribua usuários por permissão, separando quem possui acesso R (somente leitura) e RW (leitura e escrita).
          </p>
        </div>
        <div className="px-6 pb-6">
          <Button
            variant="secondary"
            size="sm"
            className="gap-2 px-3"
            onClick={() => navigate("/home")}
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
        </div>
      </Card>

      <div className="rounded-xl border border-border bg-surface p-5">
        <CrudTable
          data={data}
          fields={PERMISSION_FIELDS}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onCreate={handleCreate}
          entityLabel="permissao"
        />
      </div>
    </section>
  );
}
