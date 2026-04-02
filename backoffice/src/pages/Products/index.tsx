import { CrudTable, type CrudField } from "@/components/CrudTable";
import type { CrudItemType } from "@/types/CrudItem";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "@/components/core/Button";
import Card from "@/components/core/Card";
import { ShoppingCart, ArrowLeft } from "lucide-react";

interface ProductItem extends CrudItemType {
  categoria: string;
  preco: number;
  estoque: number;
  sabor?: string;
  status: string;
}

const sampleProducts: ProductItem[] = [
  { id: "1", name: "Balas Sortidas", categoria: "Balas", preco: 5.50, estoque: 120, sabor: "Frutas", status: "Disponível" },
  { id: "2", name: "Chocolate Meio Amargo 100g", categoria: "Chocolates", preco: 5.90, estoque: 40, sabor: "Meio Amargo", status: "Disponível" },
  { id: "3", name: "Brigadeiro Gourmet (un)", categoria: "Doces", preco: 3.50, estoque: 200, sabor: "Chocolate", status: "Disponível" },
  { id: "4", name: "Pipoca Doce Caramelizada", categoria: "Snacks", preco: 6.00, estoque: 30, sabor: "Caramelo", status: "Em promoção" },
  { id: "5", name: "Biscoito Recheado Morango", categoria: "Biscoitos", preco: 5.21, estoque: 0, sabor: "Morango", status: "Esgotado" },
  { id: "6", name: "Goma de Mascar (pacote)", categoria: "Balas", preco: 5.20, estoque: 300, sabor: "Menta", status: "Disponível" },
  { id: "7", name: "Bombom Sortido 6un", categoria: "Chocolates", preco: 12.00, estoque: 25, sabor: "Sortido", status: "Disponível" },
];

const fields: CrudField[] = [
  { value: "name", label: "Produto", type: "text" },
  { value: "categoria", label: "Categoria", type: "badge", badgeVariants: {
    "Balas": "bg-[#cc6b2f] border border-[#b25b28]",
    "Chocolates": "bg-[#7f56c9] border border-[#6a3fb8]",
    "Biscoitos": "bg-[#d28f2a] border border-[#b37222]",
    "Doces": "bg-[#c44b78] border border-[#9c375f]",
    "Snacks": "bg-[#2fa678] border border-[#248760]",
  }},
  { value: "preco", label: "Preço", type: "text" },
  { value: "estoque", label: "Estoque", type: "text" },
  { value: "sabor", label: "Sabor", type: "text" },
  { value: "status", label: "Status", type: "badge", badgeVariants: {
    "Disponível": "bg-[#059669] border border-[#047857]",
    "Esgotado": "bg-[#ef4444] border border-[#dc2626]",
    "Em promoção": "bg-[#f59e0b] border border-[#d97706]",
  }},
];

export default function Products() {
  const navigate = useNavigate();
  const [data, setData] = useState<CrudItemType[]>(sampleProducts);

  const handleEdit = (item: CrudItemType) => {
    setData(prev => prev.map(i => i.id === item.id ? item : i));
  };
  const handleDelete = (id: string) => setData(data => data.filter(i => i.id !== id));
  const handleCreate = (item: CrudItemType) => setData(data => [...data, { ...item, id: String(Date.now()) }]);

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-8 md:px-6 md:py-10 space-y-6">
      {/* Header card situando a página em que está */}
      <Card className="relative overflow-hidden border-(--border) bg-[linear-gradient(140deg,color-mix(in_oklab,var(--surface)_85%,white_15%),color-mix(in_oklab,var(--secondary)_18%,var(--surface)))]">
        <div className="pointer-events-none absolute top-0 right-0 h-72 w-72 rounded-full bg-[color-mix(in_oklab,var(--accent)_12%,transparent)] blur-3xl" />
        <div className="pb-4 p-6">
          <div className="flex items-center gap-2 mb-2">
            <ShoppingCart className="h-4 w-4 text-(--primary)" />
            <p className="text-sm font-extrabold uppercase tracking-[0.3em] text-(--text)/70">Produtos</p>
          </div>
          <h1 className="text-2xl font-semibold text-(--text-h) md:text-3xl">
            Gerenciamento de Produtos
          </h1>
          <p className="mt-1 text-(--muted)">
            Cadastre, busque, edite e remova produtos da loja de doces.
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
      <div className="rounded-xl border border-(--border) bg-(--surface) p-5">
        <CrudTable
          data={data}
          fields={fields}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onCreate={handleCreate}
          entityLabel="produto"
        />
      </div>
    </section>
  );
} 