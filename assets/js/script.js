import { initializeLoader } from "./loader.js";
import { initializeEffects } from "./effects.js";
import { initializeNavigation } from "./navigation.js";
import { initializeAnimations, initProjectCarousel } from "./animations.js";
import { initializeForm } from "./form.js";
import { initSocialHub } from "./social.js";

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

      initializeNavigation();
      initializeEffects();

      requestAnimationFrame(() => {
        initializeAnimations();
        initProjectCarousel();
        initSocialHub();
      });

      loadThreeScene();
    },
    { once: true },
  );
});

function loadThreeScene() {
  if ("requestIdleCallback" in window) {
    requestIdleCallback(() => importThreeJS());
  } else {
    setTimeout(importThreeJS, 200);
  }
}

function importThreeJS() {
  import("./three-scene.js")
    .then((module) => module.initializeThreeScene())
    .catch((err) => console.error("Failed to load three-scene:", err));
}