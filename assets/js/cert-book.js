"use strict";

/* =============================================
   CERTIFICATE BOOK — Upgraded Interactive Book
   ============================================= */

const CERTIFICATES = [
  {
    id: 1,
    name: "CSS Essentials",
    issuer: "Cisco Networking Academy",
    category: "cisco",
    color: "#00bceb",
    image:
      "assets/images/certifcates/cisco/CSS Essentials - Cisco Networking Academy.webp",
    badge:
      "assets/images/certifcates/cisco/CSS Essentials Badge \u2013 Cisco Networking Academy.webp",
    skills: ["CSS3", "Selectors", "Box Model", "Responsive Design"],
    credentialUrl: "https://www.netacad.com/courses/css-essentials",
  },
  {
    id: 2,
    name: "HTML Essentials",
    issuer: "Cisco Networking Academy",
    category: "cisco",
    color: "#00bceb",
    image:
      "assets/images/certifcates/cisco/HTML Essentials \u2013 Cisco Networking Academy.webp",
    badge:
      "assets/images/certifcates/cisco/HTML Essentials Badge \u2013 Cisco Networking Academy.webp",
    skills: ["HTML5", "Semantic Markup", "Forms", "Accessibility"],
    credentialUrl: "https://www.netacad.com/courses/html-essentials",
  },
  {
    id: 3,
    name: "JavaScript Essentials 1",
    issuer: "Cisco Networking Academy",
    category: "cisco",
    color: "#00bceb",
    image:
      "assets/images/certifcates/cisco/JavaScript Essentials 1 - Cisco Networking Academy.webp",
    badge:
      "assets/images/certifcates/cisco/JavaScript Essentials 1 Badge \u2013 Cisco Certified.webp",
    skills: ["JavaScript", "Variables", "Functions", "DOM Basics"],
    credentialUrl: "https://www.netacad.com/courses/javascript-essentials-1",
  },
  {
    id: 4,
    name: "JavaScript Essentials 2",
    issuer: "Cisco Networking Academy",
    category: "cisco",
    color: "#00bceb",
    image:
      "assets/images/certifcates/cisco/JavaScript Essentials 2 - Cisco Networking Academy.webp",
    badge:
      "assets/images/certifcates/cisco/JavaScript Essentials 2 Badge - Cisco Networking Academy.webp",
    skills: ["Advanced JS", "OOP", "Async / Await", "Error Handling"],
    credentialUrl: "https://www.netacad.com/courses/javascript-essentials-2",
  },

  {
    id: 5,
    name: "Full Stack Web Development",
    issuer: "Amazon Web Services / Coursera",
    category: "coursera",
    color: "#ff9900",
    image:
      "assets/images/certifcates/coursera/amazon/Full Stack Web Development - Amazon Coursera.webp",
    badge: null,
    skills: ["Full Stack", "React", "Node.js", "AWS Services"],
    credentialUrl: "https://www.coursera.org/learn/full-stack-web-development",
  },
  {
    id: 6,
    name: "Generative AI in Software Development",
    issuer: "Amazon Web Services / Coursera",
    category: "coursera",
    color: "#ff9900",
    image:
      "assets/images/certifcates/coursera/amazon/Generative AI in Software Development - Amazon Coursera.webp",
    badge: null,
    skills: ["Generative AI", "LLMs", "Prompt Engineering", "AI Tools"],
    credentialUrl:
      "https://www.coursera.org/learn/generative-ai-in-software-development",
  },

  {
    id: 7,
    name: "Introduction to HTML, CSS, & JavaScript",
    issuer: "IBM / Coursera",
    category: "coursera",
    color: "#1f70c1",
    image:
      "assets/images/certifcates/coursera/ibm/Introduction to HTML, CSS, & JavaScript - IBM Coursera.webp",
    badge: null,
    skills: ["HTML", "CSS", "JavaScript", "IBM Cloud"],
    credentialUrl:
      "https://www.coursera.org/learn/introduction-html-css-javascript",
  },

  {
    id: 8,
    name: "Introduction to Front-End Development",
    issuer: "Meta / Coursera",
    category: "coursera",
    color: "#0866ff",
    image:
      "assets/images/certifcates/coursera/meta/Introduction to Front-End Development - Meta Coursera.webp",
    badge: null,
    skills: ["HTML", "CSS", "Bootstrap", "UI Principles"],
    credentialUrl:
      "https://www.coursera.org/learn/introduction-to-front-end-development",
  },

  {
    id: 9,
    name: "Become a Software Developer",
    issuer: "LinkedIn Learning",
    category: "linkedin",
    color: "#0a66c2",
    image:
      "assets/images/certifcates/linkedln/Become a Software Developer - Linkedln Learning.webp",
    badge: null,
    skills: [
      "Software Development",
      "Career Path",
      "Algorithms",
      "Problem Solving",
    ],
    credentialUrl:
      "https://www.linkedin.com/learning/paths/become-a-software-developer",
  },
  {
    id: 10,
    name: "CSS Essential Training",
    issuer: "LinkedIn Learning",
    category: "linkedin",
    color: "#0a66c2",
    image:
      "assets/images/certifcates/linkedln/CSS Essential Training - Linkedln Learning.webp",
    badge: null,
    skills: ["CSS3", "Flexbox", "Grid", "Animations"],
    credentialUrl: "https://www.linkedin.com/learning/css-essential-training",
  },
  {
    id: 11,
    name: "HTML Essential Training (2020)",
    issuer: "LinkedIn Learning",
    category: "linkedin",
    color: "#0a66c2",
    image:
      "assets/images/certifcates/linkedln/HTML Essential Training (2020) - Linkedln Learning.webp",
    badge: null,
    skills: ["HTML5", "Semantic HTML", "Tables", "Forms"],
    credentialUrl: "https://www.linkedin.com/learning/html-essential-training",
  },
  {
    id: 12,
    name: "Learning SQL Programming",
    issuer: "LinkedIn Learning",
    category: "linkedin",
    color: "#0a66c2",
    image:
      "assets/images/certifcates/linkedln/Learning SQL Programming - Linkedln Learning.webp",
    badge: null,
    skills: ["SQL", "Databases", "Queries", "Joins"],
    credentialUrl: "https://www.linkedin.com/learning/learning-sql-programming",
  },
  {
    id: 13,
    name: "Succeeding in Web Development: Full Stack & Front End",
    issuer: "LinkedIn Learning",
    category: "linkedin",
    color: "#0a66c2",
    image:
      "assets/images/certifcates/linkedln/Succeeding in Web Development Full Stack and Front End - Linkedln Learning.webp",
    badge: null,
    skills: ["Full Stack", "Front-End", "Back-End", "Deployment"],
    credentialUrl:
      "https://www.linkedin.com/learning/succeeding-in-web-development-full-stack-and-front-end",
  },

  {
    id: 14,
    name: "Building User-Friendly Websites with ChatGPT",
    issuer: "Simplilearn",
    category: "simplilearn",
    color: "#f6921e",
    image:
      "assets/images/certifcates/simplilearn/Building User-Friendly Websites with ChatGPT.webp",
    badge: null,
    skills: ["ChatGPT", "AI-Assisted Design", "UX", "Web Dev"],
    credentialUrl: "https://www.simplilearn.com",
  },
  {
    id: 15,
    name: "GitHub Copilot Fundamentals",
    issuer: "Simplilearn & Microsoft",
    category: "simplilearn",
    color: "#f6921e",
    image:
      "assets/images/certifcates/simplilearn/GitHub Copilot Fundamentals - Simplilearn & Microsoft.webp",
    badge: null,
    skills: ["GitHub Copilot", "AI Coding", "Productivity", "Microsoft"],
    credentialUrl: "https://www.simplilearn.com/github-copilot",
  },
  {
    id: 16,
    name: "Introduction to Front-End Development",
    issuer: "Simplilearn",
    category: "simplilearn",
    color: "#f6921e",
    image:
      "assets/images/certifcates/simplilearn/Introduction to Front-End Development - Simplilearn.webp",
    badge: null,
    skills: ["HTML", "CSS", "JavaScript", "Bootstrap"],
    credentialUrl: "https://www.simplilearn.com",
  },
  {
    id: 17,
    name: "JavaScript for Beginners",
    issuer: "Simplilearn",
    category: "simplilearn",
    color: "#f6921e",
    image:
      "assets/images/certifcates/simplilearn/JavaScript for Beginners I Simplilearn.webp",
    badge: null,
    skills: ["JavaScript", "ES6", "DOM", "Events"],
    credentialUrl: "https://www.simplilearn.com",
  },

  {
    id: 18,
    name: "CSS Essentials — Digital Badge",
    issuer: "Cisco Networking Academy",
    category: "cisco",
    color: "#00bceb",
    image:
      "assets/images/certifcates/cisco/CSS Essentials Badge \u2013 Cisco Networking Academy.webp",
    badge: null,
    skills: ["CSS3", "Selectors", "Box Model", "Responsive Design"],
    credentialUrl: "https://www.netacad.com/courses/css-essentials",
  },
  {
    id: 19,
    name: "HTML Essentials — Digital Badge",
    issuer: "Cisco Networking Academy",
    category: "cisco",
    color: "#00bceb",
    image:
      "assets/images/certifcates/cisco/HTML Essentials Badge \u2013 Cisco Networking Academy.webp",
    badge: null,
    skills: ["HTML5", "Semantic Markup", "Forms", "Accessibility"],
    credentialUrl: "https://www.netacad.com/courses/html-essentials",
  },
  {
    id: 20,
    name: "JavaScript Essentials 1 — Digital Badge",
    issuer: "Cisco Networking Academy",
    category: "cisco",
    color: "#00bceb",
    image:
      "assets/images/certifcates/cisco/JavaScript Essentials 1 Badge \u2013 Cisco Certified.webp",
    badge: null,
    skills: ["JavaScript", "Variables", "Functions", "DOM Basics"],
    credentialUrl: "https://www.netacad.com/courses/javascript-essentials-1",
  },
  {
    id: 21,
    name: "JavaScript Essentials 2 — Digital Badge",
    issuer: "Cisco Networking Academy",
    category: "cisco",
    color: "#00bceb",
    image:
      "assets/images/certifcates/cisco/JavaScript Essentials 2 Badge - Cisco Networking Academy.webp",
    badge: null,
    skills: ["Advanced JS", "OOP", "Async / Await", "Error Handling"],
    credentialUrl: "https://www.netacad.com/courses/javascript-essentials-2",
  },
];

