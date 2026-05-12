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
  const grid = [];
  const frag = document.createDocumentFragment();

  lines.forEach((line, row) => {
    const rowNodes = [];
    for (let col = 0; col < line.length; col++) {
      const span = document.createElement("span");
      const ch = line[col];
      span.className = "ascii-char";
      span.textContent = ch === " " ? "\u00A0" : ch;
      frag.appendChild(span);
      rowNodes.push(span);
    }
    grid.push(rowNodes);
    if (row < lines.length - 1) frag.appendChild(document.createElement("br"));
  });

  portrait.textContent = "";
  portrait.appendChild(frag);

  let charWidth = 6;
  let charHeight = 10;

  const findSampleNode = () => {
    for (const rowNodes of grid) {
      const node = rowNodes.find((item) => item.textContent.trim());
      if (node) return node;
    }
    return null;
  };

  const measureChars = () => {
    const sample = findSampleNode();
    if (!sample) return;
    const rect = sample.getBoundingClientRect();
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
  let lastPointerRow = null;
  let lastPointerCol = null;

  const clearTransforms = () => {
    lastActive.forEach((node) => {
      node.style.transform = "";
    });
    lastActive.clear();
    lastPointerRow = null;
    lastPointerCol = null;
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
    if (pointerCol === lastPointerCol && pointerRow === lastPointerRow) return;
    lastPointerCol = pointerCol;
    lastPointerRow = pointerRow;

    const radius = 5;
    const maxOffset = 7;
    const radiusSq = radius * radius;
    const nextActive = new Set();

    const rowStart = Math.max(0, pointerRow - radius);
    const rowEnd = Math.min(grid.length - 1, pointerRow + radius);

    for (let row = rowStart; row <= rowEnd; row++) {
      const rowNodes = grid[row];
      if (!rowNodes || !rowNodes.length) continue;
      const colStart = Math.max(0, pointerCol - radius);
      const colEnd = Math.min(rowNodes.length - 1, pointerCol + radius);

      for (let col = colStart; col <= colEnd; col++) {
        const node = rowNodes[col];
        if (!node) continue;
        const dx = col - pointerCol;
        const dy = row - pointerRow;
        const distSq = dx * dx + dy * dy;
        if (distSq > radiusSq) continue;
        const dist = Math.sqrt(distSq) || 1;
        const strength = (radius - dist) / radius;
        const offsetX = (dx / dist) * strength * maxOffset;
        const offsetY = (dy / dist) * strength * maxOffset;
        node.style.transform = `translate3d(${offsetX.toFixed(2)}px, ${offsetY.toFixed(2)}px, 0)`;
        nextActive.add(node);
      }
    }

    lastActive.forEach((node) => {
      if (!nextActive.has(node)) node.style.transform = "";
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
