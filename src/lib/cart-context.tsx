"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useToast } from "@/components/ui/Toast";

export interface CartItemInput {
  productId: string;
  quantity: number;
}

interface CartContextValue {
  items: CartItemInput[];
  itemCount: number;
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  addItem: (productId: string, quantity?: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

const CART_STORAGE_KEY = "petsworld_cart_items";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItemInput[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const toast = useToast();

  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        setItems(JSON.parse(stored));
      }
    } catch {
      // LocalStorage unavailable
    }
    setMounted(true);
  }, []);

  const openDrawer = useCallback(() => setIsDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setIsDrawerOpen(false), []);

  const persist = useCallback((updated: CartItemInput[]) => {
    setItems(updated);
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
  }, []);

  const addItem = useCallback(
    (productId: string, quantity = 1) => {
      let updated: CartItemInput[];
      const existing = items.find((i) => i.productId === productId);
      if (existing) {
        updated = items.map((i) =>
          i.productId === productId ? { ...i, quantity: i.quantity + quantity } : i
        );
      } else {
        updated = [...items, { productId, quantity }];
      }
      persist(updated);
      setIsDrawerOpen(true);
      toast.success("Added to shopping cart.");
    },
    [items, persist, toast]
  );

  const updateQuantity = useCallback(
    (productId: string, quantity: number) => {
      if (quantity <= 0) {
        persist(items.filter((i) => i.productId !== productId));
        toast.info("Item removed from cart.");
      } else {
        persist(
          items.map((i) => (i.productId === productId ? { ...i, quantity } : i))
        );
      }
    },
    [items, persist, toast]
  );

  const removeItem = useCallback(
    (productId: string) => {
      persist(items.filter((i) => i.productId !== productId));
      toast.info("Item removed from cart.");
    },
    [items, persist, toast]
  );

  const clearCart = useCallback(() => {
    persist([]);
  }, [persist]);

  const itemCount = mounted ? items.reduce((sum, i) => sum + i.quantity, 0) : 0;

  return (
    <CartContext.Provider
      value={{
        items: mounted ? items : [],
        itemCount,
        isDrawerOpen,
        openDrawer,
        closeDrawer,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    return {
      items: [],
      itemCount: 0,
      isDrawerOpen: false,
      openDrawer: () => {},
      closeDrawer: () => {},
      addItem: () => {},
      updateQuantity: () => {},
      removeItem: () => {},
      clearCart: () => {},
    };
  }
  return context;
}
