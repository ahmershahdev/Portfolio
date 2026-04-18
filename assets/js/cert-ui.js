const elCounter = document.getElementById("certCounter");
const elProgress = document.getElementById("certProgressBar");
const elDotNav = document.getElementById("certDotNav");
const elPrevBtn = document.getElementById("certPrevBtn");
const elNextBtn = document.getElementById("certNextBtn");

export function getBookDimensions() {
  const containerW = Math.min(document.documentElement.clientWidth - 32, 1200);
  if (containerW < 620) {
    const width = Math.min(containerW, 380);
    const scale = width / 380;
    const height = Math.round(Math.max(360, Math.min(480, 480 * scale)));
    return { width: Math.round(width), height, display: "single" };
  }
  const maxW = Math.min(containerW - 24, 840);
  const scale = maxW / 840;
  return {
    width: Math.round(840 * scale),
    height: Math.round(510 * scale),
    display: "double",
  };
}

export function certIndexFromPage(page, total, isSingleMode) {
  if (isSingleMode) {
    return Math.min(page - 1, total - 1);
  }
  if (page < 2) return -1;
  return Math.min(Math.floor((page - 2) / 2), total - 1);
}

export function updateUI(page, certs, isSingleMode) {
  const total = certs.length;
  const certIdx = certIndexFromPage(page, total, isSingleMode);
  elCounter.textContent = `${Math.max(certIdx, 0) + 1} / ${total}`;
  if (elProgress) {
    const pct = certIdx >= 0 && total > 1 ? (certIdx / (total - 1)) * 100 : 0;
    elProgress.style.width = pct + "%";
  }
  document.querySelectorAll(".cert-dot").forEach((dot, i) => {
    dot.classList.toggle("active", i === certIdx);
    dot.setAttribute("aria-selected", i === certIdx ? "true" : "false");
  });
  elPrevBtn.disabled = certIdx <= 0;
  elNextBtn.disabled = certIdx >= total - 1;
}

export function buildDotNav(certs, isSingleMode, onDotClick) {
  elDotNav.innerHTML = "";
  certs.forEach((cert, i) => {
    const dot = document.createElement("button");
    dot.className = "cert-dot" + (i === 0 ? " active" : "");
    dot.setAttribute("role", "tab");
    dot.setAttribute("aria-label", `Go to certificate ${i + 1}: ${cert.name}`);
    dot.setAttribute("aria-selected", i === 0 ? "true" : "false");
    dot.title = cert.name;
    dot.addEventListener("click", () => onDotClick(i));
    elDotNav.appendChild(dot);
  });
}
