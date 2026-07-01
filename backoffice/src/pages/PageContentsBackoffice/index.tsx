import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, ArrowLeft } from "lucide-react";
import { CrudTable } from "@/components/CrudTable";
import type { CrudItemType } from "@/types/CrudItem";
import Button from "@/components/core/Button";
import Card from "@/components/core/Card";
import Notification from "@/components/Notification";
import { PAGE_CONTENT_FIELDS } from "@/data/crudFields";
import { pageContentsAPI, type PageContent, type PageContentInput } from "@/api/pageContents";
import { apiMsg } from "@/lib/formatting";
import { useAuth, useHasPermission } from "@/contexts/AuthContext";

type PageContentRow = CrudItemType & Omit<PageContent, "id">;

function toRow(content: PageContent): PageContentRow {
  return {
    ...content,
    id: String(content.id),
  };
}

function toInput(item: CrudItemType): PageContentInput {
  const row = item as PageContentRow;
  return {
    page: String(row.page ?? "").trim().toLowerCase(),
    name: String(row.name ?? "").trim(),
    section: String(row.section ?? "").trim(),
    title: String(row.title ?? "").trim(),
    subtitle: String(row.subtitle ?? "").trim(),
    description: String(row.description ?? "").trim(),
    image: String(row.image ?? "").trim(),
    buttonText: String(row.buttonText ?? "").trim(),
    buttonLink: String(row.buttonLink ?? "").trim(),
    status: String(row.status ?? "Ativo"),
  };
}

function validateInput(input: PageContentInput): string | null {
  if (!input.page || !input.name || !input.section) {
    return "Informe página, seção e nome interno.";
  }

  if (input.status !== "Ativo" && input.status !== "Inativo") {
    return "Informe um status válido.";
  }

  const hasVisibleContent = [
    input.title,
    input.subtitle,
    input.description,
    input.image,
    input.buttonText,
  ].some((value) => value.trim() !== "");

  if (!hasVisibleContent) {
    return "Informe pelo menos um conteúdo visível.";
  }

  return null;
}

export default function PageContentsBackoffice() {
  const navigate = useNavigate();
  const canWrite = useHasPermission("content", "write");
  const { ensurePermission } = useAuth();
  const [data, setData] = useState<PageContentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<{ message: string; type: "success" | "warning" }>({
    message: "",
    type: "success",
  });

  const notify = (message: string, type: "success" | "warning" = "success") =>
    setNotification({ message, type });

  const fetchContents = useCallback(async () => {
    try {
      setLoading(true);
      const res = await pageContentsAPI.getAll();
      setData((res.contents ?? []).map(toRow));
    } catch (err) {
      notify(apiMsg(err, "Erro ao carregar conteúdos do site."), "warning");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContents();
  }, [fetchContents]);

  const handleEdit = async (item: CrudItemType) => {
    try {
      if (!(await ensurePermission("content", "write"))) {
        notify("Você não tem permissão para editar conteúdos.", "warning");
        return;
      }
      const input = toInput(item);
      const validation = validateInput(input);
      if (validation) {
        notify(validation, "warning");
        return;
      }
      const res = await pageContentsAPI.update(Number(item.id), input);
      setData((prev) => prev.map((entry) => (entry.id === item.id ? toRow(res.content) : entry)));
      notify("Conteúdo atualizado com sucesso!");
    } catch (err) {
      notify(apiMsg(err, "Erro ao atualizar conteúdo."), "warning");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      if (!(await ensurePermission("content", "write"))) {
        notify("Você não tem permissão para remover conteúdos.", "warning");
        return;
      }
      await pageContentsAPI.delete(Number(id));
      setData((prev) => prev.filter((entry) => entry.id !== id));
      notify("Conteúdo removido com sucesso!");
    } catch (err) {
      notify(apiMsg(err, "Erro ao remover conteúdo."), "warning");
    }
  };

  const handleCreate = async (item: CrudItemType) => {
    try {
      if (!(await ensurePermission("content", "write"))) {
        notify("Você não tem permissão para criar conteúdos.", "warning");
        return;
      }
      const input = toInput(item);
      const validation = validateInput(input);
      if (validation) {
        notify(validation, "warning");
        return;
      }
      const res = await pageContentsAPI.create(input);
      setData((prev) =>
        [...prev, toRow(res.content)].sort((a, b) => a.page.localeCompare(b.page) || Number(a.id) - Number(b.id)),
      );
      notify("Conteúdo criado com sucesso!");
    } catch (err) {
      notify(apiMsg(err, "Erro ao criar conteúdo."), "warning");
    }
  };

  return (
    <section className="mx-auto w-full max-w-7xl space-y-6 px-4 py-8 md:px-6 md:py-10">
      <Card className="relative overflow-hidden border-border bg-panel-gradient">
        <div className="pointer-events-none absolute right-0 top-0 h-72 w-72 rounded-full bg-accent-orb blur-3xl" />

        <div className="p-6 pb-4">
          <div className="mb-2 flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            <p className="text-sm font-extrabold uppercase tracking-[0.3em] text-text/70">
              Conteúdos
            </p>
          </div>

          <h1 className="font-display text-2xl font-semibold text-text-h md:text-3xl">
            Conteúdos das Páginas
          </h1>

          <p className="mt-1 text-muted">
            Edite textos, botões e imagens de Landing, About, Shopping, Coffee e Footer.
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
          <p className="py-12 text-center text-muted">Carregando conteúdos...</p>
        ) : (
          <CrudTable
            data={data}
            fields={PAGE_CONTENT_FIELDS}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onCreate={handleCreate}
            entityLabel="conteúdo"
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

