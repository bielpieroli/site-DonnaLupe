import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Button from "@/components/core/Button";
import Card from "@/components/core/Card";
import Modal from "@/components/core/Modal";
import Input from "@/components/core/Input";
import Notification from "@/components/Notification";
import { ArrowLeft, Truck, Pencil, Trash2, Plus } from "lucide-react";
import { freightAPI, type FreightRule } from "@/api/freight";
import { useHasPermission } from "@/contexts/AuthContext";
import { apiMsg, formatBRL } from "@/lib/formatting";

function formatKm(km: number): string {
  return km % 1 === 0 ? `${km} km` : `${km.toFixed(1)} km`;
}

export default function FreightBackoffice() {
  const navigate = useNavigate();
  const canWrite = useHasPermission("freight", "write");

  const [rules, setRules] = useState<FreightRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<{ message: string; type: "success" | "warning" }>({
    message: "",
    type: "success",
  });

  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<FreightRule | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<FreightRule | null>(null);

  const [formKm, setFormKm] = useState("");
  const [formPrice, setFormPrice] = useState("");
  const [saving, setSaving] = useState(false);

  const notify = (message: string, type: "success" | "warning" = "success") =>
    setNotification({ message, type });

  const fetchRules = useCallback(async () => {
    try {
      setLoading(true);
      const res = await freightAPI.getRules();
      setRules(res.rules ?? []);
    } catch (err) {
      notify(apiMsg(err, "Erro ao carregar regras de frete."), "warning");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchRules(); }, [fetchRules]);

  function openCreate() {
    setFormKm("");
    setFormPrice("");
    setCreateOpen(true);
  }

  function openEdit(rule: FreightRule) {
    setFormKm(String(rule.max_distance_km));
    setFormPrice(String(rule.price_reais));
    setEditTarget(rule);
  }

  async function handleCreate() {
    const km = parseFloat(formKm);
    const price = parseFloat(formPrice.replace(",", "."));
    if (isNaN(km) || km <= 0 || isNaN(price) || price < 0) {
      notify("Informe valores válidos para distância e preço.", "warning");
      return;
    }
    setSaving(true);
    try {
      const res = await freightAPI.createRule({ max_distance_km: km, price_reais: price });
      setRules((prev) => [...prev, res.rule].sort((a, b) => a.max_distance_km - b.max_distance_km));
      notify("Faixa criada com sucesso!");
      setCreateOpen(false);
    } catch (err) {
      notify(apiMsg(err, "Erro ao criar faixa."), "warning");
    } finally {
      setSaving(false);
    }
  }

  async function handleEdit() {
    if (!editTarget) return;
    const km = parseFloat(formKm);
    const price = parseFloat(formPrice.replace(",", "."));
    if (isNaN(km) || km <= 0 || isNaN(price) || price < 0) {
      notify("Informe valores válidos.", "warning");
      return;
    }
    setSaving(true);
    try {
      const res = await freightAPI.updateRule(editTarget.id, { max_distance_km: km, price_reais: price });
      setRules((prev) =>
        prev.map((r) => (r.id === editTarget.id ? res.rule : r))
          .sort((a, b) => a.max_distance_km - b.max_distance_km),
      );
      notify("Faixa atualizada com sucesso!");
      setEditTarget(null);
    } catch (err) {
      notify(apiMsg(err, "Erro ao atualizar faixa."), "warning");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setSaving(true);
    try {
      await freightAPI.deleteRule(deleteTarget.id);
      setRules((prev) => prev.filter((r) => r.id !== deleteTarget.id));
      notify("Faixa removida.");
      setDeleteTarget(null);
    } catch (err) {
      notify(apiMsg(err, "Erro ao remover faixa."), "warning");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="mx-auto w-full max-w-7xl space-y-6 px-4 py-8 md:px-6 md:py-10">
      {/* Header card */}
      <Card className="relative overflow-hidden border-border bg-panel-gradient">
        <div className="pointer-events-none absolute right-0 top-0 h-72 w-72 rounded-full bg-accent-orb blur-3xl" />
        <div className="p-6 pb-4">
          <div className="mb-2 flex items-center gap-2">
            <Truck className="h-4 w-4 text-primary" />
            <p className="text-sm font-extrabold uppercase tracking-[0.3em] text-text/70">Frete</p>
          </div>
          <h1 className="font-display text-2xl font-semibold text-text-h md:text-3xl">
            Tabela de Frete por Distância
          </h1>
          <p className="mt-1 text-muted">
            Defina o preço de entrega para cada faixa de distância a partir da loja.
            O sistema usa a API do Google Maps para calcular a distância real até o endereço do cliente.
          </p>
        </div>
        <div className="flex items-center gap-3 px-6 pb-6">
          <Button variant="secondary" size="sm" className="gap-2 px-3" onClick={() => navigate("/home")}>
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          {canWrite && (
            <Button size="sm" className="gap-2" onClick={openCreate}>
              <Plus className="h-4 w-4" />
              Nova faixa
            </Button>
          )}
        </div>
      </Card>

      {/* Rules table */}
      <div className="rounded-xl border border-border bg-surface p-5">
        {loading ? (
          <p className="py-12 text-center text-muted">Carregando faixas de frete…</p>
        ) : rules.length === 0 ? (
          <p className="py-12 text-center text-muted">Nenhuma faixa cadastrada.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-surface/95">
                  <th className="border-b border-border px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                    Distância máxima
                  </th>
                  <th className="border-b border-border px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                    Preço
                  </th>
                  {canWrite && (
                    <th className="w-24 border-b border-border px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                      Ações
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {rules.map((rule, i) => (
                  <tr key={rule.id} className={i % 2 === 0 ? "bg-transparent" : "bg-secondary/10"}>
                    <td className="border-b border-border px-4 py-3 font-medium text-text">
                      até {formatKm(rule.max_distance_km)}
                    </td>
                    <td className="border-b border-border px-4 py-3 font-semibold text-primary">
                      {formatBRL(rule.price_reais)}
                    </td>
                    {canWrite && (
                      <td className="border-b border-border px-4 py-3">
                        <div className="flex gap-1.5">
                          <Button size="sm" variant="ghost" className="h-9 w-9 rounded-lg p-0 text-muted" onClick={() => openEdit(rule)} title="Editar">
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" className="h-9 w-9 rounded-lg p-0 text-muted hover:text-red-500" onClick={() => setDeleteTarget(rule)} title="Excluir">
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

      {/* Create modal */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Nova faixa de frete" widthClassName="max-w-sm">
        <FreightRuleForm km={formKm} price={formPrice} onKm={setFormKm} onPrice={setFormPrice} />
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setCreateOpen(false)}>Cancelar</Button>
          <Button onClick={handleCreate} disabled={saving}>{saving ? "Salvando…" : "Criar"}</Button>
        </div>
      </Modal>

      {/* Edit modal */}
      <Modal open={editTarget !== null} onClose={() => setEditTarget(null)} title="Editar faixa de frete" widthClassName="max-w-sm">
        <FreightRuleForm km={formKm} price={formPrice} onKm={setFormKm} onPrice={setFormPrice} />
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setEditTarget(null)}>Cancelar</Button>
          <Button onClick={handleEdit} disabled={saving}>{saving ? "Salvando…" : "Salvar"}</Button>
        </div>
      </Modal>

      {/* Delete confirm */}
      <Modal open={deleteTarget !== null} onClose={() => setDeleteTarget(null)} title="Confirmar exclusão" widthClassName="max-w-sm">
        <p className="py-2 text-sm text-muted">
          Remover a faixa <span className="font-semibold text-text-h">até {deleteTarget ? formatKm(deleteTarget.max_distance_km) : ""}</span> ({deleteTarget ? formatBRL(deleteTarget.price_reais) : ""})?
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setDeleteTarget(null)}>Cancelar</Button>
          <Button variant="danger" onClick={handleDelete} disabled={saving}>Excluir</Button>
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

function FreightRuleForm({
  km,
  price,
  onKm,
  onPrice,
}: {
  km: string;
  price: string;
  onKm: (v: string) => void;
  onPrice: (v: string) => void;
}) {
  return (
    <div className="space-y-4 py-2">
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-text">Distância máxima (km)</label>
        <Input
          type="number"
          min="0.1"
          step="0.5"
          value={km}
          onChange={(e) => onKm(e.target.value)}
          placeholder="ex: 3"
        />
        <p className="text-xs text-muted">Entregas até este valor de km usarão este preço.</p>
      </div>
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-text">Preço (R$)</label>
        <Input
          type="number"
          min="0"
          step="0.50"
          value={price}
          onChange={(e) => onPrice(e.target.value)}
          placeholder="ex: 8.50"
        />
      </div>
    </div>
  );
}
