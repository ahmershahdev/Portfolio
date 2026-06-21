import { getFxSettings } from "./settings.js";

export function initSocialHub() {
  const panels = document.querySelectorAll(".social-panel");
  if (!panels.length) return;

  const fxSettings = getFxSettings();
  const canHover = window.matchMedia(
    "(hover: hover) and (pointer: fine)",
  ).matches;
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  let meshEnabled =
    !fxSettings.disable3dAnimations && canHover && !prefersReducedMotion;

  const cleanups = [];

  const panelObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const panel = entry.target;
        panel.classList.add("panel-active");
        _staggerCards(panel, prefersReducedMotion);
        panelObserver.unobserve(panel);
      });
    },
    { threshold: 0.12 },
  );

  const rectInvalidators = [];
  const onResize = () => rectInvalidators.forEach((fn) => fn());
  window.addEventListener("resize", onResize, { passive: true });

  const resetPanelMesh = (panel) => {
    const mesh = panel.querySelector(".panel-mesh");
    if (!mesh) return;
    mesh.style.background = "";
    mesh.style.willChange = "auto";
  };

  const setMeshEnabled = (enabled) => {
    meshEnabled = enabled && canHover && !prefersReducedMotion;
    if (!meshEnabled) panels.forEach((panel) => resetPanelMesh(panel));
  };

  window.addEventListener("fxSettingsChange", (event) => {
    const next = event.detail || getFxSettings();
    setMeshEnabled(!next.disable3dAnimations);
  });

  panels.forEach((panel) => {
    panelObserver.observe(panel);

    const mesh = panel.querySelector(".panel-mesh");
    if (!mesh || !canHover) return;

    const rgb = panel.dataset.panelAccent || "0, 240, 255";

    let rect = null;
    let rafId = null;
    let mx = 0,
      my = 0;

    const updateRect = () => (rect = panel.getBoundingClientRect());
    rectInvalidators.push(() => {
      rect = null;
    });

    const onMove = (e) => {
      if (!meshEnabled) return;
      if (!rect) updateRect();
      mx = e.clientX;
      my = e.clientY;
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        const x = ((mx - rect.left) / rect.width) * 100;
        const y = ((my - rect.top) / rect.height) * 100;
        mesh.style.background = `radial-gradient(circle at ${x}% ${y}%, rgba(${rgb}, 0.11) 0%, transparent 55%)`;
        rafId = null;
      });
    };

    const onEnter = () => {
      if (!meshEnabled) return;
      mesh.style.willChange = "background";
    };

    const onLeave = () => {
      if (!meshEnabled) return;
      mesh.style.background = "";
      mesh.style.willChange = "auto";
      rect = null;
    };

    panel.addEventListener("mouseenter", onEnter, { passive: true });
    panel.addEventListener("mousemove", onMove, { passive: true });
    panel.addEventListener("mouseleave", onLeave);

    cleanups.push(() => {
      panel.removeEventListener("mouseenter", onEnter);
      panel.removeEventListener("mousemove", onMove);
      panel.removeEventListener("mouseleave", onLeave);
      if (rafId) cancelAnimationFrame(rafId);
    });
  });

  return () => {
    panelObserver.disconnect();
    window.removeEventListener("resize", onResize);
    cleanups.forEach((fn) => fn());
  };
}

function _staggerCards(panel, reduceMotion = false) {
  const cards = panel.querySelectorAll(".social-card");
  if (reduceMotion) {
    cards.forEach((card) => card.classList.add("card-revealed"));
    return;
  }
  cards.forEach((card, i) => {
    setTimeout(() => card.classList.add("card-revealed"), i * 45);
  });
}
