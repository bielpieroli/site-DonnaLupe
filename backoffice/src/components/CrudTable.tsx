import type { CrudItemType } from "@/types/CrudItem";
import Button from "@/components/core/Button";
import Input from "@/components/core/Input";
import Select from "@/components/core/Select";
import Modal from "@/components/core/Modal";
import Badge from "@/components/core/Badge";
import { useState, useMemo } from "react";
import {
  ChevronDown, ChevronUp, ChevronsUpDown, Search, Plus, Pencil, Trash2, X,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
} from "lucide-react";

export interface CrudField {
  value: string;
  label: string;
  type?: "text" | "badge" | "date" | "number";
  badgeVariants?: Record<string, string>;
}

export interface CrudTableProps {
  data: CrudItemType[];
  fields: CrudField[];
  onEdit: (item: CrudItemType) => void;
  onDelete: (id: string) => void;
  onCreate?: (item: CrudItemType) => void;
  entityLabel?: string;
  defaultPageSize?: number;
}

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

export function CrudTable({
  data,
  fields,
  onEdit,
  onDelete,
  onCreate,
  entityLabel = "item",
  defaultPageSize = 10,
}: CrudTableProps) {
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
  const [formData, setFormData] = useState<Record<string, string>>({});

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
        const val = String((item as Record<string, unknown>)[filterField] ?? "").toLowerCase();
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
      return String(aVal).localeCompare(String(bVal), "pt-BR", { numeric: true }) * direction;
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
    const fd: Record<string, string> = {};
    fields.forEach(f => { fd[f.value] = String((item as Record<string, unknown>)[f.value] ?? ""); });
    setFormData(fd);
    setEditOpen(true);
  };

  const openDelete = (item: CrudItemType) => {
    setSelectedItem(item);
    setDeleteOpen(true);
  };

  const openCreate = () => {
    const fd: Record<string, string> = {};
    fields.forEach(f => { fd[f.value] = ""; });
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
    const val = String((item as Record<string, unknown>)[field.value] ?? "—");
    if (field.type === "badge" && field.badgeVariants) {
      const cls = field.badgeVariants[val] ?? "bg-surface text-text";
      return <Badge className={`text-xs font-medium px-2 py-0.5 ${cls}`}>{val}</Badge>;
    }
    return <span className="text-text">{val}</span>;
  };

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
        {onCreate && (
          <Button
            onClick={openCreate}
            className="shrink-0"
          >
            <Plus className="w-4 h-4" />
            Novo {entityLabel}
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
              <th className="w-24 border-b border-border px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">Ações</th>
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
                </tr>
              ))
            )}
            </tbody>
          </table>
        </div>
      </div>



      {/* Create Dialog */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title={`Novo ${entityLabel}`} widthClassName="max-w-md">
          <div className="space-y-4 py-2">
            {fields.map(f => (
              <div key={f.value} className="space-y-1.5">
                <label htmlFor={`create-${f.value}`} className="text-sm text-muted mr-2">{f.label}</label>
                {f.type === "badge" && f.badgeVariants ? (
                  <Select value={formData[f.value] ?? ""} onChange={v => setFormData(d => ({ ...d, [f.value]: v.target.value }))}>
                    <option value="">Selecionar {f.label}</option>
                      {Object.keys(f.badgeVariants).map(v => (
                        <option key={v} value={v}>{v}</option>
                      ))}
                  </Select>
                ) : (
                  <Input
                    id={`create-${f.value}`}
                    value={formData[f.value] ?? ""}
                    onChange={e => setFormData(d => ({ ...d, [f.value]: e.target.value }))}
                  />
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
      <Modal open={editOpen} onClose={() => setEditOpen(false)} title={`Editar ${entityLabel}`} widthClassName="max-w-md">
          <div className="space-y-4 py-2">
            {fields.map(f => (
              <div key={f.value} className="space-y-1.5">
                <label className="text-sm text-muted mr-2">{f.label}</label>
                {f.type === "badge" && f.badgeVariants ? (
                  <Select value={formData[f.value] ?? ""} onChange={v => setFormData(d => ({ ...d, [f.value]: v.target.value }))}>
                      {Object.keys(f.badgeVariants).map(v => (
                        <option key={v} value={v}>{v}</option>
                      ))}
                  </Select>
                ) : (
                  <Input
                    value={formData[f.value] ?? ""}
                    onChange={e => setFormData(d => ({ ...d, [f.value]: e.target.value }))}
                  />
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