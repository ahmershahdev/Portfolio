export function initializeEffects() {
  initializeCustomCursor();

  document
    .querySelectorAll(".skill-item")
    .forEach((el) => applyTilt(el, { intensity: 15, scale: 1.02 }));
  document
    .querySelectorAll(".timeline-item")
    .forEach((el) =>
      applyTilt(el, { intensity: 12, translateZ: 40, perspective: 1500 }),
    );

  const aboutBox = document.querySelector("#about .neon-border");
  if (aboutBox)
    applyTilt(aboutBox, { intensity: 20, useShine: true, breakpoint: 992 });
}

function applyTilt(
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

function initializeCustomCursor() {
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
  const TRAIL_LEN = 24;

  const dotsX = new Float32Array(TRAIL_LEN).fill(-200);
  const dotsY = new Float32Array(TRAIL_LEN).fill(-200);
  const particles = [];
  const MAX_PARTICLES = 20;

  let visible = false;
  let pressed = false;
  let mouseX = 0,
    mouseY = 0;
  let prevX = 0,
    prevY = 0;
  let speed = 0;
  let lastMoveTime = 0;

  const TRAIL_CYAN = [15, 240, 252];
  const TRAIL_GREEN = [0, 255, 65];
  const TRAIL_WHITE = [255, 255, 255];

  function trailColor(t, alpha) {
    let r, g, b;
    if (pressed) {
      [r, g, b] = TRAIL_WHITE;
    } else if (t < 0.4) {
      const f = t / 0.4;
      r = Math.round(TRAIL_CYAN[0] * (1 - f) + TRAIL_GREEN[0] * f);
      g = Math.round(TRAIL_CYAN[1] * (1 - f) + TRAIL_GREEN[1] * f);
      b = Math.round(TRAIL_CYAN[2] * (1 - f) + TRAIL_GREEN[2] * f);
    } else {
      const f = (t - 0.4) / 0.6;
      r = 0;
      g = Math.round(TRAIL_GREEN[1] * (1 - f));
      b = 0;
      alpha *= 1 - f;
    }
    return `rgba(${r},${g},${b},${alpha.toFixed(2)})`;
  }

  function spawnParticles(x, y) {
    const count = Math.min(10, MAX_PARTICLES - particles.length);
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.4;
      const vel = 2 + Math.random() * 4;
      particles.push({
        x,
        y,
        vx: Math.cos(angle) * vel,
        vy: Math.sin(angle) * vel,
        life: 1,
        decay: 0.04 + Math.random() * 0.03,
        size: 1.5 + Math.random() * 2.5,
        col: Math.random() > 0.5 ? "rgba(15,240,252," : "rgba(0,255,65,",
      });
    }
  }

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
      spawnParticles(mouseX, mouseY);
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

  function drawGlow(x, y, r, col, alpha) {
    ctx.globalAlpha = alpha * 0.35;
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.arc(x, y, r * 2.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  function drawCrosshair(x, y, arm, gap, col) {
    ctx.strokeStyle = col;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(x, y - gap);
    ctx.lineTo(x, y - arm);
    ctx.moveTo(x, y + gap);
    ctx.lineTo(x, y + arm);
    ctx.moveTo(x - gap, y);
    ctx.lineTo(x - arm, y);
    ctx.moveTo(x + gap, y);
    ctx.lineTo(x + arm, y);
    ctx.stroke();
  }

  function drawRing(x, y, r, col, alpha, dash) {
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = col;
    ctx.lineWidth = 1.5;
    if (dash) ctx.setLineDash(dash);
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.stroke();
    if (dash) ctx.setLineDash([]);
    ctx.globalAlpha = 1;
  }

  function render(time) {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    if (!visible) {
      requestAnimationFrame(render);
      return;
    }

    const idle = time - lastMoveTime > 1800;

    const baseFriction = idle ? 0.25 : pressed ? 0.6 : 0.65;

    let tx = mouseX,
      ty = mouseY;
    for (let i = 0; i < TRAIL_LEN; i++) {
      const f = baseFriction * (1 - i / (TRAIL_LEN * 1.8));
      dotsX[i] += (tx - dotsX[i]) * f;
      dotsY[i] += (ty - dotsY[i]) * f;
      tx = dotsX[i];
      ty = dotsY[i];
    }

    for (let i = TRAIL_LEN - 1; i >= 1; i--) {
      const t = i / TRAIL_LEN;
      const alpha = (1 - t) * 0.75;
      const radius = Math.max(0.5, (TRAIL_LEN - i) * 0.7 * (pressed ? 1.3 : 1));
      ctx.fillStyle = trailColor(t, alpha);
      ctx.beginPath();
      ctx.arc(dotsX[i], dotsY[i], radius, 0, Math.PI * 2);
      ctx.fill();
    }

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.9;
      p.vy *= 0.9;
      p.life -= p.decay;
      if (p.life <= 0) {
        particles.splice(i, 1);
        continue;
      }
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.col + p.life.toFixed(2) + ")";
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    const hx = dotsX[0],
      hy = dotsY[0];
    const headCol = pressed ? "#ffffff" : "#0ff0fc";

    drawGlow(hx, hy, 14, headCol, 0.55);

    const idleWave = idle ? Math.sin(time * 0.003) * 3 : 0;
    const arm = pressed ? 16 : 14 + idleWave;
    drawCrosshair(hx, hy, arm, 4, headCol);

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
      hx,
      hy,
      ringR,
      pressed ? "#ffffff" : "#00ff41",
      pressed ? 0.9 : 0.55,
      pressed ? null : [4, 3],
    );

    if (idle) {
      drawRing(
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
