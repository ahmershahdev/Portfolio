import { typeWriterAnimation } from "./typewriter.js";
import { initializeGlitchText } from "./glitch.js";

export { initProjectCarousel } from "./carousel.js";

export function initializeAnimations() {
  typeWriterAnimation();
  initializeGlitchText();

  const generalObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (entry.target.classList.contains("skill-item")) {
            entry.target.querySelectorAll(".progress-bar").forEach((bar) => {
              bar.style.width = bar.getAttribute("aria-valuenow") + "%";
            });
          } else {
            entry.target.classList.add("reveal-visible");
            generalObserver.unobserve(entry.target);
          }
        }
      });
    },
    { threshold: 0.1 },
  );

  document
    .querySelectorAll('[class*="reveal-"], .curtain-reveal, .skill-item')
    .forEach((el) => generalObserver.observe(el));

  const sections = {
    education: "camera-view-left-active",
    skills: "camera-view-right-active",
    projects: "camera-view-back-active",
    certificates: "camera-view-left-active",
    contact: "camera-view-back-active",
  };

  const cameraObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const className = sections[entry.target.id];
        entry.target.classList.toggle(className, entry.isIntersecting);
        entry.target.classList.toggle("fog-fade-in", entry.isIntersecting);
        entry.target.classList.toggle("fog-fade-out", !entry.isIntersecting);
      });
    },
    { threshold: 0.2 },
  );

  Object.keys(sections).forEach((id) => {
    const el = document.getElementById(id);
    if (el) cameraObserver.observe(el);
  });
}
