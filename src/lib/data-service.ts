import { Order, MenuItem, Customer, TableRecord, OrderStatus } from '@/types';
import { INITIAL_MENU_ITEMS, INITIAL_TABLES, INITIAL_CUSTOMERS, INITIAL_ORDERS } from './mock-data';
import { supabase, isSupabaseConfigured } from './supabase';

const STORAGE_KEYS = {
  ORDERS: 'resto_orders_v2',
  MENU: 'resto_menu_v2',
  CUSTOMERS: 'resto_customers_v1',
  TABLES: 'resto_tables_v1',
  CONFIG: 'resto_tablet_config_v1',
};

// Cross-tab real-time sync channel
let broadcastChannel: BroadcastChannel | null = null;
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  broadcastChannel = new BroadcastChannel('restotablet_realtime');
}

export const DataService = {
  // --- INITIALIZATION ---
  initData() {
    if (typeof window === 'undefined') return;
    if (!localStorage.getItem(STORAGE_KEYS.MENU)) {
      localStorage.setItem(STORAGE_KEYS.MENU, JSON.stringify(INITIAL_MENU_ITEMS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.TABLES)) {
      localStorage.setItem(STORAGE_KEYS.TABLES, JSON.stringify(INITIAL_TABLES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.CUSTOMERS)) {
      localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(INITIAL_CUSTOMERS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.ORDERS)) {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(INITIAL_ORDERS));
    }
  },

  // --- MENU ITEMS ---
  async getMenuItems(): Promise<MenuItem[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('menu_items').select('*').order('name');
        if (!error && data && data.length > 0) return data as MenuItem[];
      } catch (e) {
        console.warn('Supabase fetch menu failed, using local storage fallback', e);
      }
    }
    if (typeof window === 'undefined') return INITIAL_MENU_ITEMS;
    const raw = localStorage.getItem(STORAGE_KEYS.MENU);
    return raw ? JSON.parse(raw) : INITIAL_MENU_ITEMS;
  },

  async updateMenuItem(item: MenuItem): Promise<void> {
    if (typeof window !== 'undefined') {
      const items = await this.getMenuItems();
      const idx = items.findIndex((m) => m.id === item.id);
      if (idx !== -1) {
        items[idx] = item;
      } else {
        items.push(item);
      }
      localStorage.setItem(STORAGE_KEYS.MENU, JSON.stringify(items));
      this.broadcast({ type: 'MENU_UPDATED', payload: item });
    }

    if (isSupabaseConfigured && supabase) {
      await supabase.from('menu_items').upsert(item);
    }
  },

  async toggleMenuItemAvailability(id: string): Promise<boolean> {
    const items = await this.getMenuItems();
    const item = items.find((m) => m.id === id);
    if (item) {
      item.is_available = !item.is_available;
      await this.updateMenuItem(item);
      return item.is_available;
    }
    return false;
  },

  // --- ORDERS ---
  async getOrders(): Promise<Order[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*, items:order_items(*), customer:customers(*)')
          .order('created_at', { ascending: false });
        if (!error && data) return data as Order[];
      } catch (e) {
        console.warn('Supabase fetch orders failed, using local fallback', e);
      }
    }
    if (typeof window === 'undefined') return INITIAL_ORDERS;
    const raw = localStorage.getItem(STORAGE_KEYS.ORDERS);
    return raw ? JSON.parse(raw) : INITIAL_ORDERS;
  },

  async createOrder(orderData: Omit<Order, 'id' | 'order_number' | 'created_at' | 'updated_at'>): Promise<Order> {
    const orders = await this.getOrders();
    const orderCount = orders.length + 1;
    const orderNumber = `CMD-${String(orderCount).padStart(3, '0')}`;
    const newOrderId = `ord-${Date.now()}`;

    const newOrder: Order = {
      ...orderData,
      id: newOrderId,
      order_number: orderNumber,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      items: orderData.items.map((it, idx) => ({
        ...it,
        id: `item-${Date.now()}-${idx}`,
        order_id: newOrderId,
      })),
    };

    // 1. Save or update customer
    if (orderData.customer) {
      await this.saveCustomer(orderData.customer);
    }

    // 2. Local save
    if (typeof window !== 'undefined') {
      const allOrders = [newOrder, ...orders];
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(allOrders));

      // Update table status to 'occupee'
      await this.updateTableStatus(newOrder.table_number, 'occupee');

      // Realtime notification
      this.broadcast({ type: 'NEW_ORDER', payload: newOrder });
    }

    // 3. Supabase save if configured
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('orders').insert({
          id: newOrder.id,
          order_number: newOrder.order_number,
          table_number: newOrder.table_number,
          people_count: newOrder.people_count,
          customer_id: newOrder.customer_id,
          total: newOrder.total,
          total_usd: newOrder.total_usd ?? null,
          status: newOrder.status,
          notes: newOrder.notes,
        });

        if (newOrder.items.length > 0) {
          await supabase.from('order_items').insert(
            newOrder.items.map((it) => ({
              id: it.id,
              order_id: newOrder.id,
              menu_item_id: it.menu_item_id,
              item_name: it.item_name,
              item_price: it.item_price,
              currency: it.currency ?? 'CDF',
              quantity: it.quantity,
              person_label: it.person_label,
              special_instructions: it.special_instructions,
            }))
          );
        }
      } catch (err) {
        console.error('Error inserting into Supabase:', err);
      }
    }

    return newOrder;
  },

  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<void> {
    if (typeof window !== 'undefined') {
      const orders = await this.getOrders();
      const target = orders.find((o) => o.id === orderId);
      if (target) {
        target.status = status;
        target.updated_at = new Date().toISOString();
        localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
        this.broadcast({ type: 'ORDER_STATUS_CHANGED', payload: { orderId, status } });
      }
    }

    if (isSupabaseConfigured && supabase) {
      await supabase.from('orders').update({ status, updated_at: new Date().toISOString() }).eq('id', orderId);
    }
  },

  // --- CUSTOMERS ---
  async getCustomers(): Promise<Customer[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('customers').select('*').order('last_visit', { ascending: false });
        if (!error && data) return data as Customer[];
      } catch (e) {
        console.warn('Supabase fetch customers failed, using local storage fallback', e);
      }
    }
    if (typeof window === 'undefined') return INITIAL_CUSTOMERS;
    const raw = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
    return raw ? JSON.parse(raw) : INITIAL_CUSTOMERS;
  },

  async saveCustomer(custData: { full_name: string; whatsapp: string }): Promise<Customer> {
    const customers = await this.getCustomers();
    // Normalize whatsapp (remove spaces, dashes)
    const cleanWa = custData.whatsapp.replace(/[\s\-\.\(\)]/g, '');
    const existing = customers.find((c) => c.whatsapp.replace(/[\s\-\.\(\)]/g, '') === cleanWa);

    let finalCust: Customer;
    if (existing) {
      existing.full_name = custData.full_name || existing.full_name;
      existing.total_orders = (existing.total_orders || 1) + 1;
      existing.last_visit = new Date().toISOString();
      finalCust = existing;
    } else {
      finalCust = {
        id: `cust-${Date.now()}`,
        full_name: custData.full_name,
        whatsapp: custData.whatsapp,
        total_orders: 1,
        last_visit: new Date().toISOString(),
        created_at: new Date().toISOString(),
      };
      customers.push(finalCust);
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
      this.broadcast({ type: 'CUSTOMER_UPDATED', payload: finalCust });
    }

    if (isSupabaseConfigured && supabase) {
      await supabase.from('customers').upsert(finalCust, { onConflict: 'whatsapp' });
    }

    return finalCust;
  },

  // --- TABLES ---
  async getTables(): Promise<TableRecord[]> {
    if (typeof window === 'undefined') return INITIAL_TABLES;
    const raw = localStorage.getItem(STORAGE_KEYS.TABLES);
    return raw ? JSON.parse(raw) : INITIAL_TABLES;
  },

  async updateTableStatus(tableNumber: number, status: TableRecord['status']): Promise<void> {
    const tables = await this.getTables();
    const table = tables.find((t) => t.number === tableNumber);
    if (table) {
      table.status = status;
      table.updated_at = new Date().toISOString();
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.TABLES, JSON.stringify(tables));
        this.broadcast({ type: 'TABLE_STATUS_CHANGED', payload: { tableNumber, status } });
      }
    }
  },

  async updateTabletHeartbeat(tableNumber: number, batteryLevel?: number, isCharging?: boolean): Promise<void> {
    const tables = await this.getTables();
    let table = tables.find((t) => t.number === tableNumber);
    if (!table) {
      table = {
        id: `table-${tableNumber}`,
        number: tableNumber,
        tablet_id: `TAB-${String(tableNumber).padStart(2, '0')}`,
        is_online: true,
        battery_level: batteryLevel ?? 100,
        is_charging: isCharging ?? false,
        status: 'libre',
        updated_at: new Date().toISOString(),
      };
      tables.push(table);
    } else {
      table.is_online = true;
      if (typeof batteryLevel === 'number') table.battery_level = batteryLevel;
      if (typeof isCharging === 'boolean') table.is_charging = isCharging;
      table.updated_at = new Date().toISOString();
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.TABLES, JSON.stringify(tables));
      this.broadcast({ type: 'TABLE_STATUS_CHANGED', payload: { tableNumber, batteryLevel, isCharging } });
    }
  },

  // --- REALTIME EVENT BROADCAST & LISTEN ---
  broadcast(event: { type: string; payload: unknown }) {
    if (broadcastChannel) {
      broadcastChannel.postMessage(event);
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('resto_event', { detail: event }));
    }
  },

  subscribe(callback: (event: { type: string; payload: unknown }) => void): () => void {
    const handleBroadcast = (e: MessageEvent) => {
      callback(e.data);
    };

    const handleCustom = (e: Event) => {
      const ce = e as CustomEvent;
      callback(ce.detail);
    };

    if (broadcastChannel) {
      broadcastChannel.addEventListener('message', handleBroadcast);
    }
    if (typeof window !== 'undefined') {
      window.addEventListener('resto_event', handleCustom);
    }

    // Realtime Supabase listener if configured
    let supabaseChannel: ReturnType<NonNullable<typeof supabase>['channel']> | null = null;
    if (isSupabaseConfigured && supabase) {
      supabaseChannel = supabase
        .channel('resto-global-channel')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload) => {
          callback({ type: 'SUPABASE_ORDER_CHANGE', payload });
        })
        .subscribe();
    }

    return () => {
      if (broadcastChannel) {
        broadcastChannel.removeEventListener('message', handleBroadcast);
      }
      if (typeof window !== 'undefined') {
        window.removeEventListener('resto_event', handleCustom);
      }
      if (supabaseChannel && supabase) {
        supabase.removeChannel(supabaseChannel);
      }
    };
  },
};
