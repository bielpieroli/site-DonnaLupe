import { useCallback, useEffect, useState, type Dispatch, type ReactNode, type SetStateAction } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ImagePlus, Pencil, Plus, ShoppingCart, Trash2 } from "lucide-react";
import Button from "@/components/core/Button";
import Card from "@/components/core/Card";
import Input from "@/components/core/Input";
import Modal from "@/components/core/Modal";
import Select from "@/components/core/Select";
import Notification from "@/components/Notification";
import { productsAPI, type Product, type ProductFormInput } from "@/api/products";
import { useHasPermission } from "@/contexts/AuthContext";
import { apiMsg, formatBRL } from "@/lib/formatting";

type FormState = {
  name: string;
  subtitle: string;
  description: string;
  price: string;
  weight: string;
  ingredients: string;
  allergens: string;
  badge: string;
  imageFile: string;
  stock: string;
  category: string;
  status: string;
  img: File | null;
};

const DEFAULT_CATEGORY_OPTIONS = [
  "Classico",
  "Intenso",
  "Cremoso",
  "Frutado",
  "Citrico",
  "Especial",
  "Cookies",
  "Brownies",
  "Salgados",
  "Bolos",
];

const EMPTY_FORM: FormState = {
  name: "",
  subtitle: "",
  description: "",
  price: "",
  weight: "",
  ingredients: "",
  allergens: "",
  badge: "",
  imageFile: "",
  stock: "",
  category: "",
  status: "active",
  img: null,
};

function toFormState(product: Product): FormState {
  return {
    name: product.name,
    subtitle: product.subtitle,
    description: product.description,
    price: String(product.price),
    weight: product.weight,
    ingredients: product.ingredients.join("\n"),
    allergens: product.allergens,
    badge: product.badge,
    imageFile: product.imageFile,
    stock: String(product.stock),
    category: product.category,
    status: product.status,
    img: null,
  };
}

