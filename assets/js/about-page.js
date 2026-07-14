// about-page.js — behaviour scoped to about.html only.
// Loaded as a module; runs after DOMContentLoaded-equivalent (module defer timing).

/* ---------------------------------------------------------------
   1. Hero role typewriter
--------------------------------------------------------------- */
function initHeroTyping() {
  const el = document.getElementById("heroTypingText");
  if (!el) return;

  const roles = [
    "Full-Stack Developer",
    "Software Engineer",
    "Building Scalable Web Applications",
    "Crafting Digital Experiences",
    "Developing AI-Powered Solutions",
  ];

  let roleIndex = 0;
  let charIndex = 0;
  let deleting = false;

  const TYPE_SPEED = 55;
  const DELETE_SPEED = 30;
  const HOLD_MS = 1400;

  function tick() {
    const current = roles[roleIndex];

    if (!deleting) {
      charIndex++;
      el.textContent = current.slice(0, charIndex);
      if (charIndex === current.length) {
        deleting = true;
        setTimeout(tick, HOLD_MS);
        return;
      }
      setTimeout(tick, TYPE_SPEED);
      return;
    }

    charIndex--;
    el.textContent = current.slice(0, charIndex);
    if (charIndex === 0) {
      deleting = false;
      roleIndex = (roleIndex + 1) % roles.length;
      setTimeout(tick, 300);
      return;
    }
    setTimeout(tick, DELETE_SPEED);
  }

  tick();
}

/* ---------------------------------------------------------------
   2. Best-of-Best coverflow carousel
--------------------------------------------------------------- */
const BOB_ITEMS = [
  {
    img: "https://res.cloudinary.com/syedahmershah/image/upload/t_portfolio_project_t/v1776536520/portfolio/projects/commerza.webp",
    title: "Commerza — E-Commerce Store",
    tag: "Project · Laravel & MySQL",
    type: "project",
  },
  {
    img: "https://res.cloudinary.com/syedahmershah/image/upload/t_portfolio_project_t/v1776536522/portfolio/projects/novio.webp",
    title: "Novio",
    tag: "Project · Full-Stack Build",
    type: "project",
  },
  {
    img: "https://res.cloudinary.com/syedahmershah/image/upload/t_portfolio_project_t/v1776536518/portfolio/projects/auctions_table.webp",
    title: "Auctions Table",
    tag: "Project · Frontend",
    type: "project",
  },
  {
    img: "https://res.cloudinary.com/syedahmershah/image/upload/t_portfolio_project_t/v1776536516/portfolio/projects/3d_portfolio.webp",
    title: "Personal 3D Portfolio",
    tag: "Project · Three.js & Bootstrap",
    type: "project",
  },
  {
    img: "https://res.cloudinary.com/syedahmershah/image/upload/t_portfolio_cert_t/v1776536478/portfolio/certifcates/coursera/meta/meta-full-stack-developer-front-end-back-end-from-scratch-meta-coursera.webp",
    title: "Meta Full-Stack Developer",
    tag: "Certificate · Meta / Coursera",
    type: "certificate",
  },
  {
    img: "https://res.cloudinary.com/syedahmershah/image/upload/t_portfolio_cert_t/v1776536481/portfolio/certifcates/coursera/microsoft/microsoft-full-stack-developer-microsoft-coursera.webp",
    title: "Microsoft Full-Stack Developer",
    tag: "Certificate · Microsoft / Coursera",
    type: "certificate",
  },
  {
    img: "https://res.cloudinary.com/syedahmershah/image/upload/t_portfolio_cert_t/v1776536468/portfolio/certifcates/coursera/amazon/amazon-junior-software-developer-amazon-coursera.webp",
    title: "Amazon Junior Software Developer",
    tag: "Certificate · Amazon / Coursera",
    type: "certificate",
  },
  {
    img: "https://res.cloudinary.com/syedahmershah/image/upload/t_portfolio_cert_t/v1776536474/portfolio/certifcates/coursera/ibm/ibm-devops-and-software-engineering-ibm-coursera.webp",
    title: "IBM DevOps and Software Engineering",
    tag: "Certificate · IBM / Coursera",
    type: "certificate",
  },
  {
    img: "https://res.cloudinary.com/syedahmershah/image/upload/t_portfolio_cert_t/v1776536579/portfolio/certifcates/coursera/board_infinity/full-stack-web-development-php-html-css-javascript-boardinfinity-coursera.webp",
    title: "Full-Stack Web Development",
    tag: "Certificate · Board Infinity / Coursera",
    type: "certificate",
  },
  {
    img: "https://res.cloudinary.com/syedahmershah/image/upload/t_portfolio_cert_t/v1776536494/portfolio/certifcates/linkedln/become-a-software-developer-linkedln-learning.webp",
    title: "Become a Software Developer",
    tag: "Certificate · LinkedIn Learning",
    type: "certificate",
  },
];

