import { request } from "@/api";

export type FreightQuote = {
  distance_km: number;
  price_reais: number;
  max_distance_km: number;
};

export type DeliveryAddress = {
  cep: string;
  number: string;
  complement?: string;
};

export async function calculateFreight(addr: DeliveryAddress): Promise<FreightQuote> {
  const data = await request<{ quote: FreightQuote }>("/freight/quote", {
    method: "POST",
    body: JSON.stringify({
      cep: addr.cep,
      number: addr.number,
      complement: addr.complement ?? "",
    }),
  });
  return data.quote;
}
