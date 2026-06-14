import client from "./client";

export type Ingredient = {
  name: string;
  stock: number;
  unit: string;
  value_reais: number;
};

export type IngredientInput = {
  name: string;
  stock: number;
  unit?: string;
  value_reais: number;
};

export type IngredientUpdateInput = {
  stock?: number;
  unit?: string;
  value_reais?: number;
};

export const ingredientsAPI = {
  getAll: async (): Promise<{ ingredients: Ingredient[] }> => {
    const res = await client.get<{ ingredients: Ingredient[] }>("/admin/ingredients");
    return res.data;
  },

  create: async (input: IngredientInput): Promise<{ ingredient: Ingredient }> => {
    const res = await client.post<{ ingredient: Ingredient }>("/admin/ingredients", input);
    return res.data;
  },

  update: async (
    name: string,
    input: IngredientUpdateInput,
  ): Promise<{ ingredient: Ingredient }> => {
    const res = await client.put<{ ingredient: Ingredient }>(
      `/admin/ingredients/${encodeURIComponent(name)}`,
      input,
    );
    return res.data;
  },

  delete: async (name: string): Promise<{ message: string }> => {
    const res = await client.delete<{ message: string }>(
      `/admin/ingredients/${encodeURIComponent(name)}`,
    );
    return res.data;
  },
};
