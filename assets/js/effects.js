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

  const ctx = canvas.getContext("2d", { alpha: true });
  const dots = Array.from({ length: 12 }, () => ({ x: 0, y: 0 }));
  const friction = 0.55;
  let visible = false;
  let pressed = false;
  let mouse = { x: 0, y: 0 };
  let lastBlink = 0;
  let blinking = false;

  window.addEventListener(
    "mousemove",
    (e) => {
      visible = true;
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    },
    { passive: true },
  );

  window.addEventListener("mousedown", () => (pressed = true), {
    passive: true,
  });
  window.addEventListener("mouseup", () => (pressed = false), {
    passive: true,
  });

  let resizeTimeout;
  function resize() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      const dpr = window.devicePixelRatio || 1;
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

    if (time - lastBlink > (blinking ? 120 : 2800)) {
      blinking = !blinking;
      lastBlink = time;
    }

    if (visible) {
      let tx = mouse.x;
      let ty = mouse.y;
      const len = dots.length;

      for (let i = 0; i < len; i++) {
        let d = dots[i];
        d.x += (tx - d.x) * friction;
        d.y += (ty - d.y) * friction;
        tx = d.x;
        ty = d.y;
      }

      for (let i = len - 1; i >= 0; i--) {
        const d = dots[i];
        const op = (1 - i / len) * 0.6;
        const s = (len - i) * 1.6;

        let col =
          i % 2 === 0 ? `rgba(15, 240, 252, ${op})` : `rgba(0, 255, 65, ${op})`;
        if (pressed) col = `rgba(255, 255, 255, ${op})`;

        ctx.shadowBlur = i === 0 ? 15 : 0;
        ctx.shadowColor = col;
        ctx.beginPath();
        ctx.fillStyle = col;
        ctx.arc(d.x, d.y, s, 0, Math.PI * 2);
        ctx.fill();

        if (i === 0) {
          ctx.shadowBlur = 0;
          ctx.fillStyle = "black";
          const es = s * 0.25;
          const eo = s * 0.35;

          if (!blinking) {
            ctx.beginPath();
            ctx.arc(d.x - eo, d.y - s * 0.1, es, 0, Math.PI * 2);
            ctx.arc(d.x + eo, d.y - s * 0.1, es, 0, Math.PI * 2);
            ctx.fill();
          } else {
            ctx.strokeStyle = "black";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(d.x - eo - es, d.y - s * 0.1);
            ctx.lineTo(d.x - eo + es, d.y - s * 0.1);
            ctx.moveTo(d.x + eo - es, d.y - s * 0.1);
            ctx.lineTo(d.x + eo + es, d.y - s * 0.1);
            ctx.stroke();
          }
        }
      }
    }
    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
}
