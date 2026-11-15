'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { QrCode } from 'lucide-react';
import { useTabletStore } from '@/store/tabletStore';
import { DataService } from '@/lib/data-service';
import { placeBySlug } from '@/lib/places';
import { WelcomeScreen } from '@/components/kiosk/WelcomeScreen';
import { PeoplePicker } from '@/components/kiosk/PeoplePicker';
import { MenuCatalog } from '@/components/kiosk/MenuCatalog';
import { FloatingCart } from '@/components/kiosk/FloatingCart';
import { CheckoutModal } from '@/components/kiosk/CheckoutModal';
import { OrderConfirmation } from '@/components/kiosk/OrderConfirmation';

/**
 * Page opened by scanning the QR code of a room or an apartment
 * (e.g. /commande/chambre-2). The customer orders from their own phone;
 * the order reaches the kitchen tagged with the room / apartment.
 */
export default function GuestOrderPage({ params }: { params: { lieu: string } }) {
  const place = placeBySlug(decodeURIComponent(params.lieu || ''));
  const valid = Boolean(place && place.kind !== 'table');

  const { activeScreen, guestMode, config, startGuestSession } = useTabletStore();
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!place || !valid) return;
    DataService.initData();
    startGuestSession(place.number);
    setStarted(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.lieu]);

  // Safety: a customer's phone never shows the waitress screen
  useEffect(() => {
    if (started && place && activeScreen === 'table-picker') startGuestSession(place.number);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeScreen, started]);

  if (!valid) {
    return (
      <main className="min-h-[100dvh] w-full flex flex-col items-center justify-center gap-5 px-6 text-center bg-[#0B0E14] text-slate-100">
        <div className="relative h-12 w-48">
          <Image src="/logo.png" alt="Mat House Restaurant" fill className="object-contain" priority />
        </div>
        <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
          <QrCode className="w-7 h-7 text-[#F48C06]" />
        </div>
        <h1 className="text-2xl font-serif font-semibold">QR code non reconnu</h1>
        <p className="text-sm text-slate-400 max-w-xs">
          Ce lien ne correspond à aucune chambre ni aucun appartement. Scannez à nouveau le QR code affiché dans votre
          logement, ou contactez la réception.
        </p>
      </main>
    );
  }

  const ready = started && guestMode && config.tableNumber === place!.number;

  return (
    <main
      onContextMenu={(e) => e.preventDefault()}
      className="relative w-screen h-[100dvh] overflow-hidden bg-[#0B1017] text-white select-none"
      style={{ touchAction: 'pan-y' }}
    >
      {ready && (
        <div className="w-full h-full">
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
      )}
    </main>
  );
}
