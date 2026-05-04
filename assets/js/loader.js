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

  const startTime = Date.now();
  let progress = 0;
  let finished = false;

  const setProgress = (val) => {
    progress = Math.min(val, 100);
    if (bar) bar.style.width = `${progress}%`;
    if (percent) percent.textContent = `${Math.floor(progress)}%`;
    if (percentMini) percentMini.textContent = `${Math.floor(progress)}%`;
    if (bar) bar.setAttribute("aria-valuenow", String(Math.floor(progress)));
  };

  const interval = setInterval(() => {
    if (progress >= 96) {
      clearInterval(interval);
      return;
    }
    setProgress(progress + 1);
  }, 35);

  const finalizeToHundred = () => {
    const finalInterval = setInterval(() => {
      if (progress >= 100) {
        clearInterval(finalInterval);
        wrapper.classList.add("loader-hidden");

        const cleanup = () => {
          wrapper.style.display = "none";
          document.documentElement.style.overflow = "";
          document.documentElement.style.scrollbarWidth = "";
          window.dispatchEvent(new CustomEvent("loaderComplete"));
        };

        wrapper.addEventListener("transitionend", cleanup, { once: true });
        setTimeout(cleanup, 450);
        return;
      }
      setProgress(progress + 1);
    }, 18);
  };

  const finish = () => {
    if (finished) return;
    finished = true;
    clearInterval(interval);
    finalizeToHundred();
  };

  const failsafe = setTimeout(finish, 3000);

  window.addEventListener(
    "load",
    () => {
      clearTimeout(failsafe);
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(900 - elapsed, 120);
      setTimeout(finish, remaining);
    },
    { once: true },
  );
}
