import { create } from 'zustand';
import { KioskScreen, TabletConfig } from '@/types';
import { DataService } from '@/lib/data-service';
import { useCartStore } from '@/store/cartStore';

interface CustomerSession {
  fullName: string;
  whatsapp: string;
  savedAt: number; // timestamp
}

interface TabletState {
  // Tablet Hardware / Kiosk Config
  config: TabletConfig;
  isScreensaverActive: boolean;
  isAdminPinOpen: boolean;
  isSettingsOpen: boolean;

  // Session & Customer Flow
  activeScreen: KioskScreen;
  /** true on a customer's own phone (opened from a room / apartment QR code) */
  guestMode: boolean;
  peopleCount: number;
  selectedGuestForAdd: string; // "Personne 1", "Personne 2"...
  customerSession: CustomerSession | null;
  lastOrderId: string | null;
  lastOrderNumber: string | null;

  // Actions
  setTableNumber: (tableNumber: number) => void;
  updateConfig: (newConfig: Partial<TabletConfig>) => void;
  setScreensaver: (active: boolean) => void;
  setAdminPinOpen: (open: boolean) => void;
  setSettingsOpen: (open: boolean) => void;
  setActiveScreen: (screen: KioskScreen) => void;
  setPeopleCount: (count: number) => void;
  setSelectedGuestForAdd: (guest: string) => void;
  saveCustomerSession: (fullName: string, whatsapp: string) => void;
  setLastOrderInfo: (orderId: string, orderNumber: string) => void;
  resetSessionForNewRound: () => void; // Keep customer if within 30 min, reset cart and screen
  fullResetSession: () => void;
  /** La serveuse choisit la table : nouvelle session client propre, puis écran d'accueil client */
  startTableSession: (tableNumber: number) => void;
  /** Customer phone opened from a QR code: fixed place, no waitress steps */
  startGuestSession: (placeNumber: number) => void;
  /** Le client rend la tablette : on vide tout et on revient au choix de table */
  handBackToWaiter: () => void;
  callWaiter: () => Promise<void>;
  requestBill: () => Promise<void>;
}

const DEFAULT_CONFIG: TabletConfig = {
  tableNumber: 1,
  tabletId: 'TAB-TABLE-01',
  pinCode: '1234',
  wifiSsid: '',
  wifiPassword: '',
  inactivityTimeoutSeconds: 60,
};

export const useTabletStore = create<TabletState>((set, get) => ({
  config: DEFAULT_CONFIG,
  isScreensaverActive: false,
  isAdminPinOpen: false,
  isSettingsOpen: false,
  activeScreen: 'table-picker',
  guestMode: false,
  peopleCount: 1,
  selectedGuestForAdd: 'Personne 1',
  customerSession: null,
  lastOrderId: null,
  lastOrderNumber: null,

  setTableNumber: (tableNumber: number) => {
    set((state) => {
      const updated = { ...state.config, tableNumber, tabletId: `TAB-TABLE-${String(tableNumber).padStart(2, '0')}` };
      if (typeof window !== 'undefined') {
        localStorage.setItem('tableNumber', String(tableNumber));
        localStorage.setItem('tabletConfig', JSON.stringify(updated));
      }
      return { config: updated };
    });
  },

  updateConfig: (newConfig: Partial<TabletConfig>) => {
    set((state) => {
      const updated = { ...state.config, ...newConfig };
      if (typeof window !== 'undefined') {
        localStorage.setItem('tableNumber', String(updated.tableNumber));
        localStorage.setItem('tabletConfig', JSON.stringify(updated));
      }
      return { config: updated };
    });
  },

  setScreensaver: (active: boolean) => set({ isScreensaverActive: active }),
  setAdminPinOpen: (open: boolean) => set({ isAdminPinOpen: open }),
  setSettingsOpen: (open: boolean) => set({ isSettingsOpen: open }),
  setActiveScreen: (screen: KioskScreen) => set({ activeScreen: screen }),
  setPeopleCount: (count: number) => {
    set({
      peopleCount: count,
      selectedGuestForAdd: 'Personne 1',
    });
  },
  setSelectedGuestForAdd: (guest: string) => set({ selectedGuestForAdd: guest }),

  saveCustomerSession: (fullName: string, whatsapp: string) => {
    const session: CustomerSession = {
      fullName,
      whatsapp,
      savedAt: Date.now(),
    };
    set({ customerSession: session });
    if (typeof window !== 'undefined') {
      localStorage.setItem('customer_session', JSON.stringify(session));
    }
  },

  setLastOrderInfo: (orderId: string, orderNumber: string) => {
    set({ lastOrderId: orderId, lastOrderNumber: orderNumber });
  },

  resetSessionForNewRound: () => {
    // Check if customer session is still valid (< 30 minutes)
    const { customerSession } = get();
    let validSession = customerSession;
    const THIRTY_MINUTES = 30 * 60 * 1000;
    if (customerSession && Date.now() - customerSession.savedAt > THIRTY_MINUTES) {
      validSession = null;
    }
    set({
      activeScreen: 'menu',
      customerSession: validSession,
      selectedGuestForAdd: 'Personne 1',
    });
  },

  fullResetSession: () => {
    set({
      activeScreen: 'welcome',
      peopleCount: 1,
      customerSession: null,
      selectedGuestForAdd: 'Personne 1',
      lastOrderId: null,
      lastOrderNumber: null,
    });
    if (typeof window !== 'undefined') {
      localStorage.removeItem('customer_session');
    }
  },

  startTableSession: (tableNumber: number) => {
    get().setTableNumber(tableNumber);
    useCartStore.getState().clearCart();
    set({
      activeScreen: 'welcome',
      peopleCount: 1,
      customerSession: null,
      selectedGuestForAdd: 'Personne 1',
      lastOrderId: null,
      lastOrderNumber: null,
    });
    if (typeof window !== 'undefined') {
      localStorage.removeItem('customer_session');
    }
    // A table that was free is now taken by these clients
    DataService.getTables().then((tables) => {
      const t = tables.find((x) => x.number === tableNumber);
      if (t && t.status === 'libre') DataService.updateTableStatus(tableNumber, 'occupee');
    });
  },

  startGuestSession: (placeNumber: number) => {
    set({ guestMode: true });
    get().startTableSession(placeNumber);
  },

  handBackToWaiter: () => {
    if (get().guestMode) {
      // A customer phone never goes back to the waitress screen
      useCartStore.getState().clearCart();
      set({ activeScreen: 'welcome', selectedGuestForAdd: 'Personne 1' });
      return;
    }
    useCartStore.getState().clearCart();
    useCartStore.getState().setDrawerOpen(false);
    set({
      activeScreen: 'table-picker',
  guestMode: false,
      peopleCount: 1,
      customerSession: null,
      selectedGuestForAdd: 'Personne 1',
      lastOrderId: null,
      lastOrderNumber: null,
    });
    if (typeof window !== 'undefined') {
      localStorage.removeItem('customer_session');
    }
  },

  callWaiter: async () => {
    const { config } = get();
    await DataService.updateTableStatus(config.tableNumber, 'serveur_appele');
  },

  requestBill: async () => {
    const { config } = get();
    await DataService.updateTableStatus(config.tableNumber, 'addition_demandee');
  },
}));
