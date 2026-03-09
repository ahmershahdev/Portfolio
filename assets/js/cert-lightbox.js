const elLightbox = document.getElementById("certLightbox");
const elLbImg = document.getElementById("certLightboxImg");
const elLbTitle = document.getElementById("certLightboxTitle");
const elLbClose = document.getElementById("certLightboxClose");

export function openLightbox(cert) {
  if (!elLightbox) return;
  elLbImg.src = cert.image;
  elLbImg.alt = `${cert.name} certificate`;
  if (elLbTitle) elLbTitle.textContent = cert.name;
  elLightbox.classList.add("active");
  document.body.style.overflow = "hidden";
}

export function closeLightbox() {
  if (!elLightbox) return;
  elLightbox.classList.remove("active");
  document.body.style.overflow = "";
}

export function initLightbox(magScene, getFiltered) {
  if (elLbClose) elLbClose.addEventListener("click", closeLightbox);
  if (elLightbox) {
    elLightbox.addEventListener("click", (e) => {
      if (
        e.target === elLightbox ||
        e.target === elLightbox.querySelector(".cert-lightbox-backdrop")
      ) {
        closeLightbox();
      }
    });
  }
  magScene.addEventListener("click", (e) => {
    const img = e.target.closest(".cert-main-img");
    if (!img) return;
    const cert = getFiltered().find(
      (c) => c.id === parseInt(img.dataset.certId, 10),
    );
    if (cert) openLightbox(cert);
  });
  magScene.addEventListener("keydown", (e) => {
    const img = e.target.closest(".cert-main-img");
    if (!img) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      const cert = getFiltered().find(
        (c) => c.id === parseInt(img.dataset.certId, 10),
      );
      if (cert) openLightbox(cert);
    }
  });
}
