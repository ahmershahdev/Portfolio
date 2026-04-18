import { initializeLoader } from "./loader.js";
import { initializeEffects } from "./effects.js";
import { initializeNavigation } from "./navigation.js";
import { initializeAnimations, initProjectCarousel } from "./animations.js";
import { initializeForm } from "./form.js";
import { initSocialHub } from "./social.js";
import { initBlogStack } from "./blog-stack.js";

document.addEventListener("DOMContentLoaded", () => {
  initializeLoader();
  initializeForm();

  window.addEventListener(
    "loaderComplete",
    () => {
      document.documentElement.style.overflowY = "auto";
      document.body.style.overflowY = "auto";

      const mainEl = document.querySelector("main");
      if (mainEl) setTimeout(() => mainEl.classList.add("camera-fly-in"), 0);

      initializeEffects();
      initializeNavigation();

      requestAnimationFrame(() => {
        initializeAnimations();
        initProjectCarousel();
        initSocialHub();
        initBlogStack();
      });

      loadThreeScene();
    },
    { once: true },
  );
});

function loadThreeScene() {
  if (!shouldLoadThreeScene()) return;

  let queued = false;
  const queueImport = () => {
    if (queued) return;
    queued = true;
    cleanupTriggers();

    if ("requestIdleCallback" in window) {
      requestIdleCallback(() => importThreeJS(), { timeout: 5000 });
    } else {
      setTimeout(importThreeJS, 1200);
    }
  };

  const onUserIntent = () => queueImport();
  const cleanupTriggers = () => {
    window.removeEventListener("scroll", onUserIntent);
    window.removeEventListener("pointerdown", onUserIntent);
    window.removeEventListener("keydown", onUserIntent);
    window.removeEventListener("touchstart", onUserIntent);
  };

  window.addEventListener("scroll", onUserIntent, {
    passive: true,
    once: true,
  });
  window.addEventListener("pointerdown", onUserIntent, {
    passive: true,
    once: true,
  });
  window.addEventListener("keydown", onUserIntent, {
    passive: true,
    once: true,
  });
  window.addEventListener("touchstart", onUserIntent, {
    passive: true,
    once: true,
  });

  setTimeout(queueImport, 4500);
}

function shouldLoadThreeScene() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches)
    return false;

  const connection =
    navigator.connection ||
    navigator.mozConnection ||
    navigator.webkitConnection;
  if (connection?.saveData) return false;

  if (typeof navigator.deviceMemory === "number" && navigator.deviceMemory < 4)
    return false;
  if (
    typeof navigator.hardwareConcurrency === "number" &&
    navigator.hardwareConcurrency < 4
  )
    return false;

  return true;
}

function importThreeJS() {
  import("./three-scene.js")
    .then((module) => module.initializeThreeScene())
    .catch((err) => console.error("Failed to load three-scene:", err));
}
