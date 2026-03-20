const NAVBAR_HEIGHT = 65;
let isManualScrolling = false;

export function initializeNavigation() {
  const navLinks = document.querySelectorAll(".nav-link, .dropdown-item");
  const backToTopButton = document.getElementById("backToTop");
  const scrollProgressBar = document.getElementById("scroll-progress-bar");
  const offcanvasElement = document.getElementById("offcanvasNavbar");
  const lenis = window.__lenis ?? null;

  document
    .querySelectorAll(".project-img img, #three-bg-container")
    .forEach((img) => img.addEventListener("contextmenu", (e) => e.preventDefault()));

  const handleBackToTop = (e) => {
    if (e.cancelable) e.preventDefault();
    if (backToTopButton.classList.contains("firing")) return;
    backToTopButton.classList.add("firing");
    if (lenis) lenis.scrollTo(0);
    else window.scrollTo({ top: 0, behavior: "smooth" });
    setTimeout(() => backToTopButton.classList.remove("firing"), 1000);
  };

  backToTopButton?.addEventListener("click", handleBackToTop);

  const onScroll = ({ scroll, limit } = {}) => {
    const scrollY = scroll ?? window.scrollY;
    backToTopButton?.classList.toggle("show", scrollY > 400);
    if (scrollProgressBar) {
      const docHeight = limit ?? (document.documentElement.scrollHeight - window.innerHeight);
      const percent = docHeight > 0 ? (scrollY / docHeight) * 100 : 0;
      scrollProgressBar.style.width = `${percent}%`;
    }
  };

  if (lenis) lenis.on("scroll", onScroll);
  else window.addEventListener("scroll", () => requestAnimationFrame(() => onScroll()), { passive: true });

  navLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      const targetId = this.getAttribute("href");
      if (!targetId || !targetId.startsWith("#")) return;

      const targetElement = document.querySelector(targetId);
      if (!targetElement) return;

      e.preventDefault();
      isManualScrolling = true;
      updateActiveLink(this, navLinks);

      if (lenis) {
        lenis.scrollTo(targetElement, { offset: -NAVBAR_HEIGHT });
      } else {
        const targetPosition = targetElement.getBoundingClientRect().top + window.scrollY - NAVBAR_HEIGHT + 1;
        window.scrollTo({ top: targetPosition, behavior: "smooth" });
      }

      if (offcanvasElement && typeof bootstrap !== "undefined") {
        const bsOffcanvas = bootstrap.Offcanvas.getInstance(offcanvasElement);
        if (bsOffcanvas) bsOffcanvas.hide();
      }

      setTimeout(() => { isManualScrolling = false; }, 1000);
    });
  });

  initializeNavigationObserver(navLinks);
}

function updateActiveLink(activeEl, navLinks) {
  navLinks.forEach((link) => {
    link.classList.remove("active");
    link.removeAttribute("aria-current");
  });

  activeEl.classList.add("active");
  activeEl.setAttribute("aria-current", "page");

  if (activeEl.classList.contains("dropdown-item")) {
    activeEl.closest(".dropdown")?.querySelector(".nav-link")?.classList.add("active");
  }
}

function initializeNavigationObserver(navLinks) {
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      if (isManualScrolling) return;
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = `#${entry.target.id}`;
          const match = Array.from(navLinks).find((link) => link.getAttribute("href") === id);
          if (match) updateActiveLink(match, navLinks);
        }
      });
    },
    { rootMargin: `-${NAVBAR_HEIGHT}px 0px -45% 0px`, threshold: 0 },
  );

  document.querySelectorAll("section[id]").forEach((section) => sectionObserver.observe(section));
}