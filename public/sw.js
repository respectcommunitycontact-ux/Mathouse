/* Mat House — service worker
 * - Makes the app installable as a PWA
 * - Pages: network first (always fresh menu), cached copy if the Wi-Fi drops
 * - Build assets, icons and dish photos: cache first
 */
const VERSION = 'mathouse-v1';
const PAGES = `${VERSION}-pages`;
const ASSETS = `${VERSION}-assets`;
const PRECACHE = ['/', '/manifest.json', '/logo.png', '/logo-cropped.png', '/pwa-192.png', '/pwa-512.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(PAGES)
      .then((cache) => cache.addAll(PRECACHE))
      .catch(() => {})
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);

  // Never cache live data (Supabase, APIs)
  if (url.pathname.startsWith('/api/') || url.hostname.endsWith('supabase.co')) return;

  // HTML pages: network first, fall back to cache when offline
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(PAGES).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() => caches.match(request).then((r) => r || caches.match('/')))
    );
    return;
  }

  // Static build files, icons, dish photos: cache first
  const isAsset =
    (url.origin === self.location.origin &&
      (url.pathname.startsWith('/_next/static/') || /\.(png|jpg|jpeg|webp|svg|ico|woff2?)$/.test(url.pathname))) ||
    url.hostname === 'images.unsplash.com' ||
    url.hostname === 'fonts.gstatic.com' ||
    url.hostname === 'fonts.googleapis.com';

  if (isAsset) {
    event.respondWith(
      caches.open(ASSETS).then((cache) =>
        cache.match(request).then(
          (cached) =>
            cached ||
            fetch(request).then((response) => {
              if (response.ok || response.type === 'opaque') cache.put(request, response.clone());
              return response;
            })
        )
      )
    );
  }
});
