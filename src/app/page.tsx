'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import { useTabletStore } from '@/store/tabletStore';
import { DataService } from '@/lib/data-service';
import { Screensaver } from '@/components/kiosk/Screensaver';
import { AdminPinModal, HiddenAdminTrigger } from '@/components/kiosk/AdminPinModal';
import { TabletSettingsModal } from '@/components/kiosk/TabletSettingsModal';
import { WelcomeScreen } from '@/components/kiosk/WelcomeScreen';
import { TablePicker } from '@/components/kiosk/TablePicker';
import { PeoplePicker } from '@/components/kiosk/PeoplePicker';
import { MenuCatalog } from '@/components/kiosk/MenuCatalog';
import { FloatingCart } from '@/components/kiosk/FloatingCart';
import { CheckoutModal } from '@/components/kiosk/CheckoutModal';
import { OrderConfirmation } from '@/components/kiosk/OrderConfirmation';

export default function TabletKioskPage() {
  const {
    config,
    activeScreen,
    isScreensaverActive,
    isAdminPinOpen,
    isSettingsOpen,
    setScreensaver,
    setAdminPinOpen,
    setSettingsOpen,
    setTableNumber,
    updateConfig,
  } = useTabletStore();

  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize data and load table config from localStorage
  useEffect(() => {
    DataService.initData();

    if (typeof window !== 'undefined') {
      const savedTable = localStorage.getItem('tableNumber');
      if (savedTable) {
        setTableNumber(parseInt(savedTable, 10));
      }

      const savedConfig = localStorage.getItem('tabletConfig');
      if (savedConfig) {
        try {
          updateConfig(JSON.parse(savedConfig));
        } catch {
          // Ignore parse error
        }
      }

      // Real physical battery detection & heartbeat telemetry
      const reportBattery = (level?: number, isCharging?: boolean) => {
        DataService.updateTabletHeartbeat(config.tableNumber, level, isCharging);
      };

      if (typeof navigator !== 'undefined' && 'getBattery' in navigator) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (navigator as any).getBattery().then((battery: any) => {
          const sync = () => {
            const level = Math.round(battery.level * 100);
            reportBattery(level, battery.charging);
          };
          sync();
          battery.addEventListener('levelchange', sync);
          battery.addEventListener('chargingchange', sync);
        }).catch(() => {
          reportBattery();
        });
      } else {
        reportBattery();
      }
    }
  }, [config.tableNumber, setTableNumber, updateConfig]);

  // Inactivity tracking for Screensaver / Attract Mode (60s)
  const resetInactivityTimer = useCallback(() => {
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
    }

    // Do not trigger screensaver while admin modals are active
    if (isAdminPinOpen || isSettingsOpen) return;

    const timeoutMs = (config.inactivityTimeoutSeconds || 60) * 1000;
    idleTimerRef.current = setTimeout(() => {
      setScreensaver(true);
    }, timeoutMs);
  }, [config.inactivityTimeoutSeconds, isAdminPinOpen, isSettingsOpen, setScreensaver]);

  useEffect(() => {
    const handleActivity = () => {
      if (!isScreensaverActive) {
        resetInactivityTimer();
      }
    };

    window.addEventListener('pointerdown', handleActivity, { passive: true });
    window.addEventListener('pointermove', handleActivity, { passive: true });
    window.addEventListener('keydown', handleActivity, { passive: true });
    window.addEventListener('touchstart', handleActivity, { passive: true });

    resetInactivityTimer();

    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      window.removeEventListener('pointerdown', handleActivity);
      window.removeEventListener('pointermove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('touchstart', handleActivity);
    };
  }, [isScreensaverActive, resetInactivityTimer]);

  const handleWakeScreensaver = () => {
    setScreensaver(false);
    resetInactivityTimer();
  };

  return (
    <main
      onContextMenu={(e) => e.preventDefault()} // Kiosk Mode: Disable right click context menu
      className="relative w-screen h-screen overflow-hidden bg-[#0B1017] text-white select-none"
      style={{ touchAction: 'pan-y' }}
    >
      {/* 1. HIDDEN ADMIN TRIGGER (TOP-LEFT 5s LONG PRESS) */}
      <HiddenAdminTrigger onTrigger={() => setAdminPinOpen(true)} />

      {/* 2. ADMIN PIN MODAL */}
      <AdminPinModal
        isOpen={isAdminPinOpen}
        onClose={() => setAdminPinOpen(false)}
        onSuccess={() => setSettingsOpen(true)}
        correctPin={config.pinCode}
      />

      {/* 3. TABLET SETTINGS MODAL */}
      <TabletSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setSettingsOpen(false)}
      />

      {/* 4. SCREENSAVER / ATTRACT MODE (FULLSCREEN 60s TIMEOUT) */}
      <Screensaver
        isOpen={isScreensaverActive}
        onWake={handleWakeScreensaver}
        tableNumber={config.tableNumber}
      />

      {/* 5. ACTIVE SCREEN FLOW */}
      <div className="w-full h-full">
        {activeScreen === 'table-picker' && <TablePicker />}
        {activeScreen === 'welcome' && <WelcomeScreen />}
        {activeScreen === 'people-picker' && <PeoplePicker />}
        {activeScreen === 'menu' && (
          <>
            <MenuCatalog />
            <FloatingCart />
          </>
        )}
        {activeScreen === 'checkout' && <CheckoutModal />}
        {activeScreen === 'confirmation' && <OrderConfirmation />}
      </div>
    </main>
  );
}
