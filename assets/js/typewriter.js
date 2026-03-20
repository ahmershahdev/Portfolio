const professionPhrases = [
  "SWE Developer",
  "SWE Student",
  "Full-Stack Web Developer",
  "SQL Developer",
  "WordPress Developer",
  "PHP Developer",
  "Laravel Developer",
  "SEO",
];

export function typeWriterAnimation() {
  const el = document.getElementById("typewriter");
  if (!el) return;

  el.setAttribute("aria-live", "polite");
  el.setAttribute("aria-atomic", "true");

  let phraseIdx = 0;
  let charIdx = 0;
  let isDeleting = false;
  let commonPrefixLvl = 0;
  let timeoutId = null;

  const jitter = (base, range = 25) =>
    base + Math.floor(Math.random() * range - range / 2);

  function animate() {
    const current = professionPhrases[phraseIdx];
    el.textContent = current.substring(0, charIdx);

    let speed;

    if (!isDeleting) {
      if (charIdx < current.length) {
        charIdx++;
        speed = jitter(80);
      } else {
        const next = professionPhrases[(phraseIdx + 1) % professionPhrases.length];
        commonPrefixLvl = 0;
        while (
          commonPrefixLvl < current.length &&
          commonPrefixLvl < next.length &&
          current[commonPrefixLvl] === next[commonPrefixLvl]
        ) commonPrefixLvl++;

        isDeleting = true;
        speed = 1800;
      }
    } else {
      if (charIdx > commonPrefixLvl) {
        charIdx--;
        speed = jitter(40);
      } else {
        isDeleting = false;
        phraseIdx = (phraseIdx + 1) % professionPhrases.length;
        speed = 400;
      }
    }

    timeoutId = setTimeout(animate, speed);
  }

  animate();
  return () => clearTimeout(timeoutId);
}