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
