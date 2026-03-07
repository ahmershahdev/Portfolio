import { CERTIFICATES } from "./cert-data.js";
import { state, els } from "./cert-state.js";
import { renderCert } from "./cert-render.js";
import { resetAutoPlay } from "./cert-autoplay.js";

export function buildDots() {
  els.dotNav.innerHTML = "";
  state.filtered.forEach((cert, i) => {
    const dot = document.createElement("button");
    dot.className = "cert-dot" + (i === state.current ? " active" : "");
    dot.setAttribute("role", "tab");
    dot.setAttribute("aria-label", `Go to certificate ${i + 1}: ${cert.name}`);
    dot.setAttribute("aria-selected", i === state.current ? "true" : "false");
    dot.title = cert.name;
    dot.addEventListener("click", () => {
      if (state.animating || i === state.current) return;
      state.current = i;
      renderCert(state.current);
      resetAutoPlay();
    });
    els.dotNav.appendChild(dot);
  });
}

export function filterByCategory(cat) {
  state.filtered =
    cat === "all"
      ? [...CERTIFICATES]
      : CERTIFICATES.filter((c) => c.category === cat);
  state.current = 0;
  buildDots();
  renderCert(state.current);
  resetAutoPlay();
}

document.querySelectorAll(".cert-tab-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".cert-tab-btn").forEach((b) => {
      b.classList.remove("active");
      b.setAttribute("aria-pressed", "false");
    });
    btn.classList.add("active");
    btn.setAttribute("aria-pressed", "true");
    filterByCategory(btn.dataset.cat);
  });
});
