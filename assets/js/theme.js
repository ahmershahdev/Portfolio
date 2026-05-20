const STORAGE_KEY = "themePreference";
const THEME_LIGHT = "light";
const THEME_DARK = "dark";
const COOLDOWN_MS = 3000;
const TRANSITION_MS = 1200;
const TRANSITION_CLASS = "theme-transition";

const root = document.documentElement;
const toggle = document.getElementById("themeToggle");
const themeMeta = document.querySelector('meta[name="theme-color"]');

function getStoredTheme() {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function setStoredTheme(theme) {
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // Ignore storage errors (privacy mode, disabled storage).
  }
}

function getSystemTheme() {
  if (
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: light)").matches
  )
    return THEME_LIGHT;
  return THEME_DARK;
}

function updateToggle(theme) {
  if (!toggle) return;
  const isLight = theme === THEME_LIGHT;
  toggle.setAttribute("aria-pressed", String(isLight));
  toggle.setAttribute(
    "aria-label",
    isLight ? "Switch to dark mode" : "Switch to light mode",
  );
  const icon = toggle.querySelector("i");
  if (icon)
    icon.className = isLight ? "bi bi-moon-stars-fill" : "bi bi-sun-fill";
}

function updateThemeColor(theme) {
  if (!themeMeta) return;
  themeMeta.setAttribute(
    "content",
    theme === THEME_LIGHT ? "#0b1b4d" : "#000000",
  );
}

function applyTheme(theme, persist) {
  root.dataset.theme = theme;
  updateToggle(theme);
  updateThemeColor(theme);
  if (persist) setStoredTheme(theme);
  window.dispatchEvent(new CustomEvent("themeChange", { detail: { theme } }));
}

export function initThemeToggle() {
  const stored = getStoredTheme();
  const initial =
    stored === THEME_LIGHT || stored === THEME_DARK ? stored : getSystemTheme();
  applyTheme(initial, false);

  if (toggle) {
    toggle.addEventListener("click", () => {
      if (toggle.disabled) return;
      toggle.disabled = true;
      toggle.setAttribute("aria-disabled", "true");
      root.classList.add(TRANSITION_CLASS);
      const next =
        root.dataset.theme === THEME_LIGHT ? THEME_DARK : THEME_LIGHT;
      applyTheme(next, true);
      setTimeout(() => {
        root.classList.remove(TRANSITION_CLASS);
      }, TRANSITION_MS);
      setTimeout(() => {
        toggle.disabled = false;
        toggle.setAttribute("aria-disabled", "false");
      }, COOLDOWN_MS);
    });
  }

  if (!stored && window.matchMedia) {
    const media = window.matchMedia("(prefers-color-scheme: light)");
    const handleChange = (event) => {
      if (getStoredTheme()) return;
      applyTheme(event.matches ? THEME_LIGHT : THEME_DARK, false);
    };
    if (typeof media.addEventListener === "function")
      media.addEventListener("change", handleChange);
    else if (typeof media.addListener === "function")
      media.addListener(handleChange);
  }
}
