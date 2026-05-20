export const TRAIL_LEN = 12;
export const MAX_PARTICLES = 8;

export const TRAIL_CYAN = [15, 240, 252];
export const TRAIL_GREEN = [0, 255, 65];
export const TRAIL_WHITE = [255, 255, 255];

const CURSOR_COLORS = {
  head: "rgb(15, 240, 252)",
  ring: "rgb(0, 255, 65)",
  pulse: "rgb(15, 240, 252)",
  pressed: "rgb(255, 255, 255)",
};

function parseRgbVar(styles, name, fallback) {
  const raw = styles.getPropertyValue(name).trim();
  if (!raw) return fallback;
  const parts = raw.split(/\s+/).map((value) => Number(value));
  if (parts.length < 3 || parts.some((val) => Number.isNaN(val)))
    return fallback;
  return parts.slice(0, 3);
}

export function refreshCursorColors() {
  if (typeof window === "undefined") return;
  const styles = getComputedStyle(document.documentElement);
  const cyan = parseRgbVar(styles, "--cursor-cyan", TRAIL_CYAN);
  const green = parseRgbVar(styles, "--cursor-green", TRAIL_GREEN);
  const white = parseRgbVar(styles, "--cursor-white", TRAIL_WHITE);

  TRAIL_CYAN[0] = cyan[0];
  TRAIL_CYAN[1] = cyan[1];
  TRAIL_CYAN[2] = cyan[2];

  TRAIL_GREEN[0] = green[0];
  TRAIL_GREEN[1] = green[1];
  TRAIL_GREEN[2] = green[2];

  TRAIL_WHITE[0] = white[0];
  TRAIL_WHITE[1] = white[1];
  TRAIL_WHITE[2] = white[2];

  CURSOR_COLORS.head = `rgb(${TRAIL_CYAN.join(", ")})`;
  CURSOR_COLORS.ring = `rgb(${TRAIL_GREEN.join(", ")})`;
  CURSOR_COLORS.pulse = CURSOR_COLORS.head;
  CURSOR_COLORS.pressed = `rgb(${TRAIL_WHITE.join(", ")})`;
}

export function getCursorColors() {
  return CURSOR_COLORS;
}
