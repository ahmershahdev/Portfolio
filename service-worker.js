// ═══════════════════════════════════════════════════════════════════
// service-worker.js — ahmershah.dev
// Strategy:
//   navigation  → network-first (always fresh HTML)
//   static assets → stale-while-revalidate (fast + background update)
//   everything else → cache-first (offline capable)
// ═══════════════════════════════════════════════════════════════════

const CACHE_VERSION = "2026-07-15";
const STATIC_CACHE  = `static-v${CACHE_VERSION}`;
const RUNTIME_CACHE = `runtime-v${CACHE_VERSION}`;

// Core shell — cached at install time
const CORE_ASSETS = [
  // Pages
  "./",
  "./index.html",
  "./about/",
  "./services/",
  "./testimonials/",
  // Critical CSS
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
  // Critical JS
  "./assets/js/script.js",
  "./assets/js/animations.js",
  "./assets/js/no-loader-init.js",
  // Fonts
  "./assets/css/fonts/bootstrap-icons.woff2",
  // Favicon
  "./assets/images/favicon/favicon.ico",
  "./assets/images/favicon/favicon-96x96.png",
  "./assets/images/favicon/web-app-manifest-192x192.png",
  "./assets/images/favicon/web-app-manifest-512x512.png",
];

const ASSET_EXTENSIONS = [
  ".css", ".js",
  ".png", ".jpg", ".jpeg", ".webp", ".svg", ".ico",
  ".woff2", ".woff", ".ttf",
  ".glb", ".gltf",
];

// ── Install ───────────────────────────────────────────────────────
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) =>
      cache.addAll(CORE_ASSETS).catch((err) => {
        console.warn("[SW] Core asset pre-cache partial failure:", err);
      })
    )
  );
  self.skipWaiting();
});

// ── Activate — prune old caches ───────────────────────────────────
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== STATIC_CACHE && key !== RUNTIME_CACHE)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// ── Fetch ─────────────────────────────────────────────────────────
self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Only handle same-origin GET requests
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Navigation (HTML pages) → network-first
  if (request.mode === "navigate") {
    event.respondWith(networkFirst(request));
    return;
  }

  // Static assets → stale-while-revalidate
  if (isAsset(url.pathname)) {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }

  // Everything else → cache-first
  event.respondWith(cacheFirst(request));
});

// ── Helpers ───────────────────────────────────────────────────────
function isAsset(pathname) {
  return ASSET_EXTENSIONS.some((ext) => pathname.endsWith(ext));
}

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    // Offline fallback: serve homepage shell for any navigation
    return caches.match("./index.html");
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response("Offline", { status: 503 });
  }
}

async function staleWhileRevalidate(request) {
  const cached = await caches.match(request);
  const revalidate = fetch(request)
    .then(async (response) => {
      if (response.ok) {
        const cache = await caches.open(RUNTIME_CACHE);
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => cached);
  return cached ?? revalidate;
}
