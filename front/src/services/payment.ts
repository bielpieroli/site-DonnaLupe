import type { CartItem } from "@/contexts/CartContext";
import type { DeliveryAddress } from "@/services/freight";
import { request } from "@/api";

export type MPPreference = {
  preferenceId: string;
  initPoint: string;
};

export async function createPaymentPreference(
  items: CartItem[],
  freightCost: number,
  pickupMode: boolean,
  address?: DeliveryAddress,
): Promise<MPPreference> {
  return request<MPPreference>("/checkout/preference", {
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
      cep: address?.cep ?? "",
      number: address?.number ?? "",
      complement: address?.complement ?? "",
    }),
  });
}
