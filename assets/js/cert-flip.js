import { state, els } from "./cert-state.js";
import { buildRightPage } from "./cert-pages.js";
import { renderCert } from "./cert-render.js";

export function flipTo(dir) {
  if (state.animating) return;

  const isFwd = dir === "fwd";
  const nextIndex = isFwd ? state.current + 1 : state.current - 1;
  if (nextIndex < 0 || nextIndex >= state.filtered.length) return;

  if (window.innerWidth < 768) {
    state.animating = true;
    const slideDir = isFwd ? "slide-out-left" : "slide-out-right";
    els.book.classList.add(slideDir);
    setTimeout(() => {
      state.current = nextIndex;
      renderCert(state.current);
      els.book.classList.remove(slideDir);
      els.book.classList.add(isFwd ? "slide-in-right" : "slide-in-left");
      setTimeout(() => {
        els.book.classList.remove("slide-in-right", "slide-in-left");
        state.animating = false;
      }, 350);
    }, 300);
    return;
  }

  state.animating = true;
  const cert = state.filtered[nextIndex];
  const SHADE = '<div class="flip-shade"></div>';

  if (isFwd) {
    els.flipFront.innerHTML =
      buildRightPage(state.filtered[state.current]) + SHADE;
    els.flipBack.innerHTML = buildRightPage(cert) + SHADE;
  } else {
    els.flipFront.innerHTML = buildRightPage(cert) + SHADE;
    els.flipBack.innerHTML =
      buildRightPage(state.filtered[state.current]) + SHADE;
  }

  const castShadow = document.createElement("div");
  castShadow.className = `cert-cast-shadow cert-cast-shadow--${isFwd ? "fwd" : "bck"}`;
  els.book.appendChild(castShadow);

  els.flipLayer.className = "book-flip-layer";
  els.flipLayer.style.display = "block";
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      els.flipLayer.classList.add(isFwd ? "flipping-fwd" : "flipping-bck");
    });
  });

  setTimeout(() => {
    state.current = nextIndex;
    renderCert(state.current);
  }, 500);

  els.flipLayer.addEventListener(
    "animationend",
    function onEnd() {
      els.flipLayer.removeEventListener("animationend", onEnd);
      els.flipLayer.style.display = "none";
      els.flipLayer.className = "book-flip-layer";
      if (castShadow.parentNode) castShadow.parentNode.removeChild(castShadow);
      state.animating = false;
    },
    { once: true },
  );
}
