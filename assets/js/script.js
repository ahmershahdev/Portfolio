import { initializeLoader } from "./loader.js";
import { initializeNavigation } from "./navigation.js";
import { initializeAnimations, initProjectCarousel } from "./animations.js";
import { initializeEffects } from "./effects.js";
import { initializeForm } from "./form.js";

document.addEventListener("DOMContentLoaded", () => {
  initializeLoader();
  initializeForm();

  window.addEventListener(
    "loaderComplete",
    () => {
      document.documentElement.style.overflowY = "auto";
      document.body.style.overflowY = "auto";

      const mainEl = document.querySelector("main");
      if (mainEl) {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => mainEl.classList.add("camera-fly-in"));
        });
      }

      initializeNavigation();
      initializeAnimations();
      initProjectCarousel();
      initializeEffects();

      loadThreeScene();
    },
    { once: true },
  );
});

function loadThreeScene() {
  if ("requestIdleCallback" in window) {
    requestIdleCallback(() => importThreeJS());
  } else {
    setTimeout(importThreeJS, 1000);
  }
}

function importThreeJS() {
  import("./three-scene.js")
    .then((module) => module.initializeThreeScene())
    .catch((err) => console.error("Failed to load three-scene:", err));
}