// NOTE: this array is mirrored as a JSON-LD ItemList in about.html (search
// for "#best-of-the-best"). If you add, remove, or reorder items here,
// update that block too so search engines see the same list as the
// carousel actually renders.

function initBestOfBest() {
  const stage = document.getElementById("bobTrack");
  if (!stage) return;

  const captionTitle = document.getElementById("bobCaptionTitle");
  const captionTag = document.getElementById("bobCaptionTag");
  const dotsWrap = document.getElementById("bobDots");
  const prevBtn = document.getElementById("bobPrev");
  const nextBtn = document.getElementById("bobNext");

  let current = 0;
  let typeTimer = null;
  let autoTimer = null;
  const total = BOB_ITEMS.length;

  // Build slides
  const slideEls = BOB_ITEMS.map((item, i) => {
    const div = document.createElement("div");
    div.className = "bob-slide";
    div.dataset.index = String(i);
    div.setAttribute("role", "button");
    div.setAttribute("tabindex", "0");
    const kind = item.type === "certificate" ? "Certificate" : "Project";
    div.setAttribute("aria-label", `${kind}: ${item.title}`);
    const img = document.createElement("img");
    img.src = item.img;
    img.alt = `${item.title} — ${item.tag}`;
    img.loading = "lazy";
    img.decoding = "async";
    // Square intrinsic hint matching the CSS aspect-ratio: 1/1 frame, so
    // the browser can reserve the right box before the file downloads
    // instead of shifting layout once it loads.
    img.width = 400;
    img.height = 400;
    div.appendChild(img);
    div.addEventListener("click", () => goTo(i));
    div.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        goTo(i);
      }
    });
    stage.appendChild(div);
    return div;
  });

  // Build dots
  const dotEls = BOB_ITEMS.map((_, i) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = "bob-dot";
    dot.setAttribute("aria-label", `Go to slide ${i + 1}`);
    dot.addEventListener("click", () => goTo(i));
    dotsWrap?.appendChild(dot);
    return dot;
  });

  function relativePosition(index) {
    let diff = index - current;
    if (diff > total / 2) diff -= total;
    if (diff < -total / 2) diff += total;
    return diff;
  }

  function render() {
    slideEls.forEach((el, i) => {
      const diff = relativePosition(i);
      el.className = "bob-slide";
      if (diff === 0) el.classList.add("is-active");
      else if (diff === -1) el.classList.add("is-prev1");
      else if (diff === 1) el.classList.add("is-next1");
      else if (diff === -2) el.classList.add("is-prev2");
      else if (diff === 2) el.classList.add("is-next2");
    });

    dotEls.forEach((d, i) => d.classList.toggle("is-active", i === current));

    typeCaption(BOB_ITEMS[current]);
  }

  function typeCaption(item) {
    if (typeTimer) clearTimeout(typeTimer);
    if (!captionTitle) return;
    captionTag.textContent = item.tag;
    let i = 0;
    captionTitle.innerHTML = '<span class="caret"></span>';

    function step() {
      i++;
      captionTitle.innerHTML =
        item.title.slice(0, i) + '<span class="caret"></span>';
      if (i < item.title.length) {
        typeTimer = setTimeout(step, 28);
      }
    }
    step();
  }

  function goTo(index) {
    current = ((index % total) + total) % total;
    render();
    restartAutoplay();
  }

  function next() {
    goTo(current + 1);
  }

  function prev() {
    goTo(current - 1);
  }

  function restartAutoplay() {
    if (autoTimer) clearInterval(autoTimer);
    autoTimer = setInterval(next, 4200);
  }

  prevBtn?.addEventListener("click", prev);
  nextBtn?.addEventListener("click", next);

  stage.parentElement?.addEventListener("mouseenter", () => {
    if (autoTimer) clearInterval(autoTimer);
  });
  stage.parentElement?.addEventListener("mouseleave", restartAutoplay);

  render();
  restartAutoplay();
}

/* ---------------------------------------------------------------
   3. Mission / Vision tab carousel
--------------------------------------------------------------- */
function initMissionVision() {
  const tabs = document.querySelectorAll(".mv-tab");
  const slides = document.querySelectorAll(".mv-slide");
  if (!tabs.length || !slides.length) return;

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const target = tab.dataset.target;
      tabs.forEach((t) => t.classList.toggle("is-active", t === tab));
      slides.forEach((s) => s.classList.toggle("is-active", s.id === target));
    });
  });
}

/* ---------------------------------------------------------------
   Init
--------------------------------------------------------------- */
initHeroTyping();
initBestOfBest();
initMissionVision();
