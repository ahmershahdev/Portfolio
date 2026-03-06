const professionPhrases = [
  "SWE Student",
  "Full-Stack Web Developer",
  "SQL Developer",
  "WordPress Developer",
  "PHP Developer",
  "Laravel Developer",
  "SEO",
];

export function initProjectCarousel() {
  const slides = document.querySelectorAll(".project-slide");
  const counter = document.getElementById("projectCounter");
  const prevBtn = document.getElementById("prevProject");
  const nextBtn = document.getElementById("nextProject");

  if (!slides.length || !prevBtn || !nextBtn) return;

  let current = 0;
  const total = slides.length;

  function triggerAnimation(slide) {
    slide.classList.remove("animate-in");

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        slide.classList.add("animate-in");
      });
    });
  }

  function showSlide(index) {
    slides[current].classList.remove("active", "animate-in");
    current = (index + total) % total;
    slides[current].classList.add("active");
    triggerAnimation(slides[current]);
    if (counter) counter.textContent = `${current + 1} / ${total}`;
  }

  const carouselObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          triggerAnimation(slides[current]);
        } else {
          slides[current].classList.remove("animate-in");
        }
      });
    },
    { threshold: 0.25 },
  );

  const section = document.getElementById("projects");
  if (section) carouselObserver.observe(section);

  prevBtn.addEventListener("click", () => showSlide(current - 1));
  nextBtn.addEventListener("click", () => showSlide(current + 1));

  document.addEventListener("keydown", (e) => {
    const projectsSection = document.getElementById("projects");
    if (!projectsSection) return;
    const rect = projectsSection.getBoundingClientRect();
    const inView = rect.top < window.innerHeight && rect.bottom > 0;
    if (!inView) return;
    if (e.key === "ArrowLeft") showSlide(current - 1);
    if (e.key === "ArrowRight") showSlide(current + 1);
  });

  if (counter) counter.textContent = `1 / ${total}`;
}

export function initializeAnimations() {
  typeWriterAnimation();
  initializeGlitchText();

  const generalObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (entry.target.classList.contains("skill-item")) {
            entry.target.querySelectorAll(".progress-bar").forEach((bar) => {
              bar.style.width = bar.getAttribute("aria-valuenow") + "%";
            });
          } else {
            entry.target.classList.add("reveal-visible");
            generalObserver.unobserve(entry.target);
          }
        }
      });
    },
    { threshold: 0.1 },
  );

  document
    .querySelectorAll('[class*="reveal-"], .curtain-reveal, .skill-item')
    .forEach((el) => generalObserver.observe(el));

  const sections = {
    education: "camera-view-left-active",
    skills: "camera-view-right-active",
    projects: "camera-view-back-active",
    certificates: "camera-view-left-active",
    contact: "camera-view-back-active",
  };

  const cameraObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const className = sections[entry.target.id];
        entry.target.classList.toggle(className, entry.isIntersecting);
        entry.target.classList.toggle("fog-fade-in", entry.isIntersecting);
        entry.target.classList.toggle("fog-fade-out", !entry.isIntersecting);
      });
    },
    { threshold: 0.2 },
  );

  Object.keys(sections).forEach((id) => {
    const el = document.getElementById(id);
    if (el) cameraObserver.observe(el);
  });
}

function typeWriterAnimation() {
  const el = document.getElementById("typewriter");
  if (!el) return;

  let phraseIdx = 0,
    charIdx = 0,
    isDeleting = false;

  function animate() {
    const current = professionPhrases[phraseIdx];
    el.textContent = current.substring(0, isDeleting ? charIdx-- : charIdx++);

    let speed = isDeleting ? 40 : 80;
    if (!isDeleting && charIdx > current.length) {
      isDeleting = true;
      speed = 2000;
    } else if (isDeleting && charIdx < 0) {
      isDeleting = false;
      phraseIdx = (phraseIdx + 1) % professionPhrases.length;
      charIdx = 0;
      speed = 500;
    }
    setTimeout(animate, speed);
  }
  animate();
}

function initializeGlitchText() {
  const glowingTextElement = document.querySelector(".glowing-text");
  const neonBorderElement =
    document.querySelector(".hero-orbit-scene") ||
    document.querySelector(".neon-border");

  if (glowingTextElement && neonBorderElement) {
    const originalText = glowingTextElement.textContent;
    const glitchCharacters = "!<>-_\\/[]{}—=+*^?________";
    let glitchAnimationId = null;

    neonBorderElement.addEventListener("mouseenter", () => {
      if (glitchAnimationId) cancelAnimationFrame(glitchAnimationId);
      const animationStart = performance.now();

      function updateGlitch(currentTime) {
        const iteration = (currentTime - animationStart) / 50;
        glowingTextElement.textContent = originalText
          .split("")
          .map((character, index) => {
            return index < iteration
              ? character
              : glitchCharacters[
                  Math.floor(Math.random() * glitchCharacters.length)
                ];
          })
          .join("");

        if (iteration < originalText.length) {
          glitchAnimationId = requestAnimationFrame(updateGlitch);
        } else {
          glowingTextElement.textContent = originalText;
        }
      }

      glitchAnimationId = requestAnimationFrame(updateGlitch);
    });
  }
}
