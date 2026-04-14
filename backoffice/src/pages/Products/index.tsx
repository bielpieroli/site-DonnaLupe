import { CrudTable } from "@/components/CrudTable";
import type { CrudItemType } from "@/types/CrudItem";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "@/components/core/Button";
import Card from "@/components/core/Card";
import { ShoppingCart, ArrowLeft } from "lucide-react";
import { MOCK_PRODUCTS } from "@/mocks/products";
import { PRODUCT_FIELDS } from "@/data/crudFields";

export default function Products() {
  const navigate = useNavigate();
  const [data, setData] = useState<CrudItemType[]>(MOCK_PRODUCTS);

  const handleEdit = (item: CrudItemType) => {
    setData(prev => prev.map(i => i.id === item.id ? item : i));
  };
  const handleDelete = (id: string) => setData(data => data.filter(i => i.id !== id));
  const handleCreate = (item: CrudItemType) => setData(data => [...data, { ...item, id: String(Date.now()) }]);

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-8 md:px-6 md:py-10 space-y-6">
      {/* Header card situando a página em que está */}
      <Card className="relative overflow-hidden border-border bg-panel-gradient">
        <div className="pointer-events-none absolute top-0 right-0 h-72 w-72 rounded-full bg-accent-orb blur-3xl" />
        <div className="pb-4 p-6">
          <div className="flex items-center gap-2 mb-2">
            <ShoppingCart className="h-4 w-4 text-primary" />
            <p className="text-sm font-extrabold uppercase tracking-[0.3em] text-text/70">Produtos</p>
          </div>
          <h1 className="font-display text-2xl font-semibold text-text-h md:text-3xl">
            Gerenciamento de Produtos
          </h1>
          <p className="mt-1 text-muted">
            Cadastre, busque, edite e remova produtos de venda individual e de coffee.
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

      {/* Tabela de Produtos */}
      <div className="rounded-xl border border-border bg-surface p-5">
        <CrudTable
          data={data}
          fields={PRODUCT_FIELDS}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onCreate={handleCreate}
          entityLabel="produto"
        />
      </div>
    </section>
  );
} 