export default function Products() {
  const navigate = useNavigate();
  const canWrite = useHasPermission("products", "write");

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: "success" | "warning" }>({
    message: "",
    type: "success",
  });

  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const categoryOptions = Array.from(
    new Set([...DEFAULT_CATEGORY_OPTIONS, ...products.map((product) => product.category.trim()).filter(Boolean)]),
  ).sort((a, b) => a.localeCompare(b, "pt-BR"));

  const notify = (message: string, type: "success" | "warning" = "success") =>
    setNotification({ message, type });

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await productsAPI.getAll();
      setProducts(res.products ?? []);
    } catch (err) {
      notify(apiMsg(err, "Erro ao carregar produtos."), "warning");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  function openCreate() {
    setForm(EMPTY_FORM);
    setCreateOpen(true);
  }

  function openEdit(product: Product) {
    setForm(toFormState(product));
    setEditTarget(product);
  }

  function buildInput(requireImage: boolean): ProductFormInput | null {
    const price = parseFloat(form.price.replace(",", "."));
    const stock = Number.parseInt(form.stock, 10);
    const ingredients = form.ingredients
      .split(/\n|,|;/)
      .map((item) => item.trim())
      .filter(Boolean);
    if (
      !form.name.trim() ||
      !form.subtitle.trim() ||
      !form.description.trim() ||
      !form.category.trim() ||
      !form.weight.trim() ||
      ingredients.length === 0 ||
      !form.allergens.trim() ||
      !form.badge.trim() ||
      !form.status.trim()
    ) {
      notify("Preencha os campos do catálogo antes de salvar.", "warning");
      return null;
    }
    if (Number.isNaN(price) || price < 0 || Number.isNaN(stock) || stock < 0) {
      notify("Informe preço e estoque válidos.", "warning");
      return null;
    }
    if (requireImage && !form.img) {
      notify("Selecione uma imagem para o produto.", "warning");
      return null;
    }
    return {
      name: form.name.trim(),
      subtitle: form.subtitle.trim(),
      category: form.category.trim(),
      description: form.description.trim(),
      imageFile: form.imageFile.trim() || form.img?.name || "",
      price,
      weight: form.weight.trim(),
      ingredients,
      allergens: form.allergens.trim(),
      badge: form.badge.trim(),
      stock,
      status: form.status.trim(),
      img: form.img,
    };
  }

  async function handleCreate() {
    const input = buildInput(true);
    if (!input) return;
    setSaving(true);
    try {
      const res = await productsAPI.create(input);
      setProducts((prev) => [...prev, res.product].sort((a, b) => a.name.localeCompare(b.name, "pt-BR")));
      notify("Produto criado com sucesso!");
      setCreateOpen(false);
    } catch (err) {
      notify(apiMsg(err, "Erro ao criar produto."), "warning");
    } finally {
      setSaving(false);
    }
  }

  async function handleEdit() {
    if (!editTarget) return;
    const input = buildInput(false);
    if (!input) return;
    setSaving(true);
    try {
      const res = await productsAPI.update(editTarget.name, input);
      setProducts((prev) =>
        prev
          .map((product) => (product.name === editTarget.name ? res.product : product))
          .sort((a, b) => a.name.localeCompare(b.name, "pt-BR")),
      );
      notify("Produto atualizado com sucesso!");
      setEditTarget(null);
    } catch (err) {
      notify(apiMsg(err, "Erro ao atualizar produto."), "warning");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setSaving(true);
    try {
      await productsAPI.delete(deleteTarget.name);
      setProducts((prev) => prev.filter((product) => product.name !== deleteTarget.name));
      notify("Produto desativado.");
      setDeleteTarget(null);
    } catch (err) {
      notify(apiMsg(err, "Erro ao desativar produto."), "warning");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="mx-auto w-full max-w-7xl space-y-6 px-4 py-8 md:px-6 md:py-10">
      <Card className="relative overflow-hidden border-border bg-panel-gradient">
        <div className="pointer-events-none absolute right-0 top-0 h-72 w-72 rounded-full bg-accent-orb blur-3xl" />
        <div className="p-6 pb-4">
          <div className="mb-2 flex items-center gap-2">
            <ShoppingCart className="h-4 w-4 text-primary" />
            <p className="text-sm font-extrabold uppercase tracking-[0.3em] text-text/70">Produtos</p>
          </div>
          <h1 className="font-display text-2xl font-semibold text-text-h md:text-3xl">
            Gerenciamento de Produtos
          </h1>
          <p className="mt-1 text-muted">
            Cadastre, edite e desative produtos exibidos no catálogo público.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 px-6 pb-6">
          <Button variant="secondary" size="sm" className="gap-2 px-3" onClick={() => navigate("/home")}>
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          {canWrite && (
            <Button size="sm" className="gap-2" onClick={openCreate}>
              <Plus className="h-4 w-4" />
              Novo produto
            </Button>
          )}
        </div>
      </Card>

      <div className="rounded-xl border border-border bg-surface p-5">
        {loading ? (
          <p className="py-12 text-center text-muted">Carregando produtos...</p>
        ) : products.length === 0 ? (
          <p className="py-12 text-center text-muted">Nenhum produto ativo cadastrado.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] border-collapse text-sm">
              <thead>
                <tr className="bg-surface/95">
                  <HeaderCell>Imagem</HeaderCell>
                  <HeaderCell>Produto</HeaderCell>
                  <HeaderCell>Categoria</HeaderCell>
                  <HeaderCell>Preço</HeaderCell>
                  <HeaderCell>Peso</HeaderCell>
                  <HeaderCell>Estoque</HeaderCell>
                  <HeaderCell>Selo</HeaderCell>
                  <HeaderCell>Status</HeaderCell>
                  {canWrite && <HeaderCell>Ações</HeaderCell>}
                </tr>
              </thead>
              <tbody>
                {products.map((product, i) => (
                  <tr key={product.name} className={i % 2 === 0 ? "bg-transparent" : "bg-secondary/10"}>
                    <td className="border-b border-border px-4 py-3">
                      <img src={product.img} alt={product.name} className="h-14 w-14 rounded-lg object-cover" />
                    </td>
                    <td className="border-b border-border px-4 py-3">
                      <p className="font-semibold text-text-h">{product.name}</p>
                      <p className="text-xs font-medium text-primary">{product.subtitle}</p>
                      <p className="line-clamp-2 max-w-xs text-xs text-muted">{product.description}</p>
                    </td>
                    <td className="border-b border-border px-4 py-3 text-text">{product.category}</td>
                    <td className="border-b border-border px-4 py-3 font-semibold text-primary">{formatBRL(product.price)}</td>
                    <td className="border-b border-border px-4 py-3 text-text">{product.weight}</td>
                    <td className="border-b border-border px-4 py-3 text-text">{product.stock}</td>
                    <td className="border-b border-border px-4 py-3 text-text">{product.badge}</td>
                    <td className="border-b border-border px-4 py-3 text-text">{product.status}</td>
                    {canWrite && (
                      <td className="border-b border-border px-4 py-3">
                        <div className="flex gap-1.5">
                          <Button size="sm" variant="ghost" className="h-9 w-9 rounded-lg p-0 text-muted" onClick={() => openEdit(product)} title="Editar">
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" className="h-9 w-9 rounded-lg p-0 text-muted hover:text-red-500" onClick={() => setDeleteTarget(product)} title="Desativar">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Novo produto" widthClassName="max-w-3xl">
        <ProductForm form={form} setForm={setForm} categoryOptions={categoryOptions} requireImage />
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setCreateOpen(false)}>Cancelar</Button>
          <Button onClick={handleCreate} disabled={saving}>{saving ? "Salvando..." : "Criar"}</Button>
        </div>
      </Modal>

      <Modal open={editTarget !== null} onClose={() => setEditTarget(null)} title="Editar produto" widthClassName="max-w-3xl">
        <ProductForm form={form} setForm={setForm} categoryOptions={categoryOptions} currentImage={editTarget?.img} />
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setEditTarget(null)}>Cancelar</Button>
          <Button onClick={handleEdit} disabled={saving}>{saving ? "Salvando..." : "Salvar"}</Button>
        </div>
      </Modal>

      <Modal open={deleteTarget !== null} onClose={() => setDeleteTarget(null)} title="Confirmar desativação" widthClassName="max-w-sm">
        <p className="py-2 text-sm text-muted">
          Desativar <span className="font-semibold text-text-h">{deleteTarget?.name}</span>? O produto sairá do catálogo público.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setDeleteTarget(null)}>Cancelar</Button>
          <Button variant="danger" onClick={handleDelete} disabled={saving}>Desativar</Button>
        </div>
      </Modal>

      <Notification
        message={notification.message}
        type={notification.type}
        visible={Boolean(notification.message)}
        onClose={() => setNotification((n) => ({ ...n, message: "" }))}
      />
    </section>
  );
}

function HeaderCell({ children }: { children: ReactNode }) {
  return (
    <th className="border-b border-border px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">
      {children}
    </th>
  );
}

function ProductForm({
  form,
  setForm,
  categoryOptions,
  currentImage,
  requireImage = false,
}: {
  form: FormState;
  setForm: Dispatch<SetStateAction<FormState>>;
  categoryOptions: string[];
  currentImage?: string;
  requireImage?: boolean;
}) {
  const imagePreview = form.img ? URL.createObjectURL(form.img) : currentImage;
  return (
    <div className="grid gap-4 py-2 sm:grid-cols-2">
      <Field label="Nome">
        <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
      </Field>
      <Field label="Subtítulo">
        <Input value={form.subtitle} onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))} placeholder="classico irresistivel" />
      </Field>
      <Field label="Categoria">
        <Input
          value={form.category}
          onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
          list="product-category-options"
          placeholder="Escolha uma categoria existente ou digite uma nova"
        />
        <datalist id="product-category-options">
          {categoryOptions.map((category) => (
            <option key={category} value={category} />
          ))}
        </datalist>
      </Field>
      <Field label="Preço">
        <Input value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} placeholder="12.50" />
      </Field>
      <Field label="Peso">
        <Input value={form.weight} onChange={(e) => setForm((f) => ({ ...f, weight: e.target.value }))} placeholder="120g" />
      </Field>
      <Field label="Estoque">
        <Input value={form.stock} onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))} placeholder="10" />
      </Field>
      <Field label="Selo de destaque">
        <Input
          value={form.badge}
          onChange={(e) => setForm((f) => ({ ...f, badge: e.target.value }))}
          placeholder="Mais vendido, Novo, Edição limitada"
        />
        <p className="text-xs text-muted">Use um rótulo curto para destacar o produto no catálogo.</p>
      </Field>
      <Field label="Arquivo da imagem">
        <Input value={form.imageFile} onChange={(e) => setForm((f) => ({ ...f, imageFile: e.target.value }))} placeholder="cookie-choco-chunk.jpg" />
      </Field>
      <Field label="Status">
        <Select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}>
          <option value="active">active</option>
          <option value="inactive">inactive</option>
        </Select>
      </Field>
      <Field label={requireImage ? "Imagem *" : "Imagem"}>
        <label className="flex h-11 cursor-pointer items-center justify-center gap-2 rounded-lg border border-border bg-surface px-3 text-sm text-text transition hover:bg-primary/10">
          <ImagePlus className="h-4 w-4" />
          {form.img ? form.img.name : "Selecionar arquivo"}
          <input
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(e) => setForm((f) => ({ ...f, img: e.target.files?.[0] ?? null }))}
          />
        </label>
      </Field>
      <div className="space-y-1.5 sm:col-span-2">
        <label className="text-sm text-muted">Descrição</label>
        <textarea
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          rows={3}
          className="min-h-24 w-full resize-y rounded-lg border border-border bg-surface px-3 py-2 text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>
      <div className="space-y-1.5 sm:col-span-2">
        <label className="text-sm text-muted">Ingredientes</label>
        <textarea
          value={form.ingredients}
          onChange={(e) => setForm((f) => ({ ...f, ingredients: e.target.value }))}
          rows={3}
          placeholder="Um ingrediente por linha"
          className="min-h-24 w-full resize-y rounded-lg border border-border bg-surface px-3 py-2 text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>
      <div className="space-y-1.5 sm:col-span-2">
        <label className="text-sm text-muted">Alergênicos</label>
        <Input
          value={form.allergens}
          onChange={(e) => setForm((f) => ({ ...f, allergens: e.target.value }))}
          placeholder="Contém: glúten, leite, ovos"
        />
      </div>
      {imagePreview && (
        <div className="sm:col-span-2">
          <img src={imagePreview} alt="Preview" className="h-40 w-full rounded-xl object-cover" />
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm text-muted">{label}</label>
      {children}
    </div>
  );
}
