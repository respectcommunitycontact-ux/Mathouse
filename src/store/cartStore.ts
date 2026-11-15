import { create } from 'zustand';
import { CartItem, MenuItem } from '@/types';
import { playTapSound } from '@/lib/sound';
import { MoneyTotals, sumMoney } from '@/lib/money';

interface CartState {
  items: CartItem[];
  isDrawerOpen: boolean;
  
  // Actions
  addItem: (menuItem: MenuItem, quantity: number, personLabel: string, specialInstructions?: string) => void;
  updateQuantity: (cartId: string, delta: number) => void;
  removeItem: (cartId: string) => void;
  clearCart: () => void;
  setDrawerOpen: (open: boolean) => void;
  
  // Computed helpers
  /** Totaux séparés : francs congolais et dollars */
  getTotals: () => MoneyTotals;
  getTotalItems: () => number;
  getItemsByPerson: () => Record<string, CartItem[]>;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  isDrawerOpen: false,

  addItem: (menuItem: MenuItem, quantity: number, personLabel: string, specialInstructions?: string) => {
    playTapSound();
    set((state) => {
      // Find if same item for same person exists
      const existingIdx = state.items.findIndex(
        (it) => it.menu_item.id === menuItem.id && it.person_label === personLabel && it.special_instructions === specialInstructions
      );

      if (existingIdx !== -1) {
        const updated = [...state.items];
        updated[existingIdx].quantity += quantity;
        return { items: updated };
      }

      const newItem: CartItem = {
        cart_id: `${menuItem.id}-${personLabel}-${Date.now()}`,
        menu_item: menuItem,
        quantity,
        person_label: personLabel,
        special_instructions: specialInstructions,
      };

      return { items: [...state.items, newItem] };
    });
  },

  updateQuantity: (cartId: string, delta: number) => {
    playTapSound();
    set((state) => {
      const updated = state.items
        .map((it) => {
          if (it.cart_id === cartId) {
            const newQty = it.quantity + delta;
            return newQty > 0 ? { ...it, quantity: newQty } : null;
          }
          return it;
        })
        .filter(Boolean) as CartItem[];

      return { items: updated };
    });
  },

  removeItem: (cartId: string) => {
    playTapSound();
    set((state) => ({
      items: state.items.filter((it) => it.cart_id !== cartId),
    }));
  },

  clearCart: () => {
    set({ items: [], isDrawerOpen: false });
  },

  setDrawerOpen: (open: boolean) => set({ isDrawerOpen: open }),

  getTotals: () => {
    const { items } = get();
    return sumMoney(items.map((it) => ({ price: it.menu_item.price, quantity: it.quantity, currency: it.menu_item.currency })));
  },

  getTotalItems: () => {
    const { items } = get();
    return items.reduce((sum, item) => sum + item.quantity, 0);
  },

  getItemsByPerson: () => {
    const { items } = get();
    const grouped: Record<string, CartItem[]> = {};
    for (const it of items) {
      const label = it.person_label || 'Toute la table';
      if (!grouped[label]) {
        grouped[label] = [];
      }
      grouped[label].push(it);
    }
    return grouped;
  },
}));
