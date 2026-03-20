export function initSocialHub() {
  const panels = document.querySelectorAll(".social-panel");
  if (!panels.length) return;

  const cleanups = [];

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

  const rectInvalidators = [];
  const onResize = () => rectInvalidators.forEach((fn) => fn());
  window.addEventListener("resize", onResize, { passive: true });

  panels.forEach((panel) => {
    panelObserver.observe(panel);

    const mesh = panel.querySelector(".panel-mesh");
    if (!mesh) return;

    const isPro = panel.classList.contains("professional-panel");
    const rgb = isPro ? "0, 240, 255" : "255, 0, 170";

    let rect = null;
    let rafId = null;
    let mx = 0, my = 0;

    const updateRect = () => (rect = panel.getBoundingClientRect());
    rectInvalidators.push(() => { rect = null; });

    const onMove = (e) => {
      if (!rect) updateRect();
      mx = e.clientX;
      my = e.clientY;
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        const x = ((mx - rect.left) / rect.width) * 100;
        const y = ((my - rect.top) / rect.height) * 100;
        mesh.style.background = `radial-gradient(circle at ${x}% ${y}%, rgba(${rgb}, 0.11) 0%, transparent 55%)`;
        rafId = null;
      });
    };

    const onEnter = () => { mesh.style.willChange = "background"; };

    const onLeave = () => {
      mesh.style.background = "";
      mesh.style.willChange = "auto";
      rect = null;
    };

    panel.addEventListener("mouseenter", onEnter, { passive: true });
    panel.addEventListener("mousemove", onMove, { passive: true });
    panel.addEventListener("mouseleave", onLeave);

    cleanups.push(() => {
      panel.removeEventListener("mouseenter", onEnter);
      panel.removeEventListener("mousemove", onMove);
      panel.removeEventListener("mouseleave", onLeave);
      if (rafId) cancelAnimationFrame(rafId);
    });
  });

  return () => {
    panelObserver.disconnect();
    window.removeEventListener("resize", onResize);
    cleanups.forEach((fn) => fn());
  };
}

function _staggerCards(panel) {
  panel.querySelectorAll(".social-card").forEach((card, i) => {
    setTimeout(() => card.classList.add("card-revealed"), i * 45);
  });
}