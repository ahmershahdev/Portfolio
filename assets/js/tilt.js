export function applyTilt(el, {
  intensity = 20,
  scale = 1,
  translateZ = 0,
  perspective = 1000,
  useShine = false,
  breakpoint = 0,
  lerpFactor = 0.1,
  lenis = null,
} = {}) {
  let bounds = null;
  let centerX = 0, centerY = 0;
  let rafId = null;
  let targetX = 0, targetY = 0;
  let currentX = 0, currentY = 0;
  let currentScale = 1;
  let isHovering = false;

  const lerp = (a, b, t) => a + (b - a) * t;

  const updateBounds = () => {
    bounds = el.getBoundingClientRect();
    centerX = bounds.left + bounds.width / 2;
    centerY = bounds.top + bounds.height / 2;
  };

  const invalidateBounds = () => { bounds = null; };

  const handleMove = (e) => {
    if (window.innerWidth < breakpoint) return;
    if (!bounds) updateBounds();
    const x = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
    const y = e.clientY ?? e.touches?.[0]?.clientY ?? 0;
    targetX = (centerY - y) / intensity;
    targetY = (x - centerX) / intensity;
    if (useShine) {
      el.style.setProperty("--shine-x", `${((x - bounds.left) / bounds.width) * 100}%`);
      el.style.setProperty("--shine-y", `${((y - bounds.top) / bounds.height) * 100}%`);
    }
  };

  const loop = () => {
    const tX = isHovering ? targetX : 0;
    const tY = isHovering ? targetY : 0;
    const tScale = isHovering ? scale : 1;
    currentX = lerp(currentX, tX, lerpFactor);
    currentY = lerp(currentY, tY, lerpFactor);
    currentScale = lerp(currentScale, tScale, lerpFactor);
    el.style.transform = `perspective(${perspective}px) rotateX(${currentX}deg) rotateY(${currentY}deg) scale3d(${currentScale},${currentScale},${currentScale}) translateZ(${translateZ}px)`;
    const settled =
      !isHovering &&
      Math.abs(currentX) < 0.01 &&
      Math.abs(currentY) < 0.01 &&
      Math.abs(currentScale - 1) < 0.001;
    if (settled) {
      el.style.transform = `perspective(${perspective}px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1) translateZ(0px)`;
      el.style.willChange = "auto";
      rafId = null;
      return;
    }
    rafId = requestAnimationFrame(loop);
  };

  const handleEnter = () => {
    isHovering = true;
    el.style.willChange = "transform";
    updateBounds();
    if (!rafId) rafId = requestAnimationFrame(loop);
  };

  const handleLeave = () => {
    isHovering = false;
    targetX = 0;
    targetY = 0;
    if (useShine) {
      el.style.setProperty("--shine-x", "50%");
      el.style.setProperty("--shine-y", "50%");
    }
    if (!rafId) rafId = requestAnimationFrame(loop);
  };

  if (lenis) lenis.on("scroll", invalidateBounds);

  const onResize = () => { bounds = null; };
  window.addEventListener("resize", onResize, { passive: true });
  el.addEventListener("mouseenter", handleEnter, { passive: true });
  el.addEventListener("mousemove", handleMove, { passive: true });
  el.addEventListener("mouseleave", handleLeave);
  el.addEventListener("touchstart", handleEnter, { passive: true });
  el.addEventListener("touchmove", handleMove, { passive: true });
  el.addEventListener("touchend", handleLeave);
  el.addEventListener("touchcancel", handleLeave);

  return () => {
    if (lenis) lenis.off("scroll", invalidateBounds);
    window.removeEventListener("resize", onResize);
    el.removeEventListener("mouseenter", handleEnter);
    el.removeEventListener("mousemove", handleMove);
    el.removeEventListener("mouseleave", handleLeave);
    el.removeEventListener("touchstart", handleEnter);
    el.removeEventListener("touchmove", handleMove);
    el.removeEventListener("touchend", handleLeave);
    el.removeEventListener("touchcancel", handleLeave);
    if (rafId) cancelAnimationFrame(rafId);
  };
}