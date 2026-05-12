import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Money } from './commerce';

export type ForgeIntensity = 'low' | 'medium' | 'high';

interface ForgeState {
  intensity: ForgeIntensity;
  setIntensity: (intensity: ForgeIntensity) => void;
}

export const useForgeStore = create<ForgeState>((set) => ({
  intensity: 'medium',
  setIntensity: (intensity) => set({ intensity })
}));

export type CartItem = {
  productHandle: string;
  productTitle: string;
  variantId: string;
  variantTitle: string;
  sku: string;
  price: Money;
  quantity: number;
};

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  removeItem: (variantId: string) => void;
  clearCart: () => void;
}

const clampQuantity = (quantity: number) => Math.min(Math.max(Math.trunc(quantity) || 1, 1), 25);

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (item) => set((state) => {
        const safeItem = { ...item, quantity: clampQuantity(item.quantity) };
        const existing = state.items.find((cartItem) => cartItem.variantId === safeItem.variantId);
        if (!existing) return { items: [...state.items, safeItem] };

        return {
          items: state.items.map((cartItem) => cartItem.variantId === safeItem.variantId
            ? { ...cartItem, quantity: clampQuantity(cartItem.quantity + safeItem.quantity), price: safeItem.price }
            : cartItem)
        };
      }),
      updateQuantity: (variantId, quantity) => set((state) => ({
        items: state.items.map((item) => item.variantId === variantId ? { ...item, quantity: clampQuantity(quantity) } : item)
      })),
      removeItem: (variantId) => set((state) => ({ items: state.items.filter((item) => item.variantId !== variantId) })),
      clearCart: () => set({ items: [] })
    }),
    {
      name: 'strange-stone-cart',
      partialize: (state) => ({ items: state.items })
    }
  )
);
