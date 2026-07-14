// no-loader-init.js
// For pages that intentionally omit #loader-wrapper (no loading screen).
// script.js still listens for the "loaderComplete" event to reveal <main>,
// start the nav/effects/animations, and lazy-load the 3D background.
// Since loader.js's initializeLoader() no-ops when #loader-wrapper is
// missing, that event never fires on its own — so we dispatch it here.
//
// Must be loaded AFTER script.js (module scripts execute in document
// order), so script.js's "loaderComplete" listener is already registered
// by the time this fires.
window.addEventListener("DOMContentLoaded", () => {
  window.dispatchEvent(new CustomEvent("loaderComplete"));
});
