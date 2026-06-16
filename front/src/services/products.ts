import { request } from "@/api";
import type { CookieDetail } from "@/components/ProductDetailCard";

export type ApiProduct = {
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

type ProductsResponse = {
  products: ApiProduct[];
};

type ProductResponse = {
  product: ApiProduct;
};

export function formatBRL(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function toCookieDetail(product: ApiProduct): CookieDetail {
  return {
    id: product.name,
    name: product.name,
    subtitle: product.subtitle,
    category: product.category,
    description: product.description,
    price: formatBRL(product.price),
    priceValue: product.price,
    weight: product.weight,
    stock: product.stock,
    ingredients: product.ingredients,
    allergens: product.allergens,
    badge: product.badge,
    img: product.img,
  };
}

export async function getProducts(): Promise<CookieDetail[]> {
  const res = await request<ProductsResponse>("/products");
  return res.products.map(toCookieDetail);
}

export async function getProductByName(name: string): Promise<CookieDetail> {
  const res = await request<ProductResponse>(`/products/${encodeURIComponent(name)}`);
  return toCookieDetail(res.product);
}
