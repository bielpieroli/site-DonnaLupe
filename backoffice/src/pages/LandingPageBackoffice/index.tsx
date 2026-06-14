import { CrudTable } from "@/components/CrudTable";
import type { CrudItemType } from "@/types/CrudItem";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "@/components/core/Button";
import Card from "@/components/core/Card";
import { ArrowLeft, LayoutTemplate } from "lucide-react";
import { LANDING_FIELDS } from "@/data/crudFields";
import Notification from "@/components/Notification";
import { landingAPI, type LandingContent, type LandingContentInput } from "@/api/landing";
import { apiMsg } from "@/lib/formatting";

const LEGACY_LOCAL_STORAGE_KEY = "donna-lupe-landing-content";

type LandingRow = CrudItemType & Omit<LandingContent, "id">;

function toRow(content: LandingContent): LandingRow {
  return {
    ...content,
    id: String(content.id),
  };
}

function toInput(item: CrudItemType): LandingContentInput {
  const row = item as LandingRow;
  return {
    name: String(row.name ?? "").trim(),
    secao: String(row.secao ?? "").trim(),
    titulo: String(row.titulo ?? "").trim(),
    subtitulo: String(row.subtitulo ?? ""),
    descricao: String(row.descricao ?? ""),
    imagem: String(row.imagem ?? ""),
    botaoTexto: String(row.botaoTexto ?? ""),
    botaoLink: String(row.botaoLink ?? ""),
    status: String(row.status ?? "Ativo"),
  };
}

export default function LandingPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<LandingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<{ message: string; type: "success" | "warning" }>({
    message: "",
    type: "success",
  });

  const notify = (message: string, type: "success" | "warning" = "success") =>
    setNotification({ message, type });

  const fetchLanding = useCallback(async () => {
    try {
      setLoading(true);
      const res = await landingAPI.getAll();
      setData((res.contents ?? []).map(toRow));
    } catch (err) {
      notify(apiMsg(err, "Erro ao carregar conteúdo da landing page."), "warning");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    localStorage.removeItem(LEGACY_LOCAL_STORAGE_KEY);
    fetchLanding();
  }, [fetchLanding]);

  const handleEdit = async (item: CrudItemType) => {
    try {
      const res = await landingAPI.update(Number(item.id), toInput(item));
      setData((prev) => prev.map((entry) => (entry.id === item.id ? toRow(res.content) : entry)));
      notify("Conteúdo atualizado com sucesso!");
    } catch (err) {
      notify(apiMsg(err, "Erro ao atualizar conteúdo."), "warning");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await landingAPI.delete(Number(id));
      setData((prev) => prev.filter((entry) => entry.id !== id));
      notify("Conteúdo removido com sucesso!");
    } catch (err) {
      notify(apiMsg(err, "Erro ao remover conteúdo."), "warning");
    }
  };

  const handleCreate = async (item: CrudItemType) => {
    try {
      const res = await landingAPI.create(toInput(item));
      setData((prev) => [...prev, toRow(res.content)]);
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
            <LayoutTemplate className="h-4 w-4 text-primary" />
            <p className="text-sm font-extrabold uppercase tracking-[0.3em] text-text/70">
              Landing Page
            </p>
          </div>

          <h1 className="font-display text-2xl font-semibold text-text-h md:text-3xl">
            Catálogo de Conteúdos da Landing Page
          </h1>

          <p className="mt-1 text-muted">
            Gerencie os textos, imagens, botões e conteúdos exibidos na landing page.
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
          <p className="py-12 text-center text-muted">Carregando conteúdo da landing page...</p>
        ) : (
          <CrudTable
            data={data}
            fields={LANDING_FIELDS}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onCreate={handleCreate}
            entityLabel="conteudo"
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
