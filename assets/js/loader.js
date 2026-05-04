const QUOTES = [
  "And I can fight only for something that I love, love only what I respect, and respect only what I at least know. — Ahmer Shah",
  "The work is an enclosure. — Ahmer Shah",
];

const getEl = (id) => document.getElementById(id);

export function initializeLoader() {
  const wrapper = getEl("loader-wrapper");
  if (!wrapper) return;

  const bar = getEl("loading-bar");
  const percent = getEl("load-percent");
  const percentMini = getEl("load-percent-mini");
  const quote = getEl("dynamic-quote");

  document.documentElement.style.overflow = "hidden";
  document.documentElement.style.scrollbarWidth = "none";

  if (quote)
    quote.textContent = QUOTES[Math.floor(Math.random() * QUOTES.length)];

  const startTime = performance.now();
  let progress = 0;
  let finished = false;
  let rafId = 0;

  const setProgress = (val) => {
    progress = Math.min(val, 100);
    if (bar) bar.style.width = `${progress}%`;
    if (percent) percent.textContent = `${Math.floor(progress)}%`;
    if (percentMini) percentMini.textContent = `${Math.floor(progress)}%`;
    if (bar) bar.setAttribute("aria-valuenow", String(Math.floor(progress)));
  };

  const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

  const runRamp = (duration, cap) => {
    const start = performance.now();
    const tick = (now) => {
      if (finished) return;
      const t = Math.min((now - start) / duration, 1);
      const target = cap * easeOutCubic(t);
      if (target > progress) setProgress(target);
      if (t < 1) rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
  };

  const finalizeToHundred = () => {
    const start = performance.now();
    const from = progress;
    const duration = 900;

    const tick = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const target = from + (100 - from) * easeOutCubic(t);
      setProgress(target);
      if (t < 1) {
        requestAnimationFrame(tick);
        return;
      }

      wrapper.classList.add("loader-hidden");

      const cleanup = () => {
        wrapper.style.display = "none";
        document.documentElement.style.overflow = "";
        document.documentElement.style.scrollbarWidth = "";
        window.dispatchEvent(new CustomEvent("loaderComplete"));
      };

      wrapper.addEventListener("transitionend", cleanup, { once: true });
      setTimeout(cleanup, 450);
    };

    requestAnimationFrame(tick);
  };

  runRamp(2600, 92);

  const finish = () => {
    if (finished) return;
    finished = true;
    cancelAnimationFrame(rafId);
    finalizeToHundred();
  };

  const failsafe = setTimeout(finish, 3000);

  window.addEventListener(
    "load",
    () => {
      clearTimeout(failsafe);
      const elapsed = performance.now() - startTime;
      const remaining = Math.max(900 - elapsed, 120);
      setTimeout(finish, remaining);
    },
    { once: true },
  );
}
