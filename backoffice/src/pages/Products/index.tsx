import { CrudTable } from "@/components/CrudTable";
import type { CrudItemType } from "@/types/CrudItem";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "@/components/core/Button";
import Card from "@/components/core/Card";
import { ShoppingCart, ArrowLeft } from "lucide-react";
import { PRODUCT_FIELDS } from "@/data/crudFields";
import Notification from "@/components/Notification";
import { productsAPI, type Product, type ProductInput } from "@/api/products";
import { apiMsg } from "@/lib/formatting";
import { useAuth, useHasPermission } from "@/contexts/AuthContext";

type ProductRow = CrudItemType & Omit<Product, "id">;

function toRow(product: Product): ProductRow {
  return {
    ...product,
    id: String(product.id),
  } as ProductRow;
}

function toNumber(value: unknown): number {
  const parsed = Number(String(value ?? "0").replace(",", "."));
  return Number.isFinite(parsed) ? parsed : 0;
}

function toInput(item: CrudItemType): ProductInput {
  const row = item as ProductRow;
  return {
    name: String(row.name ?? "").trim(),
    subtitle: String(row.subtitle ?? ""),
    kind: String(row.kind ?? "Shopping") as ProductInput["kind"],
    category: String(row.category ?? ""),
    description: String(row.description ?? ""),
    priceValue: toNumber(row.priceValue),
    weight: String(row.weight ?? ""),
    ingredientsText: String(row.ingredientsText ?? ""),
    allergens: String(row.allergens ?? ""),
    badge: String(row.badge ?? ""),
    image: String(row.image ?? ""),
    stock: toNumber(row.stock),
    flavor: String(row.flavor ?? ""),
    unit: String(row.unit ?? ""),
    sizesText: String(row.sizesText ?? ""),
    sizeCountsText: String(row.sizeCountsText ?? ""),
    status: String(row.status ?? "Disponível"),
  };
}

export default function Products() {
  const navigate = useNavigate();
  const canWrite = useHasPermission("products", "write");
  const { ensurePermission } = useAuth();
  const [data, setData] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<{ message: string; type: "success" | "warning" }>({
    message: "",
    type: "success",
  });

  const notify = (message: string, type: "success" | "warning" = "success") =>
    setNotification({ message, type });

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await productsAPI.getAll();
      setData((res.products ?? []).map(toRow));
    } catch (err) {
      notify(apiMsg(err, "Erro ao carregar produtos."), "warning");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleEdit = async (item: CrudItemType) => {
    try {
      if (!(await ensurePermission("products", "write"))) {
        notify("Você não tem permissão para editar produtos.", "warning");
        return;
      }
      const res = await productsAPI.update(Number(item.id), toInput(item));
      setData(prev => prev.map(i => i.id === item.id ? toRow(res.product) : i));
      notify("Produto atualizado com sucesso!");
    } catch (err) {
      notify(apiMsg(err, "Erro ao atualizar produto."), "warning");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      if (!(await ensurePermission("products", "write"))) {
        notify("Você não tem permissão para remover produtos.", "warning");
        return;
      }
      await productsAPI.delete(Number(id));
      setData(data => data.filter(i => i.id !== id));
      notify("Produto removido com sucesso!");
    } catch (err) {
      notify(apiMsg(err, "Erro ao remover produto."), "warning");
    }
  };

  const handleCreate = async (item: CrudItemType) => {
    try {
      if (!(await ensurePermission("products", "write"))) {
        notify("Você não tem permissão para criar produtos.", "warning");
        return;
      }
      const res = await productsAPI.create(toInput(item));
      setData(data => [...data, toRow(res.product)]);
      notify("Produto criado com sucesso!");
    } catch (err) {
      notify(apiMsg(err, "Erro ao criar produto."), "warning");
    }
  };

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
        {loading ? (
          <p className="py-12 text-center text-muted">Carregando produtos...</p>
        ) : (
          <CrudTable
            data={data}
            fields={PRODUCT_FIELDS}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onCreate={handleCreate}
            entityLabel="produto"
            readOnly={!canWrite}
          />
        )}
      </div>

      <Notification
        message={notification.message}
        type={notification.type}
        visible={Boolean(notification.message)}
        onClose={() => setNotification((n) => ({ ...n, message: "" }))}
      />
    </section>
  );
} 
