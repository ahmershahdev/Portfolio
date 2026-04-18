/**
 * Vercel Speed Insights Integration
 * Initializes Speed Insights for performance monitoring
 */
const PROD_HOSTS = new Set(["ahmershah.dev", "www.ahmershah.dev"]);

function schedule(callback) {
  if ("requestIdleCallback" in window) {
    requestIdleCallback(callback, { timeout: 8000 });
  } else {
    setTimeout(callback, 4000);
  }
}

window.addEventListener(
  "load",
  () => {
    if (!PROD_HOSTS.has(window.location.hostname)) return;

    schedule(async () => {
      try {
        const { injectSpeedInsights } =
          await import("https://cdn.jsdelivr.net/npm/@vercel/speed-insights/+esm");
        injectSpeedInsights({
          debug: false,
          sampleRate: 1,
        });
      } catch (error) {
        console.warn("[Speed Insights] failed to initialize", error);
      }
    });
  },
  { once: true },
);
