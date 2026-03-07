import { state, els } from "./cert-state.js";
import { buildLeftPage, buildRightPage } from "./cert-pages.js";
import { openLightbox } from "./cert-lightbox.js";

export function renderCert(index) {
  const cert = state.filtered[index];
  const total = state.filtered.length;

  els.leftContent.innerHTML = buildLeftPage(cert, index, total);
  els.rightContent.innerHTML = buildRightPage(cert);

  els.leftContent.classList.remove("page-fade-in");
  els.rightContent.classList.remove("page-fade-in");
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      els.leftContent.classList.add("page-fade-in");
      els.rightContent.classList.add("page-fade-in");
    });
  });

  els.counter.textContent = `${index + 1} / ${total}`;

  if (els.progressBar) {
    const pct = total > 1 ? (index / (total - 1)) * 100 : 100;
    els.progressBar.style.width = pct + "%";
  }

  document.querySelectorAll(".cert-dot").forEach((dot, i) => {
    dot.classList.toggle("active", i === index);
    dot.setAttribute("aria-selected", i === index ? "true" : "false");
  });

  els.prevBtn.disabled = index === 0;
  els.nextBtn.disabled = index === total - 1;

  const img = els.rightContent.querySelector(".cert-main-img");
  if (img) {
    img.addEventListener("click", () => openLightbox(cert));
    img.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openLightbox(cert);
      }
    });
  }
}
