import { state, els } from "./cert-state.js";
import { stopAutoPlay, startAutoPlay } from "./cert-autoplay.js";

export function openLightbox(cert) {
  if (!els.lightbox) return;
  els.lightboxImg.src = cert.image;
  els.lightboxImg.alt = cert.name + " certificate";
  if (els.lightboxTitle) els.lightboxTitle.textContent = cert.name;
  els.lightbox.classList.add("active");
  document.body.style.overflow = "hidden";
  stopAutoPlay();
}

export function closeLightbox() {
  if (!els.lightbox) return;
  els.lightbox.classList.remove("active");
  document.body.style.overflow = "";
  if (state.autoPlayEnabled) startAutoPlay();
}

if (els.lightboxClose)
  els.lightboxClose.addEventListener("click", closeLightbox);

if (els.lightbox) {
  els.lightbox.addEventListener("click", (e) => {
    if (
      e.target === els.lightbox ||
      e.target === els.lightbox.querySelector(".cert-lightbox-backdrop")
    ) {
      closeLightbox();
    }
  });
}
