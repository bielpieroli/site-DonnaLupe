import { CrudTable } from "@/components/CrudTable";
import type { CrudItemType } from "@/types/CrudItem";
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Button from "@/components/core/Button";
import Card from "@/components/core/Card";
import Notification from "@/components/Notification";
import { ArrowLeft, UserCog } from "lucide-react";
import { USER_FIELDS, USER_CREATE_FIELDS, USER_EDIT_FIELDS } from "@/data/crudFields";
import { usersAPI, authAPI } from "@/api";
import { isAxiosError } from "axios";
import { useHasPermission } from "@/contexts/AuthContext";

interface UserItem extends CrudItemType {
  email: string;
}

function apiMsg(err: unknown, fallback: string): string {
  if (isAxiosError(err)) {
    return (err.response?.data as { error?: string })?.error ?? fallback;
  }
  return err instanceof Error ? err.message : fallback;
}

export default function UsersCRUD() {
  const navigate = useNavigate();
  const canWrite = useHasPermission("users", "write");
  const [data, setData] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<{ message: string; type: "success" | "warning" }>({
    message: "",
    type: "success",
  });

  const notify = (message: string, type: "success" | "warning" = "success") =>
    setNotification({ message, type });

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await usersAPI.getAll({ limit: 100 });
      setData(
        res.users.map((u) => ({
          id: u.email,
          name: u.email,
          email: u.email,
        })),
      );
    } catch (err) {
      notify(apiMsg(err, "Erro ao carregar usuários."), "warning");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleCreate = async (item: CrudItemType) => {
    const user = item as UserItem & { password?: string };
    try {
      await authAPI.register(user.email, user.password ?? "");
      notify("Usuário criado com sucesso!");
      await fetchUsers();
    } catch (err) {
      notify(apiMsg(err, "Erro ao criar usuário."), "warning");
    }
  };

  const handleEdit = async (item: CrudItemType) => {
    const user = item as UserItem & { password?: string };
    try {
      await usersAPI.update(user.email, user.password ?? "");
      notify("Senha atualizada com sucesso!");
    } catch (err) {
      notify(apiMsg(err, "Erro ao atualizar usuário."), "warning");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await usersAPI.delete(id);
      notify("Usuário removido com sucesso!");
      setData((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      notify(apiMsg(err, "Erro ao remover usuário."), "warning");
    }
  };

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-8 md:px-6 md:py-10 space-y-6 overflow-x-auto scrollbar-hide">
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
          <Button
            variant="secondary"
            size="sm"
            className="gap-2 px-3"
            onClick={() => navigate("/home")}
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Button>
        </div>
      </Card>

      <div className="rounded-xl border border-border bg-surface p-5">
        {loading ? (
          <p className="py-12 text-center text-muted">Carregando usuários…</p>
        ) : (
          <CrudTable
            data={data}
            fields={USER_FIELDS}
            createFields={USER_CREATE_FIELDS}
            editFields={USER_EDIT_FIELDS}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onCreate={handleCreate}
            entityLabel="usuário"
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
