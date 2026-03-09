import { CAT_ICONS } from "./cert-data.js";

export function buildBlankPage() {
  return `<div class="cert-page cert-blank-page"></div>`;
}

export function buildInfoPage(cert, index, total) {
  const icon = CAT_ICONS[cert.category] || "bi-award";
  const skills = cert.skills
    .map((s) => `<span class="cert-skill-tag">${s}</span>`)
    .join("");
  return `<div class="cert-page page-left">
    <div class="page-lines"></div>
    <div class="page-inner">
      <div class="cert-page-header">
        <p class="cert-page-number">PAGE ${String(index + 1).padStart(2, "0")} / ${String(total).padStart(2, "0")}</p>
        <span class="cert-id-stamp">#${String(cert.id).padStart(3, "0")}</span>
      </div>
      <span class="cert-issuer-badge" style="color:${cert.color};border-color:${cert.color};background:${cert.color}18">
        <i class="bi ${icon}"></i> ${cert.category.charAt(0).toUpperCase() + cert.category.slice(1)}
      </span>
      <h3 class="cert-title-text">${cert.name}</h3>
      <p class="cert-issuer-name">
        <i class="bi bi-building" style="color:${cert.color}"></i> ${cert.issuer}
      </p>
      <div class="cert-skills-list">${skills}</div>
      <a href="${cert.credentialUrl}" target="_blank" rel="noopener noreferrer"
         class="cert-view-btn"
         style="color:${cert.color};border-color:${cert.color};background:${cert.color}15"
         aria-label="View credential for ${cert.name}">
        <i class="bi bi-arrow-up-right-square"></i> View Credential
      </a>
    </div>
  </div>`;
}

export function buildImagePage(cert) {
  return `<div class="cert-page page-right">
    <div class="page-lines"></div>
    <div class="page-inner">
      <div class="cert-img-frame">
        <img src="${cert.image}"
             alt="${cert.name} certificate"
             class="cert-main-img"
             loading="lazy"
             data-cert-id="${cert.id}"
             tabindex="0" role="button"
             aria-label="Zoom ${cert.name}">
        <span class="cert-zoom-hint"><i class="bi bi-zoom-in"></i> Click to zoom</span>
      </div>
    </div>
  </div>`;
}

export function buildCombinedPage(cert, index, total) {
  const icon = CAT_ICONS[cert.category] || "bi-award";
  return `<div class="cert-page page-combined">
    <div class="page-lines"></div>
    <div class="page-inner">
      <div class="cert-page-header">
        <p class="cert-page-number">PAGE ${String(index + 1).padStart(2, "0")} / ${String(total).padStart(2, "0")}</p>
        <span class="cert-id-stamp">#${String(cert.id).padStart(3, "0")}</span>
      </div>
      <span class="cert-issuer-badge" style="color:${cert.color};border-color:${cert.color};background:${cert.color}18">
        <i class="bi ${icon}"></i> ${cert.category.charAt(0).toUpperCase() + cert.category.slice(1)}
      </span>
      <h3 class="cert-title-text">${cert.name}</h3>
      <p class="cert-issuer-name"><i class="bi bi-building" style="color:${cert.color}"></i> ${cert.issuer}</p>
      <div class="cert-img-frame">
        <img src="${cert.image}"
             alt="${cert.name} certificate"
             class="cert-main-img"
             loading="lazy"
             data-cert-id="${cert.id}"
             tabindex="0" role="button"
             aria-label="Zoom ${cert.name}">
        <span class="cert-zoom-hint"><i class="bi bi-zoom-in"></i> Click to zoom</span>
      </div>
      <a href="${cert.credentialUrl}" target="_blank" rel="noopener noreferrer"
         class="cert-view-btn"
         style="color:${cert.color};border-color:${cert.color};background:${cert.color}15"
         aria-label="View credential for ${cert.name}">
        <i class="bi bi-arrow-up-right-square"></i> View Credential
      </a>
    </div>
  </div>`;
}

export function buildMagazineHTML(certs, isSingle) {
  if (isSingle) {
    return certs.map((c, i) => buildCombinedPage(c, i, certs.length)).join("");
  }
  let html = buildBlankPage();
  certs.forEach((cert, i) => {
    html += buildInfoPage(cert, i, certs.length);
    html += buildImagePage(cert);
  });
  return html;
}
