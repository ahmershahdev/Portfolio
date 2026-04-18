import { applyTilt } from "./tilt.js";
import { initializeCustomCursor } from "./cursor.js";

let lenis = null;
let lenisRafId = null;
let keyboardScrollBound = false;

function shouldPreventLenis(node) {
  return Boolean(
    node?.closest?.(".cert-magazine-scene, .cert-lightbox, .offcanvas, .modal"),
  );
}

function shouldIgnoreKeyboardScroll(event) {
  if (
    event.defaultPrevented ||
    event.altKey ||
    event.ctrlKey ||
    event.metaKey
  ) {
    return true;
  }

  const active = document.activeElement;
  if (!active) return false;
  if (active.isContentEditable) return true;

  const tag = active.tagName?.toLowerCase();
  return ["input", "textarea", "select", "button"].includes(tag);
}

function bindKeyboardLenisScroll() {
  if (keyboardScrollBound || !lenis) return;

  document.addEventListener("keydown", (event) => {
    if (!lenis || shouldIgnoreKeyboardScroll(event)) return;

    const step = Math.max(80, Math.round(window.innerHeight * 0.12));
    const pageStep = Math.round(window.innerHeight * 0.9);
    const current = lenis.animatedScroll ?? window.scrollY;

    let target = null;

    switch (event.key) {
      case "ArrowDown":
        target = current + step;
        break;
      case "ArrowUp":
        target = current - step;
        break;
      case "PageDown":
        target = current + pageStep;
        break;
      case "PageUp":
        target = current - pageStep;
        break;
      case " ":
      case "Spacebar":
        target = current + (event.shiftKey ? -pageStep : pageStep);
        break;
      case "Home":
        target = 0;
        break;
      case "End":
        target = Number.isFinite(lenis.limit)
          ? lenis.limit
          : document.documentElement.scrollHeight - window.innerHeight;
        break;
      default:
        return;
    }

    event.preventDefault();
    const maxScroll = Number.isFinite(lenis.limit)
      ? lenis.limit
      : document.documentElement.scrollHeight - window.innerHeight;
    const clamped = Math.max(0, Math.min(maxScroll, target));
    lenis.scrollTo(clamped, { duration: 0.9, force: true });
  });

  keyboardScrollBound = true;
}

function getOrCreateLenis() {
  if (lenis) return lenis;

  lenis = window.__lenis ?? null;
  if (!lenis && typeof window.Lenis === "function") {
    lenis = new window.Lenis({
      smoothWheel: true,
      gestureOrientation: "vertical",
      wheelMultiplier: 0.9,
      touchMultiplier: 1,
      lerp: 0.1,
      prevent: shouldPreventLenis,
    });
    window.__lenis = lenis;
  }

  if (lenis && !lenisRafId) {
    const rafLoop = (time) => {
      lenis.raf(time);
      lenisRafId = requestAnimationFrame(rafLoop);
    };
    lenisRafId = requestAnimationFrame(rafLoop);
  }

  return lenis;
}

export function initializeEffects() {
  lenis = getOrCreateLenis();
  bindKeyboardLenisScroll();
  initializeCustomCursor();

  document
    .querySelectorAll(".skill-item")
    .forEach((el) => applyTilt(el, { intensity: 15, scale: 1.02, lenis }));

  document.querySelectorAll(".timeline-item").forEach((el) =>
    applyTilt(el, {
      intensity: 12,
      translateZ: 40,
      perspective: 1500,
      lenis,
    }),
  );

  const aboutBox = document.querySelector("#about .neon-border");
  if (aboutBox)
    applyTilt(aboutBox, {
      intensity: 20,
      useShine: true,
      breakpoint: 992,
      lenis,
    });
}
