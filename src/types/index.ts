export type OrderStatus = 'nouvelle' | 'preparation' | 'prete' | 'servie' | 'annulee';

export type TableStatus = 'libre' | 'occupee' | 'addition_demandee' | 'serveur_appele';

export type MenuCategory =
  | 'Viandes'
  | 'Poissons'
  | 'Volailles'
  | 'Fruits de mer'
  | 'Planches Libota'
  | 'Fast-food'
  | 'Légumes'
  | 'Accompagnements'
  | 'Gâteaux d’anniversaire'
  | 'Boissons sucrées'
  | 'Bières'
  | 'Jus naturels'
  | 'Liqueurs & vins';

/** CDF = franc congolais (défaut), USD = dollar. Jamais convertis. */
export type Currency = 'CDF' | 'USD';

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  /** Défaut : CDF (francs congolais) */
  currency?: Currency;
  category: MenuCategory;
  image_url: string;
  is_available: boolean;
  tags?: string[];
  preparation_time_minutes?: number;
}

export interface Customer {
  id: string;
  full_name: string;
  whatsapp: string;
  notes?: string;
  total_orders: number;
  last_visit: string;
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  menu_item_id: string;
  item_name: string;
  item_price: number;
  currency?: Currency;
  quantity: number;
  person_label: string; // "Personne 1", "Personne 2", etc.
  special_instructions?: string;
}

export interface Order {
  id: string;
  order_number: string;
  table_number: number;
  people_count: number;
  customer_id?: string;
  customer?: Customer;
  /** Total en francs congolais */
  total: number;
  /** Total des articles en dollars (s'il y en a) */
  total_usd?: number;
  status: OrderStatus;
  notes?: string;
  items: OrderItem[];
  created_at: string;
  updated_at: string;
}

export interface TableRecord {
  id: string;
  number: number;
  tablet_id: string;
  is_online: boolean;
  battery_level: number;
  is_charging?: boolean;
  status: TableStatus;
  updated_at: string;
}

export interface CartItem {
  cart_id: string; // Unique ID for this specific cart entry (dish + person)
  menu_item: MenuItem;
  quantity: number;
  person_label: string; // "Personne 1", "Personne 2", "Toute la table"
  special_instructions?: string;
}

export interface TabletConfig {
  tableNumber: number;
  tabletId: string;
  pinCode: string;
  wifiSsid: string;
  wifiPassword?: string;
  inactivityTimeoutSeconds: number;
}

export type KioskScreen = 
  | 'welcome'
  | 'people-picker'
  | 'menu'
  | 'checkout'
  | 'confirmation';
