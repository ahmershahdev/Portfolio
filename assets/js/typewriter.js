const professionPhrases = [
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

  let phraseIdx = 0,
    charIdx = 0,
    isDeleting = false;

  function animate() {
    const current = professionPhrases[phraseIdx];
    el.textContent = current.substring(0, isDeleting ? charIdx-- : charIdx++);

    let speed = isDeleting ? 40 : 80;
    if (!isDeleting && charIdx > current.length) {
      isDeleting = true;
      speed = 2000;
    } else if (isDeleting && charIdx < 0) {
      isDeleting = false;
      phraseIdx = (phraseIdx + 1) % professionPhrases.length;
      charIdx = 0;
      speed = 500;
    }
    setTimeout(animate, speed);
  }
  animate();
}
