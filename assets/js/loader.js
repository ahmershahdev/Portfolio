const QUOTES = [
  "And I can fight only for something that I love, love only what I respect, and respect only what I at least know. — Ahmer Shah",
  "Anyone can deal with victory. Only the mighty can bear defeat.  ― Adolf Hitler",
  "Think Thousand times before taking a decision But - After taking decison never turn back even if you get Thousand difficulties! ― Adolf Hitler",
  "The victor will never be asked if he told the truth. -- Adolf Hitler",
  "Believing in progress does not mean believing that any progress has yet been made. -- Franz Kafka",
  "Everything you love is very likely to be lost, but in the end, love will return in a different way. — Franz Kafka",
  "I am free and that is why I am lost. — Franz Kafka",
  "Sleep is the most innocent creature and a sleepless man the most guilty. — Franz Kafka",
  "Youth is happy because it has the capacity to see beauty. Anyone who keeps the ability to see beauty never grows old. — Franz Kafka",
  "The cleverest of all, in my opinion, is the man who calls himself a fool at least once a month. — Fyodor Dostoevsky",
  "I say let the world go to hell, but I should always have my tea. — Fyodor Dostoevsky",
  "Happiness does not lie in happiness, but in the achievement of it. — Fyodor Dostoevsky",
  "Nothing in this world is harder than speaking the truth, nothing easier than flattery. — Fyodor Dostoevsky",
  "What is hell? I maintain that it is the suffering of being unable to love. — Fyodor Dostoevsky",
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

  const maxBeforeLoad = 97;
  const smoothStep = (current, target) => {
    const delta = target - current;
    if (delta <= 0) return current;
    return Math.min(current + Math.max(delta * 0.08, 0.03), target);
  };

  const tick = (now) => {
    if (finished) return;
    const elapsed = now - startTime;
    let target = 0;

    if (elapsed < 900) {
      target = (elapsed / 900) * 55;
    } else if (elapsed < 2000) {
      target = 55 + ((elapsed - 900) / 1100) * 25;
    } else if (elapsed < 3800) {
      target = 80 + ((elapsed - 2000) / 1800) * 15;
    } else {
      target = maxBeforeLoad;
    }

    target = Math.min(target, maxBeforeLoad);
    progress = smoothStep(progress, target);
    setProgress(progress);
    rafId = requestAnimationFrame(tick);
  };

  const finalizeToHundred = () => {
    const start = performance.now();
    const from = progress;
    const duration = 700;

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

  rafId = requestAnimationFrame(tick);

  const finish = () => {
    if (finished) return;
    finished = true;
    cancelAnimationFrame(rafId);
    finalizeToHundred();
  };

  const failsafe = setTimeout(finish, 5000);

  window.addEventListener(
    "load",
    () => {
      clearTimeout(failsafe);
      setTimeout(finish, 120);
    },
    { once: true },
  );
}
