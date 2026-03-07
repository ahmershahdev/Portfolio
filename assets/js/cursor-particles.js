import { MAX_PARTICLES } from "./cursor-config.js";

export function spawnParticles(particles, x, y) {
  const count = Math.min(10, MAX_PARTICLES - particles.length);
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.4;
    const vel = 2 + Math.random() * 4;
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * vel,
      vy: Math.sin(angle) * vel,
      life: 1,
      decay: 0.04 + Math.random() * 0.03,
      size: 1.5 + Math.random() * 2.5,
      col: Math.random() > 0.5 ? "rgba(15,240,252," : "rgba(0,255,65,",
    });
  }
}

export function updateAndDrawParticles(ctx, particles) {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vx *= 0.9;
    p.vy *= 0.9;
    p.life -= p.decay;
    if (p.life <= 0) {
      particles.splice(i, 1);
      continue;
    }
    ctx.globalAlpha = p.life;
    ctx.fillStyle = p.col + p.life.toFixed(2) + ")";
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}
