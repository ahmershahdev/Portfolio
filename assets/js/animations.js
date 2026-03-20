import { typeWriterAnimation } from "./typewriter.js";
import { initializeGlitchText } from "./glitch.js";

export { initProjectCarousel } from "./carousel.js";

const SECTION_CAMERA_CLASSES = {
  education: "camera-view-left-active",
  skills: "camera-view-right-active",
  projects: "camera-view-back-active",
  certificates: "camera-view-left-active",
  social: "camera-view-split-active",
  contact: "camera-view-back-active",
};

export function initializeAnimations() {
  typeWriterAnimation();
  initializeGlitchText();

  const isTouchDevice = window.matchMedia("(hover: none)").matches;

  const generalObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        if (el.classList.contains("skill-item")) {
          el.querySelectorAll(".progress-bar").forEach((bar) => {
            bar.style.width = bar.getAttribute("aria-valuenow") + "%";
          });
        } else {
          el.classList.add("reveal-visible");
        }
        generalObserver.unobserve(el);
      });
    },
    { threshold: 0.1 },
  );

  document
    .querySelectorAll('[class*="reveal-"], .curtain-reveal, .skill-item')
    .forEach((el) => generalObserver.observe(el));

  if (isTouchDevice) {
    Object.entries(SECTION_CAMERA_CLASSES).forEach(([id, cls]) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.classList.add(cls, "fog-fade-in");
      el.classList.remove("fog-fade-out");
    });
    return;
  }

  const cameraObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const cls = SECTION_CAMERA_CLASSES[entry.target.id];
        entry.target.classList.toggle(cls, entry.isIntersecting);
        entry.target.classList.toggle("fog-fade-in", entry.isIntersecting);
        entry.target.classList.toggle("fog-fade-out", !entry.isIntersecting);
      });
    },
    { threshold: 0.2 },
  );

  Object.entries(SECTION_CAMERA_CLASSES).forEach(([id]) => {
    const el = document.getElementById(id);
    if (el) cameraObserver.observe(el);
  });
}
