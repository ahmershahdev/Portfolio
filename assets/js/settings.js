const STORAGE_KEY = "fxSettings";
const DEFAULTS = {
  disable3dModels: false,
  disable3dAnimations: false,
};

function normalizeSettings(input) {
  const safe = input && typeof input === "object" ? input : {};
  return {
    disable3dModels: Boolean(safe.disable3dModels),
    disable3dAnimations: Boolean(safe.disable3dAnimations),
  };
}

export function getFxSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULTS };
    const parsed = JSON.parse(raw);
    return { ...DEFAULTS, ...normalizeSettings(parsed) };
  } catch {
    return { ...DEFAULTS };
  }
}

function saveFxSettings(settings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // Ignore storage errors (privacy mode, disabled storage).
  }
}

export function applyFxSettings(settings) {
  const root = document.documentElement;
  root.classList.toggle("fx-disable-3d-models", settings.disable3dModels);
  root.classList.toggle(
    "fx-disable-3d-animations",
    settings.disable3dAnimations,
  );

  window.__fxSettings = settings;
  window.dispatchEvent(
    new CustomEvent("fxSettingsChange", { detail: settings }),
  );
}

export function initFxSettingsUI() {
  const settings = getFxSettings();
  applyFxSettings(settings);

  const modelsToggle = document.getElementById("toggle3dModels");
  const animationsToggle = document.getElementById("toggle3dAnimations");
  const settingsModal = document.getElementById("settingsModal");
  if (settingsModal && typeof bootstrap !== "undefined") {
    bootstrap.Modal.getOrCreateInstance(settingsModal);
  }

  if (modelsToggle) modelsToggle.checked = settings.disable3dModels;
  if (animationsToggle) animationsToggle.checked = settings.disable3dAnimations;

  const handleChange = () => {
    const next = {
      disable3dModels: Boolean(modelsToggle?.checked),
      disable3dAnimations: Boolean(animationsToggle?.checked),
    };
    saveFxSettings(next);
    applyFxSettings(next);
  };

  modelsToggle?.addEventListener("change", handleChange);
  animationsToggle?.addEventListener("change", handleChange);

  const modalTriggers = document.querySelectorAll("[data-settings-trigger]");
  if (settingsModal && modalTriggers.length) {
    if (settingsModal.dataset.modalBound) return settings;
    settingsModal.dataset.modalBound = "true";

    const showModal = () => {
      if (typeof bootstrap === "undefined") return;
      const modalInstance = bootstrap.Modal.getOrCreateInstance(settingsModal);
      modalInstance.show();
    };

    modalTriggers.forEach((trigger) => {
      trigger.addEventListener("click", (event) => {
        event.preventDefault();
        showModal();
      });
    });
  }

  return settings;
}
