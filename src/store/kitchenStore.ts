import { create } from 'zustand';
import { Order, OrderStatus } from '@/types';
import { DataService } from '@/lib/data-service';
import { playOrderChime } from '@/lib/sound';

interface KitchenState {
  orders: Order[];
  isLoading: boolean;
  activeFilter: OrderStatus | 'all';
  searchQuery: string;

  fetchOrders: () => Promise<void>;
  updateStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  setActiveFilter: (filter: OrderStatus | 'all') => void;
  setSearchQuery: (query: string) => void;
  initRealtime: () => () => void;
}

// Several database events arrive for one order (the order, then each dish): refresh once
let refreshTimer: ReturnType<typeof setTimeout> | null = null;

export const useKitchenStore = create<KitchenState>((set, get) => ({
  orders: [],
  isLoading: true,
  activeFilter: 'all',
  searchQuery: '',

  fetchOrders: async () => {
    set({ isLoading: true });
    const orders = await DataService.getOrders();
    set({ orders, isLoading: false });
  },

  updateStatus: async (orderId: string, status: OrderStatus) => {
    await DataService.updateOrderStatus(orderId, status);
    set((state) => ({
      orders: state.orders.map((o) => (o.id === orderId ? { ...o, status, updated_at: new Date().toISOString() } : o)),
    }));
  },

  setActiveFilter: (filter) => set({ activeFilter: filter }),
  setSearchQuery: (query) => set({ searchQuery: query }),

  initRealtime: () => {
    // Initial fetch
    get().fetchOrders();

    // Subscribe to realtime updates
    const unsubscribe = DataService.subscribe(async (event) => {
      if (event.type === 'NEW_ORDER') {
        playOrderChime();
        const newOrder = event.payload as Order;
        set((state) => ({
          orders: [newOrder, ...state.orders.filter((o) => o.id !== newOrder.id)],
        }));
      } else if (event.type === 'ORDER_STATUS_CHANGED') {
        const { orderId, status } = event.payload as { orderId: string; status: OrderStatus };
        set((state) => ({
          orders: state.orders.map((o) => (o.id === orderId ? { ...o, status } : o)),
        }));
      } else if (event.type === 'SUPABASE_ORDER_CHANGE') {
        const change = event.payload as { eventType?: string; table?: string; new?: { id?: string } };
        // New order from another tablet: ring the kitchen
        if (change.table === 'orders' && change.eventType === 'INSERT') {
          const id = change.new?.id;
          if (!id || !get().orders.some((o) => o.id === id)) playOrderChime();
        }
        if (refreshTimer) clearTimeout(refreshTimer);
        refreshTimer = setTimeout(async () => {
          const orders = await DataService.getOrders();
          set({ orders });
        }, 500);
      }
    });

    return unsubscribe;
  },
}));
