import { Order, MenuItem, Customer, TableRecord, OrderStatus } from '@/types';
import { INITIAL_MENU_ITEMS, INITIAL_TABLES, INITIAL_CUSTOMERS, INITIAL_ORDERS } from './mock-data';
import { supabase, isSupabaseConfigured } from './supabase';

const STORAGE_KEYS = {
  ORDERS: 'resto_orders_v3',
  MENU: 'resto_menu_v2',
  CUSTOMERS: 'resto_customers_v2',
  TABLES: 'resto_tables_v2',
  CONFIG: 'resto_tablet_config_v1',
};

/** True when Supabase says the database function does not exist yet (security script not run). */
const isMissingFunction = (error: { code?: string; message?: string }) =>
  error.code === 'PGRST202' || error.code === '42883' || /could not find the function/i.test(error.message ?? '');

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
        const { data, error } = await supabase.from('menu_items').select('*').order('id');
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
      const { error } = await supabase.from('menu_items').upsert({
        id: item.id,
        name: item.name,
        description: item.description,
        price: item.price,
        currency: item.currency ?? 'CDF',
        category: item.category,
        image_url: item.image_url,
        is_available: item.is_available,
        tags: item.tags ?? [],
        preparation_time_minutes: item.preparation_time_minutes ?? null,
      });
      if (error) console.error('Supabase: enregistrement du plat impossible', error);
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
    const now = new Date().toISOString();
    const newOrderId = `ord-${Date.now()}`;
    const newOrder: Order = {
      ...orderData,
      id: newOrderId,
      order_number: '',
      created_at: now,
      updated_at: now,
      items: orderData.items.map((it, idx) => ({
        ...it,
        id: `item-${Date.now()}-${idx}`,
        order_id: newOrderId,
      })),
    };

    if (isSupabaseConfigured && supabase) {
      // Secure path: the database checks the order and takes prices from the menu itself.
      const { data, error } = await supabase.rpc('place_order', {
        p: {
          id: newOrder.id,
          table_number: newOrder.table_number,
          people_count: newOrder.people_count,
          notes: newOrder.notes ?? null,
          customer: newOrder.customer
            ? { full_name: newOrder.customer.full_name, whatsapp: newOrder.customer.whatsapp }
            : null,
          items: newOrder.items.map((it) => ({
            id: it.id,
            menu_item_id: it.menu_item_id,
            quantity: it.quantity,
            person_label: it.person_label,
            special_instructions: it.special_instructions ?? null,
          })),
        },
      });

      if (!error && data) {
        const res = data as { order_number: string; customer_id: string | null; total: number; total_usd: number | null };
        newOrder.order_number = res.order_number;
        newOrder.customer_id = res.customer_id ?? undefined;
        newOrder.total = Number(res.total);
        newOrder.total_usd = res.total_usd ? Number(res.total_usd) : undefined;
      } else if (error && isMissingFunction(error)) {
        // Database not yet updated with the security script: previous behaviour
        await this.legacyInsertOrder(newOrder);
      } else {
        console.error('Supabase: commande refusée', error);
        throw error;
      }
    } else {
      const orders = await this.getOrders();
      newOrder.order_number = `CMD-${String(orders.length + 1).padStart(3, '0')}`;
      if (orderData.customer) {
        const saved = await this.saveCustomer(orderData.customer);
        newOrder.customer_id = saved.id;
        newOrder.customer = saved;
      }
    }

    // Local copy + live notification on this device
    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem(STORAGE_KEYS.ORDERS);
      const local: Order[] = raw ? JSON.parse(raw) : [];
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify([newOrder, ...local].slice(0, 200)));
      if (!isSupabaseConfigured) await this.updateTableStatus(newOrder.table_number, 'occupee');
      this.broadcast({ type: 'NEW_ORDER', payload: newOrder });
    }

    return newOrder;
  },

  /** Direct inserts, used only until the security script has been run in Supabase. */
  async legacyInsertOrder(newOrder: Order): Promise<void> {
    if (!supabase) return;
    const orders = await this.getOrders();
    newOrder.order_number = `CMD-${String(orders.length + 1).padStart(3, '0')}`;
    if (newOrder.customer) {
      const saved = await this.saveCustomer(newOrder.customer);
      newOrder.customer_id = saved.id;
      newOrder.customer = saved;
    }
    const { error: orderError } = await supabase.from('orders').insert({
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
    if (orderError) throw orderError;
    if (newOrder.items.length > 0) {
      const { error: itemsError } = await supabase.from('order_items').insert(
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
      if (itemsError) throw itemsError;
    }
    await this.updateTableStatus(newOrder.table_number, 'occupee');
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
      const { error } = await supabase.from('orders').update({ status, updated_at: new Date().toISOString() }).eq('id', orderId);
      if (error) console.error('Supabase: mise à jour de la commande impossible', error);
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
      const { error } = await supabase.from('customers').upsert(
        {
          id: finalCust.id,
          full_name: finalCust.full_name,
          whatsapp: finalCust.whatsapp,
          notes: finalCust.notes ?? null,
          total_orders: finalCust.total_orders,
          last_visit: finalCust.last_visit,
          created_at: finalCust.created_at,
        },
        { onConflict: 'whatsapp' }
      );
      if (error) console.error('Supabase: enregistrement du client impossible', error);
    }

    return finalCust;
  },

  // --- TABLES ---
  async getTables(): Promise<TableRecord[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('tables').select('*').order('number');
        if (!error && data && data.length > 0) return data as TableRecord[];
      } catch (e) {
        console.warn('Supabase fetch tables failed, using local storage fallback', e);
      }
    }
    if (typeof window === 'undefined') return INITIAL_TABLES;
    const raw = localStorage.getItem(STORAGE_KEYS.TABLES);
    return raw ? JSON.parse(raw) : INITIAL_TABLES;
  },

  async updateTableStatus(tableNumber: number, status: TableRecord['status']): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      let { error } = await supabase.rpc('set_table_status', { p_number: tableNumber, p_status: status });
      if (error && isMissingFunction(error)) {
        ({ error } = await supabase
          .from('tables')
          .update({ status, updated_at: new Date().toISOString() })
          .eq('number', tableNumber));
      }
      if (error) console.error('Supabase: mise à jour de la table impossible', error);
      this.broadcast({ type: 'TABLE_STATUS_CHANGED', payload: { tableNumber, status } });
      return;
    }
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
    if (isSupabaseConfigured && supabase) {
      let { error } = await supabase.rpc('tablet_heartbeat', {
        p_number: tableNumber,
        p_battery: typeof batteryLevel === 'number' ? batteryLevel : null,
        p_charging: typeof isCharging === 'boolean' ? isCharging : null,
      });
      if (error && isMissingFunction(error)) {
        const patch: Record<string, unknown> = { is_online: true, updated_at: new Date().toISOString() };
        if (typeof batteryLevel === 'number') patch.battery_level = batteryLevel;
        if (typeof isCharging === 'boolean') patch.is_charging = isCharging;
        ({ error } = await supabase.from('tables').update(patch).eq('number', tableNumber));
      }
      if (error) console.error('Supabase: état de la tablette non envoyé', error);
      return;
    }
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
      const map: Record<string, string> = {
        orders: 'SUPABASE_ORDER_CHANGE',
        order_items: 'SUPABASE_ORDER_CHANGE',
        tables: 'TABLE_STATUS_CHANGED',
        menu_items: 'MENU_UPDATED',
        customers: 'CUSTOMER_UPDATED',
      };
      let channel = supabase.channel(`resto-${Math.random().toString(36).slice(2)}`);
      for (const table of Object.keys(map)) {
        channel = channel.on('postgres_changes', { event: '*', schema: 'public', table }, (payload) => {
          callback({ type: map[table], payload: { ...payload, table } });
        });
      }
      supabaseChannel = channel.subscribe();
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
