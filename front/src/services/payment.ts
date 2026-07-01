import type { CartItem } from "@/contexts/CartContext";
import type { DeliveryAddress } from "@/services/freight";
import { request } from "@/api";

export type PixPayment = {
  payment_id: number;
  pix_qr_code: string;
  pix_qr_base64: string;
};

export async function createPixPayment(
  items: CartItem[],
  freightCost: number,
  pickupMode: boolean,
  customerName: string,
  customerEmail: string,
  address?: DeliveryAddress,
  pickupTime?: string,
): Promise<PixPayment> {
  return request<PixPayment>("/checkout/pix", {
    method: "POST",
    body: JSON.stringify({
      items: items.map((item) => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        price_value: item.priceValue,
      })),
      freight_cost: freightCost,
      pickup_mode: pickupMode,
      customer_name: customerName,
      customer_email: customerEmail,
      pickup_time: pickupTime ?? "",
      cep: address?.cep ?? "",
      number: address?.number ?? "",
      complement: address?.complement ?? "",
    }),
  });
}

export async function getPixStatus(paymentId: number): Promise<{ status: string }> {
  return request<{ status: string }>(`/checkout/pix/${paymentId}/status`);
}
