import type { CrudItemType } from "@/types/CrudItem";
import Button from "@/components/core/Button";
import Input from "@/components/core/Input";
import Select from "@/components/core/Select";
import Modal from "@/components/core/Modal";
import Badge from "@/components/core/Badge";
import { useState, useMemo } from "react";
import {
  ChevronDown, ChevronUp, ChevronsUpDown, Search, Plus, Pencil, Trash2, X,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Check,
} from "lucide-react";

export interface CrudField {
  value: string;
  label: string;
  type?: "text" | "password" | "textarea" | "select" | "badge" | "date" | "number" | "multivalue" | "image";
  badgeVariants?: Record<string, string>;
  options?: string[];
  multiValueOptions?: string[];
}

export interface CrudTableProps {
  data: CrudItemType[];
  fields: CrudField[];
  /** Override fields shown in the create modal. Falls back to `fields`. */
  createFields?: CrudField[];
  /** Override fields shown in the edit modal. Falls back to `fields`. */
  editFields?: CrudField[];
  onEdit: (item: CrudItemType) => void;
  onDelete: (id: string) => void;
  onCreate?: (item: CrudItemType) => void;
  entityLabel?: string;
  defaultPageSize?: number;
  /** Hides all write actions (create, edit, delete). Use for read-only users. */
  readOnly?: boolean;
}

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

