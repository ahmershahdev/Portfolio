import { els } from "./cert-state.js";
import { renderCert } from "./cert-render.js";
import { flipTo } from "./cert-flip.js";
import { buildDots } from "./cert-filter.js";
import { startAutoPlay, resetAutoPlay } from "./cert-autoplay.js";
import { closeLightbox } from "./cert-lightbox.js";

els.prevBtn.addEventListener("click", () => {
  flipTo("bck");
  resetAutoPlay();
});

els.nextBtn.addEventListener("click", () => {
  flipTo("fwd");
  resetAutoPlay();
});

document.getElementById("certificates").addEventListener("keydown", (e) => {
  if (e.key === "ArrowRight") {
    flipTo("fwd");
    resetAutoPlay();
  }
  if (e.key === "ArrowLeft") {
    flipTo("bck");
    resetAutoPlay();
  }
  if (e.key === "Escape" && els.lightbox && els.lightbox.classList.contains("active")) {
    closeLightbox();
  }
});

let touchStartX = 0;
els.book.addEventListener(
  "touchstart",
  (e) => {
    touchStartX = e.touches[0].clientX;
  },
  { passive: true },
);
els.book.addEventListener("touchend", (e) => {
  const dx = e.changedTouches[0].clientX - touchStartX;
  if (Math.abs(dx) < 40) return;
  dx < 0 ? flipTo("fwd") : flipTo("bck");
  resetAutoPlay();
});

buildDots();
renderCert(0);
startAutoPlay();
