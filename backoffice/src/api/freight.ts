import client from "./client";

export type FreightRule = {
  id: number;
  max_distance_km: number;
  price_reais: number;
};

export type FreightRuleInput = {
  max_distance_km: number;
  price_reais: number;
};

export const freightAPI = {
  getRules: async (): Promise<{ rules: FreightRule[] }> => {
    const res = await client.get<{ rules: FreightRule[] }>("/admin/freight/rules");
    return res.data;
  },

  createRule: async (input: FreightRuleInput): Promise<{ rule: FreightRule }> => {
    const res = await client.post<{ rule: FreightRule }>("/admin/freight/rules", input);
    return res.data;
  },

  updateRule: async (id: number, input: FreightRuleInput): Promise<{ rule: FreightRule }> => {
    const res = await client.put<{ rule: FreightRule }>(`/admin/freight/rules/${id}`, input);
    return res.data;
  },

  deleteRule: async (id: number): Promise<void> => {
    await client.delete(`/admin/freight/rules/${id}`);
  },
};
