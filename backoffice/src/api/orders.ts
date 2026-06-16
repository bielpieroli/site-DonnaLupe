import client from "./client";

export type OrderStatus = "pending" | "paid" | "cancelled";
export type DeliveryStatus = "preparing" | "pending_delivery" | "in_transit" | "delivered";
export type DeliveryMode = "delivery" | "pickup";

export type OrderItem = {
  id: number;
  name: string;
  quantity: number;
  price_value: number;
};

export type Order = {
  id: number;
  preference_id: string;
  payment_id: string;
  status: OrderStatus;
  delivery_mode: DeliveryMode;
  delivery_status: DeliveryStatus;
  items: OrderItem[];
  subtotal: number;
  freight_cost: number;
  total: number;
  cep: string;
  address_number: string;
  complement: string;
  city: string;
  state: string;
  street: string;
  created_at: string;
  updated_at: string;
};

export type OrderFilters = {
  status?: OrderStatus;
  delivery_status?: DeliveryStatus;
  delivery_mode?: DeliveryMode;
};

export const ordersAPI = {
  getAll: async (filters: OrderFilters = {}): Promise<{ orders: Order[] }> => {
    const params = new URLSearchParams();
    if (filters.status) params.set("status", filters.status);
    if (filters.delivery_status) params.set("delivery_status", filters.delivery_status);
    if (filters.delivery_mode) params.set("delivery_mode", filters.delivery_mode);
    const res = await client.get<{ orders: Order[] }>(`/admin/orders?${params}`);
    return res.data;
  },

  getById: async (id: number): Promise<{ order: Order }> => {
    const res = await client.get<{ order: Order }>(`/admin/orders/${id}`);
    return res.data;
  },

  updateDeliveryStatus: async (id: number, delivery_status: DeliveryStatus): Promise<{ order: Order }> => {
    const res = await client.put<{ order: Order }>(`/admin/orders/${id}/delivery-status`, { delivery_status });
    return res.data;
  },
};
