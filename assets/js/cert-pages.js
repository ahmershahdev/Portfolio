import { CAT_ICONS } from "./cert-data.js";

export function buildLeftPage(cert, index, total) {
  const icon = CAT_ICONS[cert.category] || "bi-award";
  const badgeHTML = cert.badge
    ? `<img src="${cert.badge}" alt="${cert.name} badge" class="cert-badge-img" loading="lazy">`
    : "";

  const skillsHTML = cert.skills
    .map((s) => `<span class="cert-skill-tag">${s}</span>`)
    .join("");

  return `
    <div class="cert-page-header">
      <p class="cert-page-number">PAGE ${String(index + 1).padStart(2, "0")} / ${String(total).padStart(2, "0")}</p>
      <span class="cert-id-stamp">#${String(cert.id).padStart(3, "0")}</span>
    </div>
    <span class="cert-issuer-badge" style="color:${cert.color};border-color:${cert.color};background:${cert.color}18">
      <i class="bi ${icon}"></i> ${cert.category.charAt(0).toUpperCase() + cert.category.slice(1)}
    </span>
    ${badgeHTML}
    <h3 class="cert-title-text">${cert.name}</h3>
    <p class="cert-issuer-name">
      <i class="bi bi-building" style="color:${cert.color}"></i>
      ${cert.issuer}
    </p>
    <div class="cert-skills-list">${skillsHTML}</div>
    <a href="${cert.credentialUrl}" target="_blank" rel="noopener noreferrer"
       class="cert-view-btn"
       style="color:${cert.color};border-color:${cert.color};background:${cert.color}15"
       aria-label="View credential for ${cert.name}">
      <i class="bi bi-arrow-up-right-square"></i> View Credential
    </a>`;
}

export function buildRightPage(cert) {
  return `
    <div class="cert-img-frame">
      <img src="${cert.image}" alt="${cert.name} certificate" class="cert-main-img" loading="lazy"
           data-cert-name="${cert.name}" tabindex="0" role="button" aria-label="Zoom ${cert.name}">
      <span class="cert-zoom-hint"><i class="bi bi-zoom-in"></i> Click to zoom</span>
    </div>`;
}