const CAT_ICONS = {
  cisco: "bi-hdd-network",
  coursera: "bi-mortarboard",
  linkedin: "bi-linkedin",
  simplilearn: "bi-lightbulb",
};

let filtered = [...CERTIFICATES];
let current = 0;
let animating = false;
let autoPlayTimer = null;
let autoPlayEnabled = true;
const AUTO_PLAY_INTERVAL = 5000;

const book = document.getElementById("certBook");
const leftContent = document.getElementById("pageLeftContent");
const rightContent = document.getElementById("pageRightContent");
const flipLayer = document.getElementById("bookFlipLayer");
const flipFront = document.getElementById("flipFaceFront");
const flipBack = document.getElementById("flipFaceBack");
const counter = document.getElementById("certCounter");
const dotNav = document.getElementById("certDotNav");
const prevBtn = document.getElementById("certPrevBtn");
const nextBtn = document.getElementById("certNextBtn");
const progressBar = document.getElementById("certProgressBar");
const autoPlayBtn = document.getElementById("certAutoPlayBtn");
const lightbox = document.getElementById("certLightbox");
const lightboxImg = document.getElementById("certLightboxImg");
const lightboxTitle = document.getElementById("certLightboxTitle");
const lightboxClose = document.getElementById("certLightboxClose");

