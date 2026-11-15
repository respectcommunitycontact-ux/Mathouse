'use client';

import { useEffect } from 'react';
import { registerServiceWorker } from '@/lib/pwa';

/** Mounted once in the root layout: registers the service worker and starts listening for the install prompt. */
export function PwaProvider() {
  useEffect(() => {
    registerServiceWorker();
  }, []);
  return null;
}
