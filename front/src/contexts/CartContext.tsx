import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { CookieDetail } from "@/components/ProductDetailCard";

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

function loadFromStorage(): CartItem[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? (JSON.parse(stored) as CartItem[]) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(loadFromStorage);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
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
