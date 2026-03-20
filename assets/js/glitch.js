export function initializeGlitchText() {
  const glowingText = document.querySelector(".glowing-text");
  const trigger =
    document.querySelector(".hero-orbit-scene") ??
    document.querySelector(".neon-border");

  if (!glowingText || !trigger) return;

  const original = glowingText.textContent;
  const CHARS = "█▓▒░⣿⢿⡿01<>[]{}—=+*#@$%";
  const DURATION = 40;
  const PASSES = 3;

  let rafId = null;
  let active = false;
  let t0 = null;
  let charFilter = null;

  const rand = () => CHARS[Math.floor(Math.random() * CHARS.length)];

  const isInAtoR = (c) => {
    const l = c.toLowerCase();
    return l >= "a" && l <= "r";
  };

  function animate(timestamp) {
    const elapsed = timestamp - t0;
    const progress = Math.min(elapsed / DURATION, original.length + PASSES);

    glowingText.textContent = original
      .split("")
      .map((c, i) => {
        if (c === " ") return " ";
        if (charFilter && !charFilter(c)) return c;
        return progress >= i + PASSES ? c : rand();
      })
      .join("");

    if (progress < original.length + PASSES) {
      rafId = requestAnimationFrame(animate);
    } else {
      glowingText.textContent = original;
      active = false;
      charFilter = null;
    }
  }

  function start(force = false, filter = null) {
    if (active && !force) return;
    cancelAnimationFrame(rafId);
    charFilter = filter;
    active = true;
    rafId = requestAnimationFrame((timestamp) => {
      t0 = timestamp;
      animate(timestamp);
    });
  }

  function stop() {
    if (!active) return;
    cancelAnimationFrame(rafId);
    glowingText.textContent = original;
    active = false;
    charFilter = null;
  }

  const onEnter = () => start();
  const onLeave = stop;
  const onClick = () => start(true);
  const onKeyDown = (e) => {
    if (e.target !== document.body) return;
    start(true, isInAtoR);
  };

  trigger.addEventListener("mouseenter", onEnter);
  trigger.addEventListener("mouseleave", onLeave);
  trigger.addEventListener("click", onClick);
  window.addEventListener("keydown", onKeyDown);

  return function destroy() {
    cancelAnimationFrame(rafId);
    trigger.removeEventListener("mouseenter", onEnter);
    trigger.removeEventListener("mouseleave", onLeave);
    trigger.removeEventListener("click", onClick);
    window.removeEventListener("keydown", onKeyDown);
    glowingText.textContent = original;
  };
}