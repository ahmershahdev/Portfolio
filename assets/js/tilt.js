export function applyTilt(
  el,
  {
    intensity = 20,
    scale = 1,
    translateZ = 0,
    perspective = 1000,
    useShine = false,
    breakpoint = 0,
  },
) {
  let bounds = null;
  let rafId = null;

  const updateBounds = () => (bounds = el.getBoundingClientRect());

  const handleMove = (e) => {
    if (window.innerWidth < breakpoint) return;
    if (!bounds) updateBounds();

    const x = e.clientX || (e.touches ? e.touches[0].clientX : 0);
    const y = e.clientY || (e.touches ? e.touches[0].clientY : 0);

    if (rafId) cancelAnimationFrame(rafId);

    rafId = requestAnimationFrame(() => {
      const centerX = bounds.left + bounds.width / 2;
      const centerY = bounds.top + bounds.height / 2;
      const rotateX = (centerY - y) / intensity;
      const rotateY = (x - centerX) / intensity;

      el.style.transform = `perspective(${perspective}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(${scale},${scale},${scale}) translateZ(${translateZ}px)`;

      if (useShine) {
        el.style.setProperty(
          "--shine-x",
          `${((x - bounds.left) / bounds.width) * 100}%`,
        );
        el.style.setProperty(
          "--shine-y",
          `${((y - bounds.top) / bounds.height) * 100}%`,
        );
      }
    });
  };

  const reset = () => {
    if (rafId) cancelAnimationFrame(rafId);
    el.style.transform = `perspective(${perspective}px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1) translateZ(0px)`;
    if (useShine) {
      el.style.setProperty("--shine-x", "50%");
      el.style.setProperty("--shine-y", "50%");
    }
  };

  el.addEventListener("mouseenter", updateBounds, { passive: true });
  el.addEventListener("mousemove", handleMove, { passive: true });
  el.addEventListener("mouseleave", reset);

  el.addEventListener("touchstart", updateBounds, { passive: true });
  el.addEventListener("touchmove", handleMove, { passive: true });
  el.addEventListener("touchend", reset);
}
