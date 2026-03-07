import {
  TRAIL_LEN,
  TRAIL_CYAN,
  TRAIL_GREEN,
  TRAIL_WHITE,
} from "./cursor-config.js";

export function trailColor(t, alpha, pressed) {
  let r, g, b;
  if (pressed) {
    [r, g, b] = TRAIL_WHITE;
  } else if (t < 0.4) {
    const f = t / 0.4;
    r = Math.round(TRAIL_CYAN[0] * (1 - f) + TRAIL_GREEN[0] * f);
    g = Math.round(TRAIL_CYAN[1] * (1 - f) + TRAIL_GREEN[1] * f);
    b = Math.round(TRAIL_CYAN[2] * (1 - f) + TRAIL_GREEN[2] * f);
  } else {
    const f = (t - 0.4) / 0.6;
    r = 0;
    g = Math.round(TRAIL_GREEN[1] * (1 - f));
    b = 0;
    alpha *= 1 - f;
  }
  return `rgba(${r},${g},${b},${alpha.toFixed(2)})`;
}

export function updateTrail(dotsX, dotsY, mouseX, mouseY, baseFriction) {
  let tx = mouseX,
    ty = mouseY;
  for (let i = 0; i < TRAIL_LEN; i++) {
    const f = baseFriction * (1 - i / (TRAIL_LEN * 1.8));
    dotsX[i] += (tx - dotsX[i]) * f;
    dotsY[i] += (ty - dotsY[i]) * f;
    tx = dotsX[i];
    ty = dotsY[i];
  }
}

export function drawTrail(ctx, dotsX, dotsY, pressed) {
  for (let i = TRAIL_LEN - 1; i >= 1; i--) {
    const t = i / TRAIL_LEN;
    const alpha = (1 - t) * 0.75;
    const radius = Math.max(0.5, (TRAIL_LEN - i) * 0.7 * (pressed ? 1.3 : 1));
    ctx.fillStyle = trailColor(t, alpha, pressed);
    ctx.beginPath();
    ctx.arc(dotsX[i], dotsY[i], radius, 0, Math.PI * 2);
    ctx.fill();
  }
}
