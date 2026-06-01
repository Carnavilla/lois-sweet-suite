import { useEffect, useState } from "react";

export type CartItem = {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
  quantity: number;
};

const KEY = "lois-cart";

export function readCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function writeCart(items: CartItem[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("lois-cart-changed"));
}

export function addToCart(item: Omit<CartItem, "quantity">, qty = 1) {
  const cart = readCart();
  const existing = cart.find((c) => c.id === item.id);
  if (existing) existing.quantity += qty;
  else cart.push({ ...item, quantity: qty });
  writeCart(cart);
}

export function useCart() {
  const [cart, setCart] = useState<CartItem[]>([]);
  useEffect(() => {
    setCart(readCart());
    const onChange = () => setCart(readCart());
    window.addEventListener("lois-cart-changed", onChange);
    return () => window.removeEventListener("lois-cart-changed", onChange);
  }, []);
  return cart;
}