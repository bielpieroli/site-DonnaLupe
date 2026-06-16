import client from "./client";

export type Product = {
  name: string;
  subtitle: string;
  category: string;
  description: string;
  img: string;
  imageFile: string;
  price: number;
  weight: string;
  ingredients: string[];
  allergens: string;
  badge: string;
  stock: number;
  status: string;
};

export type ProductFormInput = {
  name: string;
  subtitle: string;
  category: string;
  description: string;
  imageFile: string;
  price: number;
  weight: string;
  ingredients: string[];
  allergens: string;
  badge: string;
  stock: number;
  status: string;
  img?: File | null;
};

function toFormData(input: ProductFormInput): FormData {
  const form = new FormData();
  form.append("name", input.name);
  form.append("subtitle", input.subtitle);
  form.append("category", input.category);
  form.append("description", input.description);
  form.append("imageFile", input.imageFile);
  form.append("price", String(input.price));
  form.append("weight", input.weight);
  form.append("ingredients", JSON.stringify(input.ingredients));
  form.append("allergens", input.allergens);
  form.append("badge", input.badge);
  form.append("stock", String(input.stock));
  form.append("status", input.status);
  if (input.img) form.append("img", input.img);
  return form;
}

export const productsAPI = {
  getAll: async (): Promise<{ products: Product[] }> => {
    const res = await client.get<{ products: Product[] }>("/products");
    return res.data;
  },

  create: async (input: ProductFormInput): Promise<{ product: Product }> => {
    const res = await client.post<{ product: Product }>("/admin/products", toFormData(input), {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },

  update: async (currentName: string, input: ProductFormInput): Promise<{ product: Product }> => {
    const res = await client.put<{ product: Product }>(
      `/admin/products/${encodeURIComponent(currentName)}`,
      toFormData(input),
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return res.data;
  },

  delete: async (name: string): Promise<void> => {
    await client.delete(`/admin/products/${encodeURIComponent(name)}`);
  },
};
