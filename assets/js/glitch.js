export function initializeGlitchText() {
  const glowingTextElement = document.querySelector(".glowing-text");
  const neonBorderElement =
    document.querySelector(".hero-orbit-scene") ||
    document.querySelector(".neon-border");

  if (glowingTextElement && neonBorderElement) {
    const originalText = glowingTextElement.textContent;
    const glitchCharacters = "!<>-_\\/[]{}—=+*^?________";
    let glitchAnimationId = null;

    neonBorderElement.addEventListener("mouseenter", () => {
      if (glitchAnimationId) cancelAnimationFrame(glitchAnimationId);
      const animationStart = performance.now();

      function updateGlitch(currentTime) {
        const iteration = (currentTime - animationStart) / 50;
        glowingTextElement.textContent = originalText
          .split("")
          .map((character, index) => {
            return index < iteration
              ? character
              : glitchCharacters[
                  Math.floor(Math.random() * glitchCharacters.length)
                ];
          })
          .join("");

        if (iteration < originalText.length) {
          glitchAnimationId = requestAnimationFrame(updateGlitch);
        } else {
          glowingTextElement.textContent = originalText;
        }
      }

      glitchAnimationId = requestAnimationFrame(updateGlitch);
    });
  }
}
