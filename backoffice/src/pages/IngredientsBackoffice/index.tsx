import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Package, TriangleAlert, Wheat } from "lucide-react";
import Button from "@/components/core/Button";
import Card from "@/components/core/Card";
import { CrudTable } from "@/components/CrudTable";
import Notification from "@/components/Notification";
import { ingredientsAPI, type Ingredient } from "@/api/ingredients";
import {
  INGREDIENT_CREATE_FIELDS,
  INGREDIENT_EDIT_FIELDS,
  INGREDIENT_FIELDS,
} from "@/data/crudFields";
import { useAuth, useHasPermission } from "@/contexts/AuthContext";
import { apiMsg } from "@/lib/formatting";
import type { CrudItemType } from "@/types/CrudItem";

const LOW_STOCK_THRESHOLD = 5;

type IngredientRow = CrudItemType & Ingredient & {
  stock_status: "OK" | "Baixo estoque" | "Esgotado";
};

function toNumber(value: unknown): number {
  if (typeof value === "number") return value;
  const parsed = Number(String(value ?? "").replace(",", "."));
  return Number.isFinite(parsed) ? parsed : 0;
}

function stockStatus(stock: number): IngredientRow["stock_status"] {
  if (stock <= 0) return "Esgotado";
  if (stock <= LOW_STOCK_THRESHOLD) return "Baixo estoque";
  return "OK";
}

function toRow(ingredient: Ingredient): IngredientRow {
  return {
    id: ingredient.name,
    name: ingredient.name,
    stock: ingredient.stock,
    unit: ingredient.unit,
    value_reais: ingredient.value_reais,
    stock_status: stockStatus(ingredient.stock),
  };
}

export default function IngredientsBackoffice() {
  const navigate = useNavigate();
  const canWrite = useHasPermission("ingredients", "write");
  const { ensurePermission } = useAuth();
  const [data, setData] = useState<IngredientRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<{ message: string; type: "success" | "warning" }>({
    message: "",
    type: "success",
  });

  const notify = (message: string, type: "success" | "warning" = "success") =>
    setNotification({ message, type });

  const fetchIngredients = useCallback(async () => {
    try {
      setLoading(true);
      const res = await ingredientsAPI.getAll();
      setData((res.ingredients ?? []).map(toRow));
    } catch (err) {
      notify(apiMsg(err, "Erro ao carregar ingredientes."), "warning");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIngredients();
  }, [fetchIngredients]);

  const lowStock = useMemo(
    () => data.filter((item) => item.stock_status !== "OK"),
    [data],
  );

  async function handleCreate(item: CrudItemType) {
    const row = item as IngredientRow;
    try {
      if (!(await ensurePermission("ingredients", "write"))) {
        notify("Você não tem permissão para criar ingredientes.", "warning");
        return;
      }
      const res = await ingredientsAPI.create({
        name: String(row.name ?? "").trim(),
        stock: toNumber(row.stock),
        unit: String(row.unit ?? "un").trim() || "un",
        value_reais: toNumber(row.value_reais),
      });
      setData((prev) => [...prev, toRow(res.ingredient)].sort((a, b) => a.name.localeCompare(b.name)));
      notify("Ingrediente criado com sucesso!");
    } catch (err) {
      notify(apiMsg(err, "Erro ao criar ingrediente."), "warning");
    }
  }

  async function handleEdit(item: CrudItemType) {
    const row = item as IngredientRow;
    try {
      if (!(await ensurePermission("ingredients", "write"))) {
        notify("Você não tem permissão para editar ingredientes.", "warning");
        return;
      }
      const res = await ingredientsAPI.update(row.id, {
        stock: toNumber(row.stock),
        unit: String(row.unit ?? "un").trim() || "un",
        value_reais: toNumber(row.value_reais),
      });
      setData((prev) => prev.map((entry) => (entry.id === row.id ? toRow(res.ingredient) : entry)));
      notify("Ingrediente atualizado com sucesso!");
    } catch (err) {
      notify(apiMsg(err, "Erro ao atualizar ingrediente."), "warning");
    }
  }

  async function handleDelete(id: string) {
    try {
      if (!(await ensurePermission("ingredients", "write"))) {
        notify("Você não tem permissão para remover ingredientes.", "warning");
        return;
      }
      await ingredientsAPI.delete(id);
      setData((prev) => prev.filter((entry) => entry.id !== id));
      notify("Ingrediente removido com sucesso!");
    } catch (err) {
      notify(apiMsg(err, "Erro ao remover ingrediente."), "warning");
    }
  }

  return (
    <section className="mx-auto w-full max-w-7xl space-y-6 px-4 py-8 md:px-6 md:py-10">
      <Card className="relative overflow-hidden border-border bg-panel-gradient">
        <div className="pointer-events-none absolute right-0 top-0 h-72 w-72 rounded-full bg-accent-orb blur-3xl" />
        <div className="p-6 pb-4">
          <div className="mb-2 flex items-center gap-2">
            <Wheat className="h-4 w-4 text-primary" />
            <p className="text-sm font-extrabold uppercase tracking-[0.3em] text-text/70">Ingredientes</p>
          </div>
          <h1 className="font-display text-2xl font-semibold text-text-h md:text-3xl">
            Estoque de Ingredientes
          </h1>
          <p className="mt-1 text-muted">
            Cadastre ingredientes, acompanhe estoque e visualize alertas quando a quantidade estiver baixa.
          </p>
        </div>
        <div className="px-6 pb-6">
          <Button variant="secondary" size="sm" className="gap-2 px-3" onClick={() => navigate("/home")}>
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="flex items-center gap-4 p-4">
          <div className="rounded-xl bg-primary/10 p-3">
            <Package className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted">Ingredientes</p>
            <p className="text-xl font-bold text-text-h">{data.length}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4 p-4 sm:col-span-2">
          <div className="rounded-xl bg-yellow-100 p-3">
            <TriangleAlert className="h-5 w-5 text-yellow-700" />
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted">Alertas de estoque</p>
            <p className="text-sm font-semibold text-text-h">
              {lowStock.length === 0
                ? "Nenhum ingrediente com estoque baixo."
                : `${lowStock.length} ingrediente${lowStock.length > 1 ? "s" : ""} precisa${lowStock.length > 1 ? "m" : ""} de atenção.`}
            </p>
            {lowStock.length > 0 && (
              <p className="mt-1 text-xs text-muted">
                Limite atual: estoque menor ou igual a {LOW_STOCK_THRESHOLD}.
              </p>
            )}
          </div>
        </Card>
      </div>

      <div className="rounded-xl border border-border bg-surface p-5">
        {loading ? (
          <p className="py-12 text-center text-muted">Carregando ingredientes...</p>
        ) : (
          <CrudTable
            data={data}
            fields={INGREDIENT_FIELDS}
            createFields={INGREDIENT_CREATE_FIELDS}
            editFields={INGREDIENT_EDIT_FIELDS}
            onCreate={handleCreate}
            onEdit={handleEdit}
            onDelete={handleDelete}
            entityLabel="ingrediente"
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
