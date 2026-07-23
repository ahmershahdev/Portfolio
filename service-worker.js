// ============================================================================
// service-worker.js
// ahmershah.dev
//
// Strategy:
// - HTML pages: Network First
// - Static assets: Stale While Revalidate
// - Other same-origin GET requests: Cache First
// ============================================================================

const CACHE_VERSION = "2026-07-23";

const STATIC_CACHE = `static-v${CACHE_VERSION}`;
const RUNTIME_CACHE = `runtime-v${CACHE_VERSION}`;

const MAX_RUNTIME_ITEMS = 100;

const CORE_ASSETS = [
  "./",
  "./index.html",
  "./about/index.html",

  "./assets/css/global.css",
  "./assets/css/loader.css",
  "./assets/css/navigation.css",
  "./assets/css/section-transitions.css",
  "./assets/css/hero.css",
  "./assets/css/about.css",
  "./assets/css/about-page.css",
  "./assets/css/skills.css",
  "./assets/css/projects.css",
  "./assets/css/blogs.css",
  "./assets/css/social-animations.css",
  "./assets/css/social-section.css",
  "./assets/css/social-panel.css",
  "./assets/css/social-card.css",
  "./assets/css/social-responsive.css",
  "./assets/css/cert-tabs.css",
  "./assets/css/cert-book.css",
  "./assets/css/cert-content.css",
  "./assets/css/cert-controls.css",
  "./assets/css/cert-responsive.css",
  "./assets/css/form.css",
  "./assets/css/footer.css",
  "./assets/css/legal.css",

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
  "./assets/js/navigation.js",
  "./assets/js/settings.js",
  "./assets/js/theme.js",
  "./assets/js/social.js",
  "./assets/js/carousel.js",
  "./assets/js/blog-stack.js",
  "./assets/js/about-page.js",

  "./assets/css/fonts/bootstrap-icons.woff2",

  "./assets/images/favicon/favicon.ico",
  "./assets/images/favicon/favicon-96x96.png",
  "./assets/images/favicon/web-app-manifest-192x192.png",
  "./assets/images/favicon/web-app-manifest-512x512.png",
];

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
  ".webmanifest",
  ".xml",
];

// ---------------------------------------------------------------------------
// Install
// ---------------------------------------------------------------------------

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cacheCoreAssets(cache)),
  );

  self.skipWaiting();
});

// ---------------------------------------------------------------------------
// Activate
// ---------------------------------------------------------------------------

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();

      await Promise.all(
        keys
          .filter((key) => ![STATIC_CACHE, RUNTIME_CACHE].includes(key))
          .map((key) => caches.delete(key)),
      );

      if ("navigationPreload" in self.registration) {
        await self.registration.navigationPreload.enable();
      }

      await self.clients.claim();
    })(),
  );
});

// ---------------------------------------------------------------------------
// Fetch
// ---------------------------------------------------------------------------

self.addEventListener("fetch", (event) => {
  const request = event.request;

  if (request.method !== "GET") return;
  if (!request.url.startsWith("http")) return;

  const url = new URL(request.url);

  if (url.origin !== location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(networkFirst(request, event));
    return;
  }

  if (isStaticAsset(url.pathname)) {
    event.respondWith(staleWhileRevalidate(request, STATIC_CACHE, event));
    return;
  }

  event.respondWith(cacheFirst(request));
});

// ---------------------------------------------------------------------------
// Strategies
// ---------------------------------------------------------------------------

async function networkFirst(request, event) {
  try {
    const preload = await event.preloadResponse;

    if (preload) {
      cacheResponse(request, preload.clone(), RUNTIME_CACHE);
      return preload;
    }

    const response = await fetch(request);

    if (isCacheable(response)) {
      cacheResponse(request, response.clone(), RUNTIME_CACHE);
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
      cacheResponse(request, response.clone(), RUNTIME_CACHE);
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
    .catch(() => cached || new Response("Offline", { status: 503 }));

  event.waitUntil(fetchPromise);

  return cached || fetchPromise;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function cacheCoreAssets(cache) {
  const results = await Promise.allSettled(
    CORE_ASSETS.map((asset) => cache.add(asset)),
  );

  const failed = results.filter((result) => result.status === "rejected");
  if (failed.length) {
    console.warn(`[SW] ${failed.length} core asset(s) failed to precache.`);
  }
}

function cacheResponse(request, response, cacheName) {
  caches
    .open(cacheName)
    .then((cache) =>
      cache
        .put(request, response)
        .then(() => trimCache(cacheName, MAX_RUNTIME_ITEMS)),
    )
    .catch((err) => console.warn("[SW] Runtime cache update failed:", err));
}

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
