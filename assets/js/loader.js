const QUOTES = [
  "A cage went in search of a bird. — Franz Kafka",
  "Man is sometimes extraordinarily, passionately, in love with suffering. — Fyodor Dostoevsky",
  "He who has a why to live can bear almost any how. — Friedrich Nietzsche",
  "It is better to be feared than loved, if one cannot be both. — Niccolò Machiavelli",
];

const getEl = (id) => document.getElementById(id);

export function initializeLoader() {
  const wrapper = getEl("loader-wrapper");
  if (!wrapper) return;

  const bar = getEl("loading-bar");
  const percent = getEl("load-percent");
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
  };

  const interval = setInterval(() => {
    const next = Math.min(progress + Math.random() * 12, 96);
    setProgress(next);
    if (progress >= 96) clearInterval(interval);
  }, 90);

  const finish = () => {
    if (finished) return;
    finished = true;
    clearInterval(interval);
    setProgress(100);

    setTimeout(() => {
      wrapper.classList.add("loader-hidden");

      const cleanup = () => {
        wrapper.style.display = "none";
        document.documentElement.style.overflow = "";
        document.documentElement.style.scrollbarWidth = "";
        window.dispatchEvent(new CustomEvent("loaderComplete"));
      };

      wrapper.addEventListener("transitionend", cleanup, { once: true });
      setTimeout(cleanup, 450);
    }, 300);
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
