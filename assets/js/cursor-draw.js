export function drawGlow(ctx, x, y, r, col, alpha) {
  ctx.globalAlpha = alpha * 0.35;
  ctx.fillStyle = col;
  ctx.beginPath();
  ctx.arc(x, y, r * 2.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
}

export function drawCrosshair(ctx, x, y, arm, gap, col) {
  ctx.strokeStyle = col;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(x, y - gap);
  ctx.lineTo(x, y - arm);
  ctx.moveTo(x, y + gap);
  ctx.lineTo(x, y + arm);
  ctx.moveTo(x - gap, y);
  ctx.lineTo(x - arm, y);
  ctx.moveTo(x + gap, y);
  ctx.lineTo(x + arm, y);
  ctx.stroke();
}

export function drawRing(ctx, x, y, r, col, alpha, dash) {
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = col;
  ctx.lineWidth = 1.5;
  if (dash) ctx.setLineDash(dash);
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.stroke();
  if (dash) ctx.setLineDash([]);
  ctx.globalAlpha = 1;
}
