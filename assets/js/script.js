import { initializeLoader } from "./loader.js";
import { initializeEffects } from "./effects.js";
import { initializeNavigation } from "./navigation.js";
import { initializeAnimations, initProjectCarousel } from "./animations.js";
import { initializeForm } from "./form.js";
import { initSocialHub } from "./social.js";
import { initBlogStack } from "./blog-stack.js";
import { initFxSettingsUI, getFxSettings } from "./settings.js";

function loadAsciiPortrait() {
  const portrait = document.getElementById("asciiPortrait");
  if (!portrait) return;

  const src = portrait.dataset.src || "ascii-art.txt";
  fetch(src)
    .then((response) => {
      if (!response.ok) throw new Error("ASCII portrait unavailable");
      return response.text();
    })
    .then((text) => {
      portrait.textContent = text.trimEnd();
      initAsciiPortraitInteraction(portrait);
    })
    .catch(() => {
      portrait.textContent = "ASCII portrait unavailable.";
    });
}

function initAsciiPortraitInteraction(portrait) {
  const rawText = portrait.textContent;
  if (!rawText || !rawText.trim()) return;

  const lines = rawText.split("\n");
  const charNodes = [];
  const frag = document.createDocumentFragment();

  lines.forEach((line, row) => {
    for (let col = 0; col < line.length; col++) {
      const span = document.createElement("span");
      const ch = line[col];
      span.className = "ascii-char";
      span.textContent = ch === " " ? "\u00A0" : ch;
      frag.appendChild(span);
      charNodes.push({ node: span, row, col });
    }
    if (row < lines.length - 1) frag.appendChild(document.createElement("br"));
  });

  portrait.textContent = "";
  portrait.appendChild(frag);

  let charWidth = 6;
  let charHeight = 10;

  const measureChars = () => {
    const sample = charNodes.find((item) => item.node.textContent.trim());
    if (!sample) return;
    const rect = sample.node.getBoundingClientRect();
    if (rect.width) charWidth = rect.width;
    if (rect.height) charHeight = rect.height;
  };

  requestAnimationFrame(measureChars);
  window.addEventListener("resize", () => requestAnimationFrame(measureChars));

  let rafId = 0;
  let pointerActive = false;
  let touchActive = false;
  let pointerX = 0;
  let pointerY = 0;
  let lastActive = new Set();

  const clearTransforms = () => {
    lastActive.forEach((item) => {
      item.node.style.transform = "";
    });
    lastActive.clear();
  };

  const update = () => {
    rafId = 0;
    if (!pointerActive) return;

    const rect = portrait.getBoundingClientRect();
    const localX = pointerX - rect.left;
    const localY = pointerY - rect.top;

    if (
      localX < 0 ||
      localY < 0 ||
      localX > rect.width ||
      localY > rect.height
    ) {
      clearTransforms();
      return;
    }

    const pointerCol = Math.floor(localX / charWidth);
    const pointerRow = Math.floor(localY / charHeight);
    const radius = 6;
    const maxOffset = 8;
    const nextActive = new Set();

    charNodes.forEach((item) => {
      const dx = item.col - pointerCol;
      const dy = item.row - pointerRow;
      if (Math.abs(dx) > radius || Math.abs(dy) > radius) return;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > radius) return;

      const strength = (radius - dist) / radius;
      const denom = dist || 1;
      const offsetX = (dx / denom) * strength * maxOffset;
      const offsetY = (dy / denom) * strength * maxOffset;

      item.node.style.transform = `translate(${offsetX.toFixed(2)}px, ${offsetY.toFixed(2)}px)`;
      nextActive.add(item);
    });

    lastActive.forEach((item) => {
      if (!nextActive.has(item)) item.node.style.transform = "";
    });
    lastActive = nextActive;
  };

  const scheduleUpdate = () => {
    if (rafId) return;
    rafId = requestAnimationFrame(update);
  };

  const activatePointer = (event) => {
    pointerX = event.clientX;
    pointerY = event.clientY;
    pointerActive = event.pointerType !== "touch" || touchActive;
    if (pointerActive) portrait.classList.add("is-interacting");
    scheduleUpdate();
  };

  portrait.addEventListener(
    "pointerenter",
    (event) => {
      if (event.pointerType === "touch") return;
      activatePointer(event);
    },
    { passive: true },
  );

  portrait.addEventListener(
    "pointermove",
    (event) => {
      if (event.pointerType === "touch" && !touchActive) return;
      activatePointer(event);
    },
    { passive: true },
  );

  portrait.addEventListener(
    "pointerdown",
    (event) => {
      if (event.pointerType === "touch") touchActive = true;
      activatePointer(event);
    },
    { passive: true },
  );

  const deactivatePointer = () => {
    pointerActive = false;
    touchActive = false;
    clearTransforms();
    portrait.classList.remove("is-interacting");
  };

  document.addEventListener(
    "visibilitychange",
    () => {
      if (document.visibilityState === "hidden") deactivatePointer();
    },
    { passive: true },
  );

  portrait.addEventListener("pointerleave", deactivatePointer, {
    passive: true,
  });
  portrait.addEventListener("pointerup", deactivatePointer, { passive: true });
  portrait.addEventListener("pointercancel", deactivatePointer, {
    passive: true,
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initFxSettingsUI();
  loadAsciiPortrait();
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
  const fxSettings = getFxSettings();
  if (fxSettings.disable3dModels && fxSettings.disable3dAnimations)
    return false;

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
