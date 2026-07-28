import { useState, useEffect, useCallback } from 'react';
import type { Product, CartItem } from '@/types';

const CART_KEY = 'kyrgyz-souvenirs-cart';

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(CART_KEY);
      if (saved) {
        setItems(JSON.parse(saved));
      }
    } catch {
      // ignore
    }
  }, []);

  const persist = useCallback((newItems: CartItem[]) => {
    setItems(newItems);
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(newItems));
    } catch {
      // ignore
    }
  }, []);

  const addToCart = useCallback((product: Product, qty: number = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      const maxQty = product.stock_quantity || 0;
      let newItems: CartItem[];
      if (existing) {
        const newQty = Math.min(existing.quantity + qty, maxQty || existing.quantity + qty);
        newItems = prev.map((i) =>
          i.product.id === product.id ? { ...i, quantity: newQty } : i
        );
      } else {
        newItems = [...prev, { product, quantity: Math.min(qty, maxQty || qty) }];
      }
      try {
        localStorage.setItem(CART_KEY, JSON.stringify(newItems));
      } catch {
        // ignore
      }
      return newItems;
    });
    setIsOpen(true);
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setItems((prev) => {
      const newItems = prev.filter((i) => i.product.id !== productId);
      try {
        localStorage.setItem(CART_KEY, JSON.stringify(newItems));
      } catch {
        // ignore
      }
      return newItems;
    });
  }, []);

  const updateQuantity = useCallback((productId: string, qty: number) => {
    if (qty < 1) return;
    setItems((prev) => {
      const item = prev.find((i) => i.product.id === productId);
      const maxQty = item?.product.stock_quantity || 999;
      const clampedQty = Math.min(qty, maxQty);
      const newItems = prev.map((i) =>
        i.product.id === productId ? { ...i, quantity: clampedQty } : i
      );
      try {
        localStorage.setItem(CART_KEY, JSON.stringify(newItems));
      } catch {
        // ignore
      }
      return newItems;
    });
  }, []);

  const clearCart = useCallback(() => {
    persist([]);
  }, [persist]);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

  return {
    items,
    isOpen,
    setIsOpen,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    totalItems,
    totalPrice,
  };
}
