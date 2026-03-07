const philosophicalQuotes = [
  "A cage went in search of a bird. — Franz Kafka",
  "Man is sometimes extraordinarily, passionately, in love with suffering. — Fyodor Dostoevsky",
  "He who has a why to live can bear almost any how. — Friedrich Nietzsche",
  "It is better to be feared than loved, if one cannot be both. — Niccolò Machiavelli",
];

export function initializeLoader() {
  const els = {
    bar: document.getElementById("loading-bar"),
    percent: document.getElementById("load-percent"),
    quote: document.getElementById("dynamic-quote"),
    wrapper: document.getElementById("loader-wrapper"),
  };

  if (!els.wrapper) return;

  document.documentElement.style.overflow = "hidden";
  document.documentElement.style.scrollbarWidth = "none";

  if (els.quote) {
    els.quote.textContent =
      philosophicalQuotes[
        Math.floor(Math.random() * philosophicalQuotes.length)
      ];
  }

  let progress = 0;
  let isFinished = false;

  const interval = setInterval(() => {
    if (progress >= 90) return clearInterval(interval);
    progress += Math.random() * 3;
    updateUI(Math.min(progress, 90));
  }, 80);

  function updateUI(val) {
    requestAnimationFrame(() => {
      if (els.bar) els.bar.style.width = `${val}%`;
      if (els.percent) els.percent.textContent = `${Math.floor(val)}%`;
    });
  }

  const finish = () => {
    if (isFinished) return;
    isFinished = true;
    clearInterval(interval);

    updateUI(100);

    setTimeout(() => {
      els.wrapper.classList.add("loader-hidden");

      let scrollRestored = false;
      const restoreScroll = () => {
        if (scrollRestored) return;
        scrollRestored = true;
        els.wrapper.style.display = "none";
        document.documentElement.style.overflow = "";
        document.documentElement.style.scrollbarWidth = "";
        window.dispatchEvent(new CustomEvent("loaderComplete"));
      };

      els.wrapper.addEventListener("transitionend", restoreScroll, {
        once: true,
      });
      setTimeout(restoreScroll, 700);
    }, 300);
  };

  const failsafe = setTimeout(finish, 4000);

  window.addEventListener("load", () => {
    clearTimeout(failsafe);
    setTimeout(finish, 400);
  });
}
