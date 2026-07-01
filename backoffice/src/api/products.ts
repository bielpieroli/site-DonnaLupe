import client from "./client";

export type Product = {
  id: number;
  name: string;
  subtitle: string;
  kind: "Shopping" | "Coffee";
  category: string;
  description: string;
  priceValue: number;
  price: string;
  weight: string;
  ingredients: string[];
  ingredientsText: string;
  allergens: string;
  badge: string;
  image: string;
  img: string;
  stock: number;
  flavor: string;
  unit: string;
  sizes: string[];
  sizesText: string;
  sizeCounts: Record<string, number>;
  sizeCountsText: string;
  status: string;
};

export type ProductInput = Omit<Product, "id" | "price" | "ingredients" | "img" | "sizes" | "sizeCounts">;

export const productsAPI = {
  getAll: async (kind?: string): Promise<{ products: Product[] }> => {
    const res = await client.get<{ products: Product[] }>("/admin/products", {
      params: kind ? { kind } : undefined,
    });
    return res.data;
  },

  create: async (input: ProductInput): Promise<{ product: Product }> => {
    const res = await client.post<{ product: Product }>("/admin/products", input);
    return res.data;
  },

  update: async (id: number, input: ProductInput): Promise<{ product: Product }> => {
    const res = await client.put<{ product: Product }>(`/admin/products/${id}`, input);
    return res.data;
  },

  delete: async (id: number): Promise<{ message: string }> => {
    const res = await client.delete<{ message: string }>(`/admin/products/${id}`);
    return res.data;
  },
};
