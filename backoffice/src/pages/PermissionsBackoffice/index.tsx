import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Button from "@/components/core/Button";
import Card from "@/components/core/Card";
import Modal from "@/components/core/Modal";
import Select from "@/components/core/Select";
import Badge from "@/components/core/Badge";
import Notification from "@/components/Notification";
import { ArrowLeft, ShieldCheck, Pencil } from "lucide-react";
import { usersAPI, permissionsAPI } from "@/api";
import { isAxiosError } from "axios";
import type { Permission, PermissionLevel } from "@/types/APIResponseType";
import { useHasPermission } from "@/contexts/AuthContext";

// Keep in sync with backend/internal/models/permission.go (KnownResources)
const RESOURCES: { key: string; label: string }[] = [
  { key: "users",       label: "Usuários" },
  { key: "products",    label: "Produtos" },
  { key: "permissions", label: "Permissões" },
  { key: "landing",     label: "Landing Page" },
  { key: "freight",     label: "Frete" },
  { key: "orders",      label: "Pedidos" },
];

const LEVEL_BADGE: Record<PermissionLevel, { label: string; cls: string }> = {
  write: { label: "RW",  cls: "bg-[#059669] border border-[#047857]" },
  read:  { label: "R",   cls: "bg-[#1d4ed8] border border-[#1e40af]" },
  none:  { label: "—",   cls: "bg-surface text-muted border border-border" },
};

interface UserRow {
  email: string;
  permissions: Permission[];
}

function levelOf(perms: Permission[], resource: string): PermissionLevel {
  return (perms.find((p) => p.resource === resource)?.level as PermissionLevel) ?? "none";
}

export default function PermissionsCRUD() {
  const navigate = useNavigate();
  const canWrite = useHasPermission("permissions", "write");
  const [rows, setRows] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editTarget, setEditTarget] = useState<UserRow | null>(null);
  const [editLevels, setEditLevels] = useState<Record<string, PermissionLevel>>({});
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: "success" | "warning" }>({
    message: "",
    type: "success",
  });

  const notify = (message: string, type: "success" | "warning" = "success") =>
    setNotification({ message, type });

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      const usersRes = await usersAPI.getAll({ limit: 100 });
      const settled = await Promise.allSettled(
        usersRes.users.map(async (u) => {
          const permRes = await permissionsAPI.getByUser(u.email);
          return { email: u.email, permissions: permRes.permissions };
        }),
      );
      setRows(
        settled
          .filter((r): r is PromiseFulfilledResult<UserRow> => r.status === "fulfilled")
          .map((r) => r.value),
      );
    } catch {
      notify("Erro ao carregar permissões.", "warning");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const openEdit = (row: UserRow) => {
    const levels: Record<string, PermissionLevel> = {};
    RESOURCES.forEach(({ key }) => {
      levels[key] = levelOf(row.permissions, key);
    });
    setEditLevels(levels);
    setEditTarget(row);
  };

  const handleSave = async () => {
    if (!editTarget) return;
    setSaving(true);
    try {
      const permissions: Permission[] = RESOURCES.map(({ key }) => ({
        backoffice_email: editTarget.email,
        resource: key,
        level: editLevels[key] ?? "none",
      }));
      const res = await permissionsAPI.setByUser(editTarget.email, permissions);
      setRows((prev) =>
        prev.map((r) =>
          r.email === editTarget.email ? { ...r, permissions: res.permissions } : r,
        ),
      );
      notify("Permissões atualizadas com sucesso!");
      setEditTarget(null);
    } catch (err) {
      const msg = isAxiosError(err)
        ? (err.response?.data as { error?: string })?.error ?? "Erro ao salvar permissões."
        : "Erro ao salvar permissões.";
      notify(msg, "warning");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="mx-auto w-full max-w-7xl space-y-6 px-4 py-8 md:px-6 md:py-10">
      <Card className="relative overflow-hidden border-border bg-panel-gradient">
        <div className="pointer-events-none absolute right-0 top-0 h-72 w-72 rounded-full bg-accent-orb blur-3xl" />
        <div className="p-6 pb-4">
          <div className="mb-2 flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary" />
            <p className="text-sm font-extrabold uppercase tracking-[0.3em] text-text/70">Permissões</p>
          </div>
          <h1 className="font-display text-2xl font-semibold text-text-h md:text-3xl">
            Controle de Permissões
          </h1>
          <p className="mt-1 text-muted">
            Defina o nível de acesso de cada usuário por seção do backoffice.{" "}
            <span className="font-medium">R</span> = somente leitura,{" "}
            <span className="font-medium">RW</span> = leitura e escrita,{" "}
            <span className="font-medium">—</span> = sem acesso.
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
        {loading ? (
          <p className="py-12 text-center text-muted">Carregando permissões…</p>
        ) : rows.length === 0 ? (
          <p className="py-12 text-center text-muted">Nenhum usuário encontrado.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-surface/95">
                  <th className="border-b border-border px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                    Usuário
                  </th>
                  {RESOURCES.map(({ key, label }) => (
                    <th
                      key={key}
                      className="border-b border-border px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted"
                    >
                      {label}
                    </th>
                  ))}
                  {canWrite && (
                    <th className="w-20 border-b border-border px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                      Ações
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr
                    key={row.email}
                    className={i % 2 === 0 ? "bg-transparent" : "bg-secondary/10"}
                  >
                    <td className="border-b border-border px-4 py-3 font-medium text-text">
                      {row.email}
                    </td>
                    {RESOURCES.map(({ key }) => {
                      const level = levelOf(row.permissions, key);
                      const { label, cls } = LEVEL_BADGE[level];
                      return (
                        <td key={key} className="border-b border-border px-4 py-3">
                          <Badge className={`px-2 py-0.5 text-xs font-semibold ${cls}`}>
                            {label}
                          </Badge>
                        </td>
                      );
                    })}
                    {canWrite && (
                      <td className="border-b border-border px-4 py-3">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openEdit(row)}
                          className="h-10 w-10 rounded-lg p-0 text-muted"
                          title="Editar permissões"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit permissions modal */}
      <Modal
        open={editTarget !== null}
        onClose={() => setEditTarget(null)}
        title={`Permissões — ${editTarget?.email ?? ""}`}
        widthClassName="max-w-md"
      >
        <div className="space-y-4 py-2">
          {RESOURCES.map(({ key, label }) => (
            <div key={key} className="flex items-center justify-between gap-4">
              <label className="text-sm font-medium text-text">{label}</label>
              <Select
                value={editLevels[key] ?? "none"}
                onChange={(e) =>
                  setEditLevels((prev) => ({ ...prev, [key]: e.target.value as PermissionLevel }))
                }
                className="w-40"
              >
                <option value="none">Sem acesso</option>
                <option value="read">Leitura (R)</option>
                <option value="write">Leitura e Escrita (RW)</option>
              </Select>
            </div>
          ))}
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setEditTarget(null)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Salvando…" : "Salvar"}
          </Button>
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
