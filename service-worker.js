// ═══════════════════════════════════════════════════════════════════
// service-worker.js
// ahmershah.dev
//
// Strategy:
// • HTML pages        → Network First
// • Static assets     → Stale While Revalidate
// • Other requests    → Cache First
// ═══════════════════════════════════════════════════════════════════

const CACHE_VERSION = "2026-07-19";

const STATIC_CACHE = `static-v${CACHE_VERSION}`;
const RUNTIME_CACHE = `runtime-v${CACHE_VERSION}`;

const MAX_RUNTIME_ITEMS = 100;

// Files cached during installation
const CORE_ASSETS = [
  "./",
  "./index.html",
  "./about/index.html",

  "./assets/css/global.css",
  "./assets/css/loader.css",
  "./assets/css/navigation.css",
  "./assets/css/section-transitions.css",
  "./assets/css/hero.css",
  "./assets/css/skills.css",
  "./assets/css/footer.css",

  "./assets/css/light-mode/base.css",
  "./assets/css/light-mode/navigation.css",
  "./assets/css/light-mode/hero-about.css",
  "./assets/css/light-mode/sections.css",
  "./assets/css/light-mode/projects-blog.css",
  "./assets/css/light-mode/certificates.css",
  "./assets/css/light-mode/contact-settings.css",
  "./assets/css/light-mode/social-footer.css",
  "./assets/css/light-mode/loader.css",

  "./assets/js/script.js",
  "./assets/js/animations.js",
  "./assets/js/no-loader-init.js",

  "./assets/css/fonts/bootstrap-icons.woff2",

  "./assets/images/favicon/favicon.ico",
  "./assets/images/favicon/favicon-96x96.png",
  "./assets/images/favicon/web-app-manifest-192x192.png",
  "./assets/images/favicon/web-app-manifest-512x512.png",
];

// File extensions treated as static assets
const STATIC_EXTENSIONS = [
  ".css",
  ".js",
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
  ".svg",
  ".ico",
  ".woff",
  ".woff2",
  ".ttf",
  ".glb",
  ".gltf",
];

// ───────────────────────────────────────────────
// Install
// ───────────────────────────────────────────────

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then(async (cache) => {
      try {
        await cache.addAll(CORE_ASSETS);
      } catch (err) {
        console.warn("[SW] Some assets failed to cache:", err);
      }
    }),
  );

  self.skipWaiting();
});

// ───────────────────────────────────────────────
// Activate
// ───────────────────────────────────────────────

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      // Delete old caches
      const keys = await caches.keys();

      await Promise.all(
        keys
          .filter((key) => ![STATIC_CACHE, RUNTIME_CACHE].includes(key))
          .map((key) => caches.delete(key)),
      );

      // Enable Navigation Preload (supported browsers)
      if ("navigationPreload" in self.registration) {
        await self.registration.navigationPreload.enable();
      }

      await self.clients.claim();
    })(),
  );
});

// ───────────────────────────────────────────────
// Fetch
// ───────────────────────────────────────────────

self.addEventListener("fetch", (event) => {
  const request = event.request;

  // Only GET requests
  if (request.method !== "GET") return;

  // Ignore chrome-extension:, data:, blob:, etc.
  if (!request.url.startsWith("http")) return;

  const url = new URL(request.url);

  // Only cache same-origin requests
  if (url.origin !== location.origin) return;

  // HTML pages
  if (request.mode === "navigate") {
    event.respondWith(networkFirst(request, event));
    return;
  }

  // Static assets
  if (isStaticAsset(url.pathname)) {
    event.respondWith(staleWhileRevalidate(request, STATIC_CACHE, event));
    return;
  }

  // Other requests
  event.respondWith(cacheFirst(request));
});

// ───────────────────────────────────────────────
// Strategies
// ───────────────────────────────────────────────

async function networkFirst(request, event) {
  try {
    const preload = await event.preloadResponse;

    if (preload) {
      return preload;
    }

    const response = await fetch(request);

    if (isCacheable(response)) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, response.clone());
      trimCache(RUNTIME_CACHE, MAX_RUNTIME_ITEMS);
    }

    return response;
  } catch {
    const cached =
      (await caches.match(request)) || (await caches.match("./index.html"));

    return cached || new Response("Offline", { status: 503 });
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request);

  if (cached) {
    return cached;
  }

  try {
    const response = await fetch(request);

    if (isCacheable(response)) {
      const cache = await caches.open(RUNTIME_CACHE);

      cache.put(request, response.clone());

      trimCache(RUNTIME_CACHE, MAX_RUNTIME_ITEMS);
    }

    return response;
  } catch {
    return new Response("Offline", {
      status: 503,
      statusText: "Offline",
    });
  }
}

async function staleWhileRevalidate(request, cacheName, event) {
  const cache = await caches.open(cacheName);

  const cached = await cache.match(request);

  const fetchPromise = fetch(request)
    .then((response) => {
      if (isCacheable(response)) {
        cache.put(request, response.clone());
      }

      return response;
    })
    .catch(() => cached);

  event.waitUntil(fetchPromise);

  return cached || fetchPromise;
}

// ───────────────────────────────────────────────
// Helpers
// ───────────────────────────────────────────────

function isStaticAsset(pathname) {
  return STATIC_EXTENSIONS.some((ext) => pathname.endsWith(ext));
}

function isCacheable(response) {
  return response && response.ok && response.type === "basic";
}

async function trimCache(cacheName, maxItems) {
  const cache = await caches.open(cacheName);

  const keys = await cache.keys();

  while (keys.length > maxItems) {
    await cache.delete(keys[0]);
    keys.shift();
  }
}
