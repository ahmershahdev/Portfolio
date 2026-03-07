import { applyTilt } from "./tilt.js";
import { initializeCustomCursor } from "./cursor.js";

export function initializeEffects() {
  initializeCustomCursor();

  document
    .querySelectorAll(".skill-item")
    .forEach((el) => applyTilt(el, { intensity: 15, scale: 1.02 }));
  document
    .querySelectorAll(".timeline-item")
    .forEach((el) =>
      applyTilt(el, { intensity: 12, translateZ: 40, perspective: 1500 }),
    );

  const aboutBox = document.querySelector("#about .neon-border");
  if (aboutBox)
    applyTilt(aboutBox, { intensity: 20, useShine: true, breakpoint: 992 });
}
