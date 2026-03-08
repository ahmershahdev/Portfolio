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

  canvas.style.pointerEvents = "none";
  canvas.style.position = "fixed";
  canvas.style.top = "0";
  canvas.style.left = "0";
  canvas.style.zIndex = "9999";

  const ctx = canvas.getContext("2d", { alpha: true, desynchronized: true });

  const dotsX = new Float32Array(TRAIL_LEN).fill(-200);
  const dotsY = new Float32Array(TRAIL_LEN).fill(-200);
  const particles = [];

  let visible = false;
  let pressed = false;
  let mouseX = 0,
    mouseY = 0;
  let prevX = 0,
    prevY = 0;
  let speed = 0;
  let lastMoveTime = 0;

  window.addEventListener(
    "mousemove",
    (e) => {
      visible = true;
      prevX = mouseX;
      prevY = mouseY;
      mouseX = e.clientX;
      mouseY = e.clientY;
      const dx = mouseX - prevX,
        dy = mouseY - prevY;
      speed = Math.sqrt(dx * dx + dy * dy);
      lastMoveTime = performance.now();
    },
    { passive: true },
  );

  window.addEventListener(
    "mousedown",
    () => {
      pressed = true;
      spawnParticles(particles, mouseX, mouseY);
    },
    { passive: true },
  );

  window.addEventListener("mouseup", () => (pressed = false), {
    passive: true,
  });

  let resizeTimeout;
  function resize() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.scale(dpr, dpr);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
    }, 100);
  }

  window.addEventListener("resize", resize, { passive: true });
  resize();

  function render(time) {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    if (!visible) {
      requestAnimationFrame(render);
      return;
    }

    const idle = time - lastMoveTime > 1800;
    const baseFriction = idle ? 0.25 : pressed ? 0.72 : 0.78;

    updateTrail(dotsX, dotsY, mouseX, mouseY, baseFriction);
    drawTrail(ctx, dotsX, dotsY, pressed);
    updateAndDrawParticles(ctx, particles);

    // Use raw mouse position for cursor head so it never lags
    const hx = mouseX;
    const hy = mouseY;
    const headCol = pressed ? "#ffffff" : "#0ff0fc";

    drawGlow(ctx, hx, hy, 14, headCol, 0.55);

    const idleWave = idle ? Math.sin(time * 0.003) * 3 : 0;
    const arm = pressed ? 16 : 14 + idleWave;
    drawCrosshair(ctx, hx, hy, arm, 4, headCol);

    ctx.fillStyle = headCol;
    ctx.beginPath();
    ctx.arc(hx, hy, pressed ? 3.5 : 2.5, 0, Math.PI * 2);
    ctx.fill();

    const ringR = pressed
      ? 6
      : idle
        ? 11 + Math.sin(time * 0.004) * 4
        : 9 + Math.min(speed * 0.3, 8);
    drawRing(
      ctx,
      hx,
      hy,
      ringR,
      pressed ? "#ffffff" : "#00ff41",
      pressed ? 0.9 : 0.55,
      pressed ? null : [4, 3],
    );

    if (idle) {
      drawRing(
        ctx,
        hx,
        hy,
        18 + Math.sin(time * 0.002) * 4,
        "#0ff0fc",
        0.15 + Math.sin(time * 0.003) * 0.06,
        [2, 5],
      );
    }

    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
}
