import { CERTIFICATES } from "./cert-data.js";
import { buildMagazineHTML } from "./cert-render.js";
import { openLightbox, closeLightbox, initLightbox } from "./cert-lightbox.js";
import { getBookDimensions, updateUI, buildDotNav } from "./cert-ui.js";

let filtered = [...CERTIFICATES];
let currentPage = 1;
let $book = null;
let isSingleMode = false;

const elPrevBtn = document.getElementById("certPrevBtn");
const elNextBtn = document.getElementById("certNextBtn");
const elLightbox = document.getElementById("certLightbox");
const certSection = document.getElementById("certificates");
const magScene = document.querySelector(".cert-magazine-scene");

initLightbox(magScene, () => filtered);

function initBook(certs) {
  const $ = window.jQuery;
  const dims = getBookDimensions();
  isSingleMode = dims.display === "single";

  const oldMag = document.getElementById("certMagazine");
  const shadow = magScene.querySelector(".book-ground-shadow");
  if (oldMag) {
    try {
      $(oldMag).turn("destroy");
    } catch (_) {}
    oldMag.remove();
  }

  const mag = document.createElement("div");
  mag.id = "certMagazine";
  mag.innerHTML = buildMagazineHTML(certs, isSingleMode);
  magScene.insertBefore(mag, shadow);

  const pageW = isSingleMode ? dims.width : dims.width / 2;
  const cornerSize = Math.floor(Math.min(pageW, dims.height) * 0.22);

  $book = $(mag);
  $book.turn({
    width: dims.width,
    height: dims.height,
    display: dims.display,
    acceleration: true,
    gradients: true,
    duration: 700,
    cornerSize,
    page: isSingleMode ? 1 : 2,
  });

  $book.bind("turning", function (_, page) {
    currentPage = page;
    updateUI(page, certs, isSingleMode);
  });
  $book.bind("turned", function (_, page) {
    currentPage = page;
    updateUI(page, certs, isSingleMode);
  });

  const startPage = isSingleMode ? 1 : 2;
  currentPage = startPage;
  updateUI(startPage, certs, isSingleMode);
  buildDotNav(certs, isSingleMode, (i) => {
    if ($book) $book.turn("page", isSingleMode ? i + 1 : 2 + i * 2);
  });

  let swipeStartX = 0;
  mag.addEventListener(
    "touchstart",
    (e) => {
      swipeStartX = e.touches[0].clientX;
    },
    { passive: true },
  );
  mag.addEventListener("touchend", (e) => {
    const dx = e.changedTouches[0].clientX - swipeStartX;
    if (Math.abs(dx) < 40) return;
    dx < 0 ? $book.turn("next") : $book.turn("previous");
  });
}

elPrevBtn.addEventListener("click", () => {
  if ($book) $book.turn("previous");
});
elNextBtn.addEventListener("click", () => {
  if ($book) $book.turn("next");
});

certSection.addEventListener("keydown", (e) => {
  if (e.key === "ArrowRight" && $book) $book.turn("next");
  if (e.key === "ArrowLeft" && $book) $book.turn("previous");
  if (e.key === "Escape" && elLightbox?.classList.contains("active"))
    closeLightbox();
});

document.querySelectorAll(".cert-tab-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".cert-tab-btn").forEach((b) => {
      b.classList.remove("active");
      b.setAttribute("aria-pressed", "false");
    });
    btn.classList.add("active");
    btn.setAttribute("aria-pressed", "true");
    const cat = btn.dataset.cat;
    filtered =
      cat === "all"
        ? [...CERTIFICATES]
        : CERTIFICATES.filter((c) => c.category === cat);
    initBook(filtered);
  });
});

let resizeTimer;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => initBook(filtered), 350);
});

function waitForDeps(cb) {
  if (window.jQuery?.fn?.turn) {
    cb();
  } else {
    setTimeout(() => waitForDeps(cb), 50);
  }
}
waitForDeps(() => initBook(filtered));
waitForDeps(() => initBook(filtered));