export function CrudTable({
  data,
  fields,
  createFields,
  editFields,
  onEdit,
  onDelete,
  onCreate,
  entityLabel = "item",
  defaultPageSize = 10,
  readOnly = false,
}: CrudTableProps) {
  const resolvedCreateFields = createFields ?? fields;
  const resolvedEditFields = editFields ?? fields;
  type FormValue = string | string[];

  const isPreviewableImage = (value: string) =>
    value.startsWith("data:image/") || value.startsWith("http://") || value.startsWith("https://") || value.startsWith("/");

  const readImageFile = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result ?? ""));
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });

  const handleImageChange = async (fieldValue: string, file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    const dataUrl = await readImageFile(file);
    setFormData((d) => ({ ...d, [fieldValue]: dataUrl }));
  };

  const [filter, setFilter] = useState("");
  const [filterField, setFilterField] = useState(fields[0]?.value ?? "name");
  const [sortField, setSortField] = useState(fields[0]?.value ?? "name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<CrudItemType | null>(null);
  const [formData, setFormData] = useState<Record<string, FormValue>>({});

  const normalizeToStringArray = (value: unknown): string[] => {
    if (Array.isArray(value)) return value.map((v) => String(v));
    if (typeof value === "string") {
      return value
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean);
    }
    return [];
  };

  const formatForCompare = (value: unknown): string => {
    if (Array.isArray(value)) return value.map((v) => String(v)).join(", ");
    return String(value ?? "");
  };

  const toggleMultiValue = (fieldValue: string, option: string) => {
    setFormData((prev) => {
      const current = normalizeToStringArray(prev[fieldValue]);
      const exists = current.includes(option);
      const next = exists ? current.filter((v) => v !== option) : [...current, option];
      return { ...prev, [fieldValue]: next };
    });
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(o => (o === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
    setPage(1);
  };

  const handleFilterChange = (value: string) => {
    setFilter(value);
    setPage(1);
  };

  const handleFilterFieldChange = (value: string) => {
    setFilterField(value);
    setFilter("");
    setPage(1);
  };

  const filteredAll = useMemo(() => {
    let result = [...data];
    if (filter.trim()) {
      result = result.filter(item => {
        const val = formatForCompare((item as Record<string, unknown>)[filterField]).toLowerCase();
        return val.includes(filter.toLowerCase());
      });
    }
    result.sort((a, b) => {
      const aVal = (a as any)[sortField];
      const bVal = (b as any)[sortField];

      const direction = sortOrder === "asc" ? 1 : -1;

      // tenta número
      if (typeof aVal === "number" && typeof bVal === "number") {
        const numA = Number(String(aVal).replace(/[^0-9.-]+/g, ""));
        const numB = Number(String(bVal).replace(/[^0-9.-]+/g, ""));
        if (!Number.isNaN(numA) && !Number.isNaN(numB)) {
          return (numA - numB) * direction;
        }
      }

      // tenta data
      if (aVal instanceof Date && bVal instanceof Date) {
        return (aVal.getTime() - bVal.getTime()) * direction;
      }

      // fallback string
      return formatForCompare(aVal).localeCompare(formatForCompare(bVal), "pt-BR", { numeric: true }) * direction;
    });

  return result;
  }, [data, filter, filterField, sortField, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(filteredAll.length / pageSize));
  const safePage = Math.min(page, totalPages);

  const paginated = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filteredAll.slice(start, start + pageSize);
  }, [filteredAll, safePage, pageSize]);

  const openEdit = (item: CrudItemType) => {
    setSelectedItem(item);
    const fd: Record<string, FormValue> = {};
    resolvedEditFields.forEach((f) => {
      const raw = (item as Record<string, unknown>)[f.value];
      fd[f.value] = f.type === "multivalue" ? normalizeToStringArray(raw) : String(raw ?? "");
    });
    setFormData(fd);
    setEditOpen(true);
  };

  const openDelete = (item: CrudItemType) => {
    setSelectedItem(item);
    setDeleteOpen(true);
  };

  const openCreate = () => {
    const fd: Record<string, FormValue> = {};
    resolvedCreateFields.forEach((f) => {
      fd[f.value] = f.type === "multivalue" ? [] : "";
    });
    setFormData(fd);
    setCreateOpen(true);
  };

  const SortIcon = ({ field }: { field: string }) => {
    if (sortField !== field) return <ChevronsUpDown className="inline ml-1 w-3.5 h-3.5 opacity-30" />;
    return sortOrder === "asc"
      ? <ChevronUp className="inline ml-1 w-3.5 h-3.5 text-primary" />
      : <ChevronDown className="inline ml-1 w-3.5 h-3.5 text-primary" />;
  };

  const renderCell = (item: CrudItemType, field: CrudField) => {
    const raw = (item as Record<string, unknown>)[field.value];
    const val = String(raw ?? "—");

    if (field.type === "multivalue") {
      const values = normalizeToStringArray(raw);
      if (!values.length) return <span className="text-muted">—</span>;
      return (
        <div className="flex flex-wrap gap-1.5">
          {values.map((entry) => (
            <Badge key={`${field.value}-${entry}`} className="px-2 py-0.5 text-xs font-medium bg-secondary-contrast/30 text-text">
              {entry}
            </Badge>
          ))}
        </div>
      );
    }

    if ((field.type === "badge" || field.type === "select") && field.badgeVariants) {
      const cls = field.badgeVariants[val] ?? "bg-surface text-text";
      return <Badge className={`text-xs font-medium px-2 py-0.5 ${cls}`}>{val}</Badge>;
    }

    if (field.type === "image") {
      if (!val || val === "—") return <span className="text-muted">—</span>;
      if (!isPreviewableImage(val)) return <span className="text-text">{val}</span>;
      return (
        <img
          src={val}
          alt={item.name ? `Imagem de ${item.name}` : field.label}
          className="h-12 w-12 rounded-lg border border-border object-cover"
        />
      );
    }

    return <span className="text-text">{val}</span>;
  };

  const getFieldOptions = (field: CrudField) => field.options ?? Object.keys(field.badgeVariants ?? {});

  const startItem = filteredAll.length === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const endItem = Math.min(safePage * pageSize, filteredAll.length);

  const getPageNumbers = (): (number | "...")[] => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages: (number | "...")[] = [1];
    if (safePage > 3) pages.push("...");
    for (let i = Math.max(2, safePage - 1); i <= Math.min(totalPages - 1, safePage + 1); i++) {
      pages.push(i);
    }
    if (safePage < totalPages - 2) pages.push("...");
    pages.push(totalPages);
    return pages;
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="flex gap-2 flex-1 w-full">
          <Select value={filterField} onChange={(e) => handleFilterFieldChange(e.target.value)} className="w-40">
            {fields.map(f => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </Select>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
            <Input
              placeholder={`Filtrar por ${fields.find(f => f.value === filterField)?.label ?? "campo"}…`}
              value={filter}
              onChange={e => handleFilterChange(e.target.value)}
              className="pl-9 pr-9"
            />
            {filter && (
              <button
                onClick={() => handleFilterChange("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-text"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
        {!readOnly && onCreate && (
          <Button
            onClick={openCreate}
            className="shrink-0"
          >
            <Plus className="w-4 h-4" />
            Novo(a) {entityLabel}
          </Button>
        )}
      </div>

      {/* Paginação */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
        {/* Info + Quantidade por página */}
        <div className="flex items-center gap-3 text-xs text-muted">
          <span>
            {filteredAll.length === 0
              ? "Nenhum registro"
              : `${startItem} - ${endItem} de ${filteredAll.length} registro${filteredAll.length !== 1 ? "s" : ""}`}
            {filter && filteredAll.length !== data.length && (
              <span className="ml-1">(filtrado de {data.length})</span>
            )}
          </span>
          <div className="flex items-center gap-1.5">
            <span>Por página:</span>
            <Select
              className="h-8 w-16 rounded-lg px-2 text-xs"
              value={String(pageSize)}
              onChange={v => { setPageSize(Number(v.target.value)); setPage(1); }}
            >
              {PAGE_SIZE_OPTIONS.map(n => (
                <option key={n} value={String(n)}>{n}</option>
              ))}
            </Select>
          </div>
        </div>

        {/* Números Paginação */}
        {totalPages > 1 && (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPage(1)}
              disabled={safePage === 1}
              className="h-8 w-8 rounded-lg p-0 text-muted disabled:opacity-30"
              title="Primeira página"
            >
              <ChevronsLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={safePage === 1}
              className="h-8 w-8 rounded-lg p-0 text-muted disabled:opacity-30"
              title="Página anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

            {getPageNumbers().map((p, i) =>
              p === "..." ? (
                <span key={`ellipsis-${i}`} className="w-8 select-none text-center text-sm text-muted">
                  ···
                </span>
              ) : (
                <Button
                  key={p}
                  variant="ghost"
                  size="sm"
                  onClick={() => setPage(p as number)}
                  className={`h-8 w-8 p-0 rounded-lg text-sm transition-all ${
                    safePage === p
                      ? "bg-primary text-primary-contrast font-semibold"
                      : "text-muted"
                  }`}
                >
                  {p}
                </Button>
              )
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              className="h-8 w-8 rounded-lg p-0 text-muted disabled:opacity-30"
              title="Próxima página"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPage(totalPages)}
              disabled={safePage === totalPages}
              className="h-8 w-8 rounded-lg p-0 text-muted disabled:opacity-30"
              title="Última página"
            >
              <ChevronsRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-border">
        <div className="overflow-x-auto">
          <table className="w-full min-w-215 border-collapse">
            <thead>
              <tr className="bg-surface/95">
              {fields.map(f => (
                <th
                  key={f.value}
                  className="cursor-pointer select-none border-b border-border px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted"
                  onClick={() => handleSort(f.value)}
                >
                  {f.label}
                  <SortIcon field={f.value} />
                </th>
              ))}
              {!readOnly && <th className="w-24 border-b border-border px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">Ações</th>}
              </tr>
            </thead>
            <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={fields.length + 1} className="py-12 text-center text-muted">
                  <div className="flex flex-col items-center gap-2">
                    <Search className="w-8 h-8 opacity-30" />
                    <p>Nenhum resultado encontrado</p>
                    {filter && (
                      <button onClick={() => handleFilterChange("")} className="text-sm text-primary">
                        Limpar filtro
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              paginated.map((item, i) => (
                <tr
                  key={item.id}
                  className={`transition-colors ${
                    i % 2 === 0 ? "bg-transparent" : "bg-secondary/10"
                  }`}
                >
                  {fields.map(f => (
                    <td key={f.value} className="border-b border-border px-4 py-3">
                      {renderCell(item, f)}
                    </td>
                  ))}
                  {!readOnly && (
                    <td className="border-b border-border px-4 py-3">
                      <div className="flex gap-1.5">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openEdit(item)}
                          className="h-10 w-10 rounded-lg p-0 text-muted"
                          title="Editar"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openDelete(item)}
                          className="h-10 w-10 rounded-lg p-0 text-muted"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
            </tbody>
          </table>
        </div>
      </div>



      {/* Create Dialog */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title={`Novo ${entityLabel}`} widthClassName="max-w-2xl">
          <div className="grid gap-4 py-2 sm:grid-cols-2">
            {resolvedCreateFields.map(f => (
              <div key={f.value} className={`space-y-1.5 ${f.type === "textarea" ? "sm:col-span-2" : ""}`}>
                <label htmlFor={`create-${f.value}`} className="text-sm text-muted mr-2">{f.label}</label>
                {f.type === "badge" || f.type === "select" ? (
                  <Select
                    id={`create-${f.value}`}
                    value={formData[f.value] ?? ""}
                    onChange={v => setFormData(d => ({ ...d, [f.value]: v.target.value }))}
                    className="w-full"
                  >
                    <option value="">Selecionar {f.label}</option>
                    {getFieldOptions(f).map(v => (
                      <option key={v} value={v}>{v}</option>
                    ))}
                  </Select>
                ) : f.type === "multivalue" ? (
                  <div className="rounded-xl p-2.5">
                    {f.multiValueOptions && f.multiValueOptions.length > 0 ? (
                      <div className="grid gap-2 max-h-40 overflow-y-auto pr-1">
                        {f.multiValueOptions.map((option) => {
                          const selected = normalizeToStringArray(formData[f.value]).includes(option);
                          return (
                            <label key={option} className="flex items-center gap-2 text-sm text-text">
                              <input
                                type="checkbox"
                                checked={selected}
                                onChange={() => toggleMultiValue(f.value, option)}
                                className="peer sr-only"
                              />
                              <span className="flex h-5 w-5 items-center justify-center rounded-md border border-primary bg-surface transition-all duration-150 peer-checked:border-primary peer-checked:bg-primary peer-focus-visible:ring-2 peer-focus-visible:ring-primary/40">
                                <Check className="h-3.5 w-3.5 text-primary-contrast opacity-0 transition-opacity duration-150 peer-checked:opacity-100" />
                              </span>
                              <span>{option}</span>
                            </label>
                          );
                        })}
                      </div>
                    ) : (
                      <Input
                        id={`create-${f.value}`}
                        value={normalizeToStringArray(formData[f.value]).join(", ")}
                        onChange={(e) =>
                          setFormData((d) => ({
                            ...d,
                            [f.value]: e.target.value
                              .split(",")
                              .map((v) => v.trim())
                              .filter(Boolean),
                          }))
                        }
                        placeholder="Separe por vírgula"
                      />
                    )}
                  </div>
                ) : f.type === "image" ? (
                  <div className="space-y-2">
                    <Input
                      id={`create-${f.value}`}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageChange(f.value, e.target.files?.[0])}
                    />
                    {typeof formData[f.value] === "string" && formData[f.value] && (
                      isPreviewableImage(String(formData[f.value])) ? (
                        <img
                          src={String(formData[f.value])}
                          alt={`Preview de ${f.label}`}
                          className="h-24 w-24 rounded-lg border border-border object-cover"
                        />
                      ) : (
                        <p className="text-xs text-muted">{String(formData[f.value])}</p>
                      )
                    )}
                  </div>
                ) : (
                  f.type === "textarea" ? (
                    <textarea
                      id={`create-${f.value}`}
                      value={String(formData[f.value] ?? "")}
                      onChange={e => setFormData(d => ({ ...d, [f.value]: e.target.value }))}
                      rows={5}
                      className="min-h-28 w-full resize-y rounded-lg border border-border bg-surface px-3 py-2 text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  ) : (
                    <Input
                      id={`create-${f.value}`}
                      type={f.type === "password" ? "password" : "text"}
                      value={String(formData[f.value] ?? "")}
                      onChange={e => setFormData(d => ({ ...d, [f.value]: e.target.value }))}
                    />
                  )
                )}
              </div>
            ))}
          </div>
          <div className="mt-5 flex flex-wrap justify-end gap-2">
            <Button variant="ghost" onClick={() => setCreateOpen(false)}>Cancelar</Button>
            <Button
              onClick={() => {
                if (onCreate) onCreate({ id: "", name: formData["name"] ?? "", ...formData } as CrudItemType);
                setCreateOpen(false);
              }}
            >
              Criar
            </Button>
          </div>
      </Modal>

      {/* Edit Dialog */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)} title={`Editar ${entityLabel}`} widthClassName="max-w-2xl">
          <div className="grid gap-4 py-2 sm:grid-cols-2">
            {resolvedEditFields.map(f => (
              <div key={f.value} className={`space-y-1.5 ${f.type === "textarea" ? "sm:col-span-2" : ""}`}>
                <label htmlFor={`edit-${f.value}`} className="text-sm text-muted mr-2">{f.label}</label>
                {f.type === "badge" || f.type === "select" ? (
                  <Select
                    id={`edit-${f.value}`}
                    value={formData[f.value] ?? ""}
                    onChange={v => setFormData(d => ({ ...d, [f.value]: v.target.value }))}
                    className="w-full"
                  >
                    <option value="">Selecionar {f.label}</option>
                    {getFieldOptions(f).map(v => (
                      <option key={v} value={v}>{v}</option>
                    ))}
                  </Select>
                ) : f.type === "multivalue" ? (
                  <div className="rounded-xl p-2.5">
                    {f.multiValueOptions && f.multiValueOptions.length > 0 ? (
                      <div className="grid gap-2 max-h-40 overflow-y-auto pr-1">
                        {f.multiValueOptions.map((option) => {
                          const selected = normalizeToStringArray(formData[f.value]).includes(option);
                          return (
                            <label key={option} className="flex items-center gap-2 text-sm text-text">
                              <input
                                type="checkbox"
                                checked={selected}
                                onChange={() => toggleMultiValue(f.value, option)}
                                className="peer sr-only"
                              />
                              <span className="flex h-5 w-5 items-center justify-center rounded-md border border-primary bg-surface transition-all duration-150 peer-checked:border-primary peer-checked:bg-primary peer-focus-visible:ring-2 peer-focus-visible:ring-primary/40">
                                <Check className="h-3.5 w-3.5 text-primary-contrast opacity-0 transition-opacity duration-150 peer-checked:opacity-100" />
                              </span>
                              <span>{option}</span>
                            </label>
                          );
                        })}
                      </div>
                    ) : (
                      <Input
                        value={normalizeToStringArray(formData[f.value]).join(", ")}
                        onChange={(e) =>
                          setFormData((d) => ({
                            ...d,
                            [f.value]: e.target.value
                              .split(",")
                              .map((v) => v.trim())
                              .filter(Boolean),
                          }))
                        }
                        placeholder="Separe por vírgula"
                      />
                    )}
                  </div>
                ) : f.type === "image" ? (
                  <div className="space-y-2">
                    <Input
                      id={`edit-${f.value}`}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageChange(f.value, e.target.files?.[0])}
                    />
                    {typeof formData[f.value] === "string" && formData[f.value] && (
                      isPreviewableImage(String(formData[f.value])) ? (
                        <img
                          src={String(formData[f.value])}
                          alt={`Preview de ${f.label}`}
                          className="h-24 w-24 rounded-lg border border-border object-cover"
                        />
                      ) : (
                        <p className="text-xs text-muted">{String(formData[f.value])}</p>
                      )
                    )}
                  </div>
                ) : (
                  f.type === "textarea" ? (
                    <textarea
                      id={`edit-${f.value}`}
                      value={String(formData[f.value] ?? "")}
                      onChange={e => setFormData(d => ({ ...d, [f.value]: e.target.value }))}
                      rows={5}
                      className="min-h-28 w-full resize-y rounded-lg border border-border bg-surface px-3 py-2 text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  ) : (
                    <Input
                      id={`edit-${f.value}`}
                      type={f.type === "password" ? "password" : "text"}
                      value={String(formData[f.value] ?? "")}
                      onChange={e => setFormData(d => ({ ...d, [f.value]: e.target.value }))}
                    />
                  )
                )}
              </div>
            ))}
          </div>
          <div className="mt-5 flex flex-wrap justify-end gap-2">
            <Button variant="ghost" onClick={() => setEditOpen(false)}>Cancelar</Button>
            <Button
              onClick={() => {
                if (selectedItem) onEdit({ ...selectedItem, ...formData } as CrudItemType);
                setEditOpen(false);
              }}
            >
              Salvar alterações
            </Button>
          </div>
      </Modal>

      {/* Delete Dialog */}
      <Modal open={deleteOpen} onClose={() => setDeleteOpen(false)} title="Confirmar exclusão" widthClassName="max-w-sm">
          <p className="py-2 text-sm text-muted">
            Tem certeza que deseja excluir{" "}
            <span className="font-medium text-text-h">"{selectedItem?.name}"</span>? Esta ação não pode ser desfeita.
          </p>
          <div className="mt-5 flex flex-wrap justify-end gap-2">
            <Button variant="ghost" onClick={() => setDeleteOpen(false)}>Cancelar</Button>
            <Button
              variant="danger"
              onClick={() => {
                if (selectedItem) onDelete(selectedItem.id);
                setDeleteOpen(false);
              }}
            >
              Excluir
            </Button>
          </div>
      </Modal>
    </div>
  );
}
