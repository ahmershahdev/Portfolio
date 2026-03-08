export function initSocialHub() {
  const panels = document.querySelectorAll(".social-panel");
  if (!panels.length) return;

  const panelObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const panel = entry.target;
        panel.classList.add("panel-active");
        _staggerCards(panel);
        panelObserver.unobserve(panel);
      });
    },
    { threshold: 0.12 },
  );

  panels.forEach((panel) => panelObserver.observe(panel));

  panels.forEach((panel) => {
    const mesh = panel.querySelector(".panel-mesh");
    if (!mesh) return;

    const isPro = panel.classList.contains("professional-panel");
    const rgb = isPro ? "0, 240, 255" : "255, 0, 170";

    panel.addEventListener("mousemove", (e) => {
      const rect = panel.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      mesh.style.background = `radial-gradient(circle at ${x}% ${y}%, rgba(${rgb}, 0.11) 0%, transparent 55%)`;
    });

    panel.addEventListener("mouseleave", () => {
      mesh.style.background = "";
    });
  });
}

function _staggerCards(panel) {
  panel.querySelectorAll(".social-card").forEach((card, i) => {
    setTimeout(() => card.classList.add("card-revealed"), i * 45);
  });
}
