import { TRAIL_LEN } from "./cursor-config.js";
import { updateTrail, drawTrail } from "./cursor-trail.js";
import { spawnParticles, updateAndDrawParticles } from "./cursor-particles.js";
import { drawGlow, drawCrosshair, drawRing } from "./cursor-draw.js";

export function initializeCustomCursor() {
  const canvas = document.getElementById("cursor-canvas");
  if (!canvas || "ontouchstart" in window || navigator.maxTouchPoints > 0) {
    if (canvas) canvas.style.display = "none";
    return;
  }

  Object.assign(canvas.style, {
    pointerEvents: "none",
    position: "fixed",
    top: "0",
    left: "0",
    zIndex: "9999",
  });

  const ctx = canvas.getContext("2d", { alpha: true, desynchronized: true });

  const dotsX = new Float32Array(TRAIL_LEN).fill(-200);
  const dotsY = new Float32Array(TRAIL_LEN).fill(-200);
  const particles = [];

  let visible = false;
  let pressed = false;
  let mouseX = 0, mouseY = 0;
  let prevX = 0, prevY = 0;
  let renderX = -200, renderY = -200;
  let speed = 0;
  let lastMoveTime = 0;
  let dpr = 1, w = 0, h = 0;

  function setSize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  const ro = new ResizeObserver(setSize);
  ro.observe(document.documentElement);
  setSize();

  window.addEventListener("mousemove", (e) => {
    visible = true;
    prevX = mouseX;
    prevY = mouseY;
    mouseX = e.clientX;
    mouseY = e.clientY;
    const dx = mouseX - prevX, dy = mouseY - prevY;
    speed = Math.sqrt(dx * dx + dy * dy);
    lastMoveTime = performance.now();
  }, { passive: true });

  window.addEventListener("mousedown", () => {
    pressed = true;
    spawnParticles(particles, mouseX, mouseY);
  }, { passive: true });

  window.addEventListener("mouseup", () => (pressed = false), { passive: true });

  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => 1 - Math.pow(1 - t, 3),
    smoothWheel: true,
  });

  function render(time) {
    lenis.raf(time);
    ctx.clearRect(0, 0, w, h);

    if (!visible) {
      requestAnimationFrame(render);
      return;
    }

    const idle = time - lastMoveTime > 1800;
    const lerp = idle ? 0.08 : pressed ? 0.28 : 0.16;

    renderX += (mouseX - renderX) * lerp;
    renderY += (mouseY - renderY) * lerp;

    const baseFriction = idle ? 0.25 : pressed ? 0.72 : 0.78;

    updateTrail(dotsX, dotsY, renderX, renderY, baseFriction);
    drawTrail(ctx, dotsX, dotsY, pressed);
    updateAndDrawParticles(ctx, particles);

    const headCol = pressed ? "#ffffff" : "#0ff0fc";

    drawGlow(ctx, renderX, renderY, 14, headCol, 0.55);
    drawCrosshair(ctx, renderX, renderY, pressed ? 16 : 14 + (idle ? Math.sin(time * 0.003) * 3 : 0), 4, headCol);

    ctx.save();
    ctx.fillStyle = headCol;
    ctx.beginPath();
    ctx.arc(renderX, renderY, pressed ? 3.5 : 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    drawRing(
      ctx, renderX, renderY,
      pressed ? 6 : idle ? 11 + Math.sin(time * 0.004) * 4 : 9 + Math.min(speed * 0.3, 8),
      pressed ? "#ffffff" : "#00ff41",
      pressed ? 0.9 : 0.55,
      pressed ? null : [4, 3]
    );

    if (idle) {
      drawRing(
        ctx, renderX, renderY,
        18 + Math.sin(time * 0.002) * 4,
        "#0ff0fc",
        0.15 + Math.sin(time * 0.003) * 0.06,
        [2, 5]
      );
    }

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
}