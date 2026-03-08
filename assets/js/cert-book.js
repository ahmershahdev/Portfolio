import { els } from "./cert-state.js";
import { renderCert } from "./cert-render.js";
import { flipTo } from "./cert-flip.js";
import { buildDots } from "./cert-filter.js";
import { closeLightbox } from "./cert-lightbox.js";

els.prevBtn.addEventListener("click", () => flipTo("bck"));
els.nextBtn.addEventListener("click", () => flipTo("fwd"));

document.getElementById("certificates").addEventListener("keydown", (e) => {
  if (e.key === "ArrowRight") flipTo("fwd");
  if (e.key === "ArrowLeft") flipTo("bck");
  if (
    e.key === "Escape" &&
    els.lightbox &&
    els.lightbox.classList.contains("active")
  ) {
    closeLightbox();
  }
});

let touchStartX = 0;
let touchStartY = 0;

els.book.addEventListener(
  "touchstart",
  (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  },
  { passive: true },
);

els.book.addEventListener(
  "touchmove",
  (e) => {
    const dx = Math.abs(e.touches[0].clientX - touchStartX);
    const dy = Math.abs(e.touches[0].clientY - touchStartY);
    if (dx > dy && dx > 8) e.preventDefault();
  },
  { passive: false },
);

els.book.addEventListener("touchend", (e) => {
  const dx = e.changedTouches[0].clientX - touchStartX;
  if (Math.abs(dx) < 40) return;
  dx < 0 ? flipTo("fwd") : flipTo("bck");
});

buildDots();
renderCert(0);
