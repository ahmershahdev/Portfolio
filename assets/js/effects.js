import { applyTilt } from "./tilt.js";
import { initializeCustomCursor } from "./cursor.js";

let lenis = null;

export function initializeEffects() {
  initializeCustomCursor();

  if (!lenis) {
    lenis = new Lenis();
    window.__lenis = lenis;
    
    let rafId;
    function rafLoop(time) {
      lenis.raf(time);
      rafId = requestAnimationFrame(rafLoop);
    }
    rafId = requestAnimationFrame(rafLoop);
  }

  document
    .querySelectorAll(".skill-item")
    .forEach((el) => applyTilt(el, { intensity: 15, scale: 1.02, lenis }));

  document
    .querySelectorAll(".timeline-item")
    .forEach((el) => applyTilt(el, { intensity: 12, translateZ: 40, perspective: 1500, lenis }));

  const aboutBox = document.querySelector("#about .neon-border");
  if (aboutBox)
    applyTilt(aboutBox, { intensity: 20, useShine: true, breakpoint: 992, lenis });
}