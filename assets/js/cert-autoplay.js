import { state, els, AUTO_PLAY_INTERVAL } from "./cert-state.js";
import { flipTo } from "./cert-flip.js";

export function startAutoPlay() {
  stopAutoPlay();
  if (!state.autoPlayEnabled) return;
  state.autoPlayTimer = setInterval(() => {
    if (state.current < state.filtered.length - 1) {
      flipTo("fwd");
    } else {
      state.current = -1;
      flipTo("fwd");
    }
  }, AUTO_PLAY_INTERVAL);
}

export function stopAutoPlay() {
  if (state.autoPlayTimer) {
    clearInterval(state.autoPlayTimer);
    state.autoPlayTimer = null;
  }
}

export function resetAutoPlay() {
  if (state.autoPlayEnabled) startAutoPlay();
}

export function toggleAutoPlay() {
  state.autoPlayEnabled = !state.autoPlayEnabled;
  if (els.autoPlayBtn) {
    els.autoPlayBtn.innerHTML = state.autoPlayEnabled
      ? '<i class="bi bi-pause-circle"></i>'
      : '<i class="bi bi-play-circle"></i>';
    els.autoPlayBtn.title = state.autoPlayEnabled
      ? "Pause auto-play"
      : "Resume auto-play";
    els.autoPlayBtn.classList.toggle("paused", !state.autoPlayEnabled);
  }
  if (state.autoPlayEnabled) startAutoPlay();
  else stopAutoPlay();
}

if (els.autoPlayBtn) els.autoPlayBtn.addEventListener("click", toggleAutoPlay);

els.book.addEventListener("mouseenter", stopAutoPlay);
els.book.addEventListener("mouseleave", () => {
  if (state.autoPlayEnabled) startAutoPlay();
});
els.book.addEventListener("focusin", stopAutoPlay);
els.book.addEventListener("focusout", () => {
  if (state.autoPlayEnabled) startAutoPlay();
});
