import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { CookieDetail } from "@/components/ProductDetailCard";
import { resolveProductImage } from "@/lib/productImages";

export type CartItem = {
  id: string;
  name: string;
  subtitle: string;
  price: string;
  priceValue: number;
  img: string;
  weight: string;
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  addItem: (product: CookieDetail, quantity: number) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
};

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "donnalupe-cart";

// Imagens base64 (data:image/...) podem ter centenas de KB cada.
// Armazenamos apenas uma string vazia no storage e resolvemos o fallback ao carregar.
function stripLargeImage(img: string): string {
  return img.startsWith("data:image/") ? "" : img;
}

function loadFromStorage(): CartItem[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const items = JSON.parse(stored) as CartItem[];
    // Resolve imagem: se estava vazia (era base64 e foi omitida), usa fallback do catálogo
    return items.map((item) => ({ ...item, img: resolveProductImage(item.img) }));
  } catch {
    return [];
  }
}

function saveToStorage(items: CartItem[]) {
  try {
    const lean = items.map(({ img, ...rest }) => ({ ...rest, img: stripLargeImage(img) }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lean));
  } catch {
    // QuotaExceededError — ignora; o carrinho continua funcional em memória
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(loadFromStorage);

  useEffect(() => {
    saveToStorage(items);
  }, [items]);

  function addItem(product: CookieDetail, quantity: number) {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.id === product.id ? { ...i, quantity: i.quantity + quantity } : i,
        );
      }
      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          subtitle: product.subtitle,
          price: product.price,
          priceValue: product.priceValue,
          img: product.img,
          weight: product.weight,
          quantity,
        },
      ];
    });
  }

  function removeItem(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  function updateQuantity(id: string, delta: number) {
    setItems((prev) =>
      prev
        .map((i) => (i.id === id ? { ...i, quantity: i.quantity + delta } : i))
        .filter((i) => i.quantity > 0),
    );
  }

  function clearCart() {
    setItems([]);
  }

  const { totalItems, subtotal } = useMemo(
    () => ({
      totalItems: items.reduce((s, i) => s + i.quantity, 0),
      subtotal: items.reduce((s, i) => s + i.priceValue * i.quantity, 0),
    }),
    [items],
  );

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQuantity, clearCart, totalItems, subtotal }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
