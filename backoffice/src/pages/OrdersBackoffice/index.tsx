import { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ShoppingBag, TrendingUp, Clock, CheckCircle } from "lucide-react";
import Button from "@/components/core/Button";
import Card from "@/components/core/Card";
import Notification from "@/components/Notification";
import { ordersAPI, type Order, type OrderStatus } from "@/api/orders";
import { apiMsg, formatBRL, formatDate } from "@/lib/formatting";

const STATUS_LABEL: Record<string, string> = {
  pending: "Pendente",
  paid: "Pago",
  cancelled: "Cancelado",
};

const STATUS_COLOR: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  paid: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

const DELIVERY_LABEL: Record<string, string> = {
  preparing: "Em preparo",
  pending_delivery: "Aguardando entrega",
  in_transit: "Em trânsito",
  delivered: "Entregue",
};

const FILTERS: { label: string; value: OrderStatus | "" }[] = [
  { label: "Todos", value: "" },
  { label: "Pendentes", value: "pending" },
  { label: "Pagos", value: "paid" },
  { label: "Cancelados", value: "cancelled" },
];

export default function OrdersBackoffice() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<OrderStatus | "">("");
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [refundTarget, setRefundTarget] = useState<number | null>(null);
  const [confirmPaymentTarget, setConfirmPaymentTarget] = useState<number | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: "success" | "warning" }>({
    message: "",
    type: "success",
  });

  const notify = (message: string, type: "success" | "warning" = "success") =>
    setNotification({ message, type });

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const res = await ordersAPI.getAll(filter ? { status: filter } : {});
      setOrders(res.orders ?? []);
    } catch (err) {
      notify(apiMsg(err, "Erro ao carregar pedidos."), "warning");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const { totalRevenue, pendingCount, paidCount } = useMemo(() =>
    orders.reduce(
      (acc, o) => ({
        totalRevenue: acc.totalRevenue + (o.status === "paid" ? o.total : 0),
        pendingCount: acc.pendingCount + (o.status === "pending" ? 1 : 0),
        paidCount: acc.paidCount + (o.status === "paid" ? 1 : 0),
      }),
      { totalRevenue: 0, pendingCount: 0, paidCount: 0 },
    ), [orders]);

  async function handleConfirmPayment(id: number) {
    setConfirmPaymentTarget(null);
    setActionLoading(id);
    try {
      await ordersAPI.confirmPayment(id);
      notify(`Pagamento do pedido #${id} confirmado com sucesso.`);
      fetchOrders();
    } catch (err) {
      notify(apiMsg(err, "Erro ao confirmar pagamento."), "warning");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleSetCompleted(id: number, completed: boolean) {
    try {
      const res = await ordersAPI.setCompleted(id, completed);
      setOrders((prev) => prev.map((o) => (o.id === id ? res.order : o)));
    } catch (err) {
      notify(apiMsg(err, "Erro ao atualizar pedido."), "warning");
    }
  }

  async function handleRefund(id: number) {
    setRefundTarget(null);
    setActionLoading(id);
    try {
      await ordersAPI.refund(id);
      notify(`Pedido #${id} reembolsado e cancelado.`);
      fetchOrders();
    } catch (err) {
      notify(apiMsg(err, "Erro ao reembolsar pedido."), "warning");
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Modal de confirmação de pagamento */}
      {confirmPaymentTarget !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-surface border border-border p-6 shadow-2xl">
            <h2 className="text-lg font-bold text-text-h">Confirmar pagamento</h2>
            <p className="mt-2 text-sm text-muted">
              Confirmar manualmente o pagamento do pedido{" "}
              <span className="font-semibold text-text">#{confirmPaymentTarget}</span>?
              O status será alterado para <span className="font-semibold text-text">Pago</span> e o cliente receberá um e-mail de confirmação.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setConfirmPaymentTarget(null)}
                className="flex-1 rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-text transition-colors hover:bg-white/5"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleConfirmPayment(confirmPaymentTarget)}
                disabled={actionLoading === confirmPaymentTarget}
                className="flex-1 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-green-700 disabled:opacity-50"
              >
                {actionLoading === confirmPaymentTarget ? "Processando..." : "Confirmar pagamento"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmação de reembolso */}
      {refundTarget !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-surface border border-border p-6 shadow-2xl">
            <h2 className="text-lg font-bold text-text-h">Confirmar reembolso</h2>
            <p className="mt-2 text-sm text-muted">
              Tem certeza que deseja reembolsar e cancelar o pedido{" "}
              <span className="font-semibold text-text">#{refundTarget}</span>?
              O valor será estornado via Mercado Pago e esta ação não pode ser desfeita.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setRefundTarget(null)}
                className="flex-1 rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-text transition-colors hover:bg-white/5"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleRefund(refundTarget)}
                disabled={actionLoading === refundTarget}
                className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-red-700 disabled:opacity-50"
              >
                {actionLoading === refundTarget ? "Processando..." : "Confirmar reembolso"}
              </button>
            </div>
          </div>
        </div>
      )}

      <Notification
        message={notification.message}
        type={notification.type}
        visible={notification.message !== ""}
        onClose={() => setNotification({ message: "", type: "success" })}
      />

      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate("/home")}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-primary" />
            Pedidos
          </h1>
          <p className="text-sm text-text-secondary">Visualize e gerencie todos os pedidos da loja.</p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="flex items-center gap-4 p-4">
          <div className="rounded-xl bg-green-100 p-3"><TrendingUp className="w-5 h-5 text-green-700" /></div>
          <div>
            <p className="text-xs text-text-secondary font-medium uppercase tracking-wide">Receita (pagos)</p>
            <p className="text-xl font-bold text-text-primary">{formatBRL(totalRevenue)}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4 p-4">
          <div className="rounded-xl bg-yellow-100 p-3"><Clock className="w-5 h-5 text-yellow-700" /></div>
          <div>
            <p className="text-xs text-text-secondary font-medium uppercase tracking-wide">Pendentes</p>
            <p className="text-xl font-bold text-text-primary">{pendingCount}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4 p-4">
          <div className="rounded-xl bg-primary/10 p-3"><CheckCircle className="w-5 h-5 text-primary" /></div>
          <div>
            <p className="text-xs text-text-secondary font-medium uppercase tracking-wide">Pagos</p>
            <p className="text-xl font-bold text-text-primary">{paidCount}</p>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filter === f.value
                ? "bg-primary text-white"
                : "bg-secondary/10 text-text-secondary hover:bg-primary/10"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <Card className="overflow-hidden p-0">
        {loading ? (
          <p className="p-6 text-sm text-text-secondary text-center">Carregando pedidos...</p>
        ) : orders.length === 0 ? (
          <p className="p-6 text-sm text-text-secondary text-center">Nenhum pedido encontrado.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-secondary/5 text-left text-xs font-semibold text-text-secondary uppercase tracking-wide">
                <tr>
                  <th className="px-4 py-3">#</th>
                  <th className="px-4 py-3">Data</th>
                  <th className="px-4 py-3">Cliente</th>
                  <th className="px-4 py-3">Itens</th>
                  <th className="px-4 py-3">Modo</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Pagamento</th>
                  <th className="px-4 py-3">Entrega</th>
                  <th className="px-4 py-3 text-center">Concluído</th>
                  <th className="px-4 py-3">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-secondary/10">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-secondary/5 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-text-secondary">#{order.id}</td>
                    <td className="px-4 py-3 text-text-primary">{formatDate(order.created_at)}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-text-primary text-xs">{order.customer_name || "—"}</p>
                      <p className="text-text-secondary text-xs">{order.customer_email || "—"}</p>
                    </td>
                    <td className="px-4 py-3 text-text-secondary">
                      {order.items?.length ?? 0} {(order.items?.length ?? 0) === 1 ? "item" : "itens"}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        order.delivery_mode === "pickup"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-purple-100 text-purple-800"
                      }`}>
                        {order.delivery_mode === "pickup" ? "Retirada" : "Entrega"}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-text-primary">{formatBRL(order.total)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLOR[order.status]}`}>
                        {STATUS_LABEL[order.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-text-secondary text-xs">
                      {DELIVERY_LABEL[order.delivery_status] ?? order.delivery_status}
                      {order.delivery_mode === "pickup" && order.pickup_time && (
                        <span className="ml-1 text-[#9a7b6e]">· {order.pickup_time}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={order.completed ?? false}
                        onChange={(e) => handleSetCompleted(order.id, e.target.checked)}
                        className="h-4 w-4 cursor-pointer accent-primary"
                        title="Marcar como concluído"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        {order.status === "pending" && (
                          <button
                            onClick={() => setConfirmPaymentTarget(order.id)}
                            disabled={actionLoading === order.id}
                            className="rounded-lg bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-800 transition-colors hover:bg-green-200 disabled:opacity-50"
                          >
                            {actionLoading === order.id ? "..." : "Confirmar pagamento"}
                          </button>
                        )}
                        {order.status === "paid" && (
                          <button
                            onClick={() => setRefundTarget(order.id)}
                            disabled={actionLoading === order.id}
                            className="rounded-lg bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-800 transition-colors hover:bg-red-200 disabled:opacity-50"
                          >
                            {actionLoading === order.id ? "..." : "Reembolsar"}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
