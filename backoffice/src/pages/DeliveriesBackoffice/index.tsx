import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Truck, MapPin, Package } from "lucide-react";
import Button from "@/components/core/Button";
import Card from "@/components/core/Card";
import Notification from "@/components/Notification";
import { ordersAPI, type Order, type DeliveryStatus } from "@/api/orders";
import { useHasPermission } from "@/contexts/AuthContext";
import { apiMsg, formatBRL, formatDate } from "@/lib/formatting";

type StatusTab = { key: DeliveryStatus | "all"; label: string };

const TABS: StatusTab[] = [
  { key: "all", label: "Todos" },
  { key: "preparing", label: "Em preparo" },
  { key: "pending_delivery", label: "Aguardando entrega" },
  { key: "in_transit", label: "Em trânsito" },
  { key: "delivered", label: "Entregues" },
];

const NEXT_STATUS: Partial<Record<DeliveryStatus, { status: DeliveryStatus; label: string }>> = {
  preparing: { status: "pending_delivery", label: "Pronto p/ entrega" },
  pending_delivery: { status: "in_transit", label: "Saiu p/ entrega" },
  in_transit: { status: "delivered", label: "Marcar entregue" },
};

const STATUS_COLOR: Record<DeliveryStatus, string> = {
  preparing: "bg-yellow-100 text-yellow-800",
  pending_delivery: "bg-blue-100 text-blue-800",
  in_transit: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
};

export default function DeliveriesBackoffice() {
  const navigate = useNavigate();
  const canWrite = useHasPermission("orders", "write");

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<DeliveryStatus | "all">("all");
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: "success" | "warning" }>({
    message: "",
    type: "success",
  });

  const notify = (message: string, type: "success" | "warning" = "success") =>
    setNotification({ message, type });

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const filters = {
        delivery_mode: "delivery" as const,
        ...(activeTab !== "all" && { delivery_status: activeTab }),
      };
      const res = await ordersAPI.getAll(filters);
      setOrders(res.orders ?? []);
    } catch (err) {
      notify(apiMsg(err, "Erro ao carregar entregas."), "warning");
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  async function handleAdvanceStatus(order: Order) {
    const next = NEXT_STATUS[order.delivery_status];
    if (!next) return;
    setUpdatingId(order.id);
    try {
      await ordersAPI.updateDeliveryStatus(order.id, next.status);
      notify(`Pedido #${order.id} → ${next.label}`);
      fetchOrders();
    } catch (err) {
      notify(apiMsg(err, "Erro ao atualizar status."), "warning");
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <Notification message={notification.message} type={notification.type} visible={notification.message !== ""} onClose={() => setNotification({ message: "", type: "success" })} />

      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate("/home")}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            <Truck className="w-6 h-6 text-primary" />
            Entregas
          </h1>
          <p className="text-sm text-text-secondary">Acompanhe e atualize o status de cada entrega.</p>
        </div>
      </div>

      {/* Status tabs */}
      <div className="flex gap-2 flex-wrap">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? "bg-primary text-white"
                : "bg-secondary/10 text-text-secondary hover:bg-primary/10"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Cards */}
      {loading ? (
        <p className="text-sm text-text-secondary text-center py-12">Carregando entregas...</p>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 flex flex-col items-center gap-3 text-text-secondary">
          <Package className="w-12 h-12 opacity-30" />
          <p className="text-sm">Nenhuma entrega encontrada neste filtro.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {orders.map((order) => {
            const next = NEXT_STATUS[order.delivery_status];
            return (
              <Card key={order.id} className="flex flex-col gap-3 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-bold text-text-primary text-sm">Pedido #{order.id}</p>
                    <p className="text-xs text-text-secondary">{formatDate(order.created_at)}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLOR[order.delivery_status]}`}>
                    {TABS.find((t) => t.key === order.delivery_status)?.label ?? order.delivery_status}
                  </span>
                </div>

                {order.street && (
                  <div className="flex items-start gap-1.5 text-xs text-text-secondary">
                    <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0 text-primary" />
                    <span>
                      {order.street}, {order.address_number}
                      {order.complement ? ` — ${order.complement}` : ""}
                      {" · "}
                      {order.city}/{order.state} · {order.cep}
                    </span>
                  </div>
                )}

                <div className="text-xs text-text-secondary">
                  {order.items?.length ?? 0} {(order.items?.length ?? 0) === 1 ? "item" : "itens"} ·{" "}
                  <span className="font-semibold text-text-primary">{formatBRL(order.total)}</span>
                </div>

                {canWrite && next && (
                  <Button
                    size="sm"
                    variant="primary"
                    disabled={updatingId === order.id}
                    onClick={() => handleAdvanceStatus(order)}
                    className="mt-auto"
                  >
                    {updatingId === order.id ? "Atualizando..." : next.label}
                  </Button>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