/* ---------- Page builders ---------- */

function buildLeftPage(cert, index, total) {
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

function buildRightPage(cert) {
  return `
    <div class="cert-img-frame">
      <img src="${cert.image}" alt="${cert.name} certificate" class="cert-main-img" loading="lazy"
           data-cert-name="${cert.name}" tabindex="0" role="button" aria-label="Zoom ${cert.name}">
      <span class="cert-zoom-hint"><i class="bi bi-zoom-in"></i> Click to zoom</span>
    </div>`;
}

/* ---------- Rendering ---------- */

function renderCert(index) {
  const cert = filtered[index];
  const total = filtered.length;

  leftContent.innerHTML = buildLeftPage(cert, index, total);
  rightContent.innerHTML = buildRightPage(cert);

  leftContent.classList.remove("page-fade-in");
  rightContent.classList.remove("page-fade-in");
  void leftContent.offsetWidth;
  leftContent.classList.add("page-fade-in");
  rightContent.classList.add("page-fade-in");

  counter.textContent = `${index + 1} / ${total}`;

  /* Progress bar */
  if (progressBar) {
    const pct = total > 1 ? (index / (total - 1)) * 100 : 100;
    progressBar.style.width = pct + "%";
  }

  /* Dot nav */
  document.querySelectorAll(".cert-dot").forEach((dot, i) => {
    dot.classList.toggle("active", i === index);
    dot.setAttribute("aria-selected", i === index ? "true" : "false");
  });

  prevBtn.disabled = index === 0;
  nextBtn.disabled = index === total - 1;

  /* Attach lightbox to new image */
  const img = rightContent.querySelector(".cert-main-img");
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

/* ---------- Page flip ---------- */

function flipTo(dir) {
  if (animating) return;
  const isFwd = dir === "fwd";
  const nextIndex = isFwd ? current + 1 : current - 1;
  if (nextIndex < 0 || nextIndex >= filtered.length) return;

  const isMobile = window.innerWidth < 768;
  if (isMobile) {
    /* Slide transition on mobile */
    animating = true;
    const slideDir = isFwd ? "slide-out-left" : "slide-out-right";
    book.classList.add(slideDir);
    setTimeout(() => {
      current = nextIndex;
      renderCert(current);
      book.classList.remove(slideDir);
      book.classList.add(isFwd ? "slide-in-right" : "slide-in-left");
      setTimeout(() => {
        book.classList.remove("slide-in-right", "slide-in-left");
        animating = false;
      }, 350);
    }, 300);
    return;
  }

  animating = true;
  const cert = filtered[nextIndex];

  if (isFwd) {
    flipFront.innerHTML = buildRightPage(filtered[current]);
    flipBack.innerHTML = buildRightPage(cert);
  } else {
    flipFront.innerHTML = buildRightPage(cert);
    flipBack.innerHTML = buildRightPage(filtered[current]);
  }

  flipLayer.className = "book-flip-layer";
  void flipLayer.offsetWidth;
  flipLayer.classList.add(isFwd ? "flipping-fwd" : "flipping-bck");
  flipLayer.style.display = "block";

  setTimeout(() => {
    current = nextIndex;
    renderCert(current);
  }, 450);

  flipLayer.addEventListener(
    "animationend",
    function onEnd() {
      flipLayer.removeEventListener("animationend", onEnd);
      flipLayer.style.display = "none";
      flipLayer.className = "book-flip-layer";
      animating = false;
    },
    { once: true },
  );
}

/* ---------- Dot navigation ---------- */

function buildDots() {
  dotNav.innerHTML = "";
  filtered.forEach((cert, i) => {
    const dot = document.createElement("button");
    dot.className = "cert-dot" + (i === current ? " active" : "");
    dot.setAttribute("role", "tab");
    dot.setAttribute("aria-label", `Go to certificate ${i + 1}: ${cert.name}`);
    dot.setAttribute("aria-selected", i === current ? "true" : "false");
    dot.title = cert.name;
    dot.addEventListener("click", () => {
      if (animating || i === current) return;
      current = i;
      renderCert(current);
      resetAutoPlay();
    });
    dotNav.appendChild(dot);
  });
}

/* ---------- Category filter ---------- */

function filterByCategory(cat) {
  filtered =
    cat === "all"
      ? [...CERTIFICATES]
      : CERTIFICATES.filter((c) => c.category === cat);
  current = 0;
  buildDots();
  renderCert(current);
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

/* ---------- Auto-play ---------- */

function startAutoPlay() {
  stopAutoPlay();
  if (!autoPlayEnabled) return;
  autoPlayTimer = setInterval(() => {
    if (current < filtered.length - 1) {
      flipTo("fwd");
    } else {
      current = -1;
      flipTo("fwd");
    }
  }, AUTO_PLAY_INTERVAL);
}

function stopAutoPlay() {
  if (autoPlayTimer) {
    clearInterval(autoPlayTimer);
    autoPlayTimer = null;
  }
}

function resetAutoPlay() {
  if (autoPlayEnabled) startAutoPlay();
}

function toggleAutoPlay() {
  autoPlayEnabled = !autoPlayEnabled;
  if (autoPlayBtn) {
    autoPlayBtn.innerHTML = autoPlayEnabled
      ? '<i class="bi bi-pause-circle"></i>'
      : '<i class="bi bi-play-circle"></i>';
    autoPlayBtn.title = autoPlayEnabled
      ? "Pause auto-play"
      : "Resume auto-play";
    autoPlayBtn.classList.toggle("paused", !autoPlayEnabled);
  }
  if (autoPlayEnabled) startAutoPlay();
  else stopAutoPlay();
}

if (autoPlayBtn) autoPlayBtn.addEventListener("click", toggleAutoPlay);

/* Pause on hover / focus, resume on leave */
book.addEventListener("mouseenter", stopAutoPlay);
book.addEventListener("mouseleave", () => {
  if (autoPlayEnabled) startAutoPlay();
});
book.addEventListener("focusin", stopAutoPlay);
book.addEventListener("focusout", () => {
  if (autoPlayEnabled) startAutoPlay();
});

/* ---------- Lightbox ---------- */

function openLightbox(cert) {
  if (!lightbox) return;
  lightboxImg.src = cert.image;
  lightboxImg.alt = cert.name + " certificate";
  if (lightboxTitle) lightboxTitle.textContent = cert.name;
  lightbox.classList.add("active");
  document.body.style.overflow = "hidden";
  stopAutoPlay();
}

function closeLightbox() {
  if (!lightbox) return;
  lightbox.classList.remove("active");
  document.body.style.overflow = "";
  if (autoPlayEnabled) startAutoPlay();
}

if (lightboxClose) lightboxClose.addEventListener("click", closeLightbox);
if (lightbox) {
  lightbox.addEventListener("click", (e) => {
    if (
      e.target === lightbox ||
      e.target === lightbox.querySelector(".cert-lightbox-backdrop")
    )
      closeLightbox();
  });
}

/* ---------- Navigation events ---------- */

prevBtn.addEventListener("click", () => {
  flipTo("bck");
  resetAutoPlay();
});
nextBtn.addEventListener("click", () => {
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
  if (e.key === "Escape" && lightbox && lightbox.classList.contains("active"))
    closeLightbox();
});

/* Touch / swipe */
let touchStartX = 0;
book.addEventListener(
  "touchstart",
  (e) => {
    touchStartX = e.touches[0].clientX;
  },
  { passive: true },
);
book.addEventListener("touchend", (e) => {
  const dx = e.changedTouches[0].clientX - touchStartX;
  if (Math.abs(dx) < 40) return;
  dx < 0 ? flipTo("fwd") : flipTo("bck");
  resetAutoPlay();
});

/* ---------- Init ---------- */
buildDots();
renderCert(0);
startAutoPlay();
