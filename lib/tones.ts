import type { Tone } from "./types";

/** 3-stop gradient color sets per tone (matches styles.css .ph-* + prototype gradSrc). */
export const TONE_GRADIENT: Record<string, [string, string, string]> = {
  "": ["#9fe9e0", "#16b6c9", "#0e8aa6"],
  pool: ["#bdeefb", "#3ec5e8", "#1d8fd1"],
  sunset: ["#ffd27a", "#ff8a5b", "#ff5e7e"],
  palm: ["#b6ecc0", "#2fbf8f", "#0f8a86"],
  grape: ["#d6c8ff", "#9b7cf0", "#6a52d8"],
  coral: ["#ffd0c2", "#ff8064", "#ef5a55"],
  night: ["#3a4d7a", "#6a5acd", "#c86fb0"],
};

/**
 * Tropical gradient as an SVG data-URI — the default cover/photo when no real
 * image has been uploaded. Ported from the prototype `gradSrc`.
 */
export function gradSrc(tone: Tone | string = ""): string {
  const c = TONE_GRADIENT[tone] || TONE_GRADIENT[""];
  const svg =
    "<svg xmlns='http://www.w3.org/2000/svg' width='400' height='300'>" +
    "<defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>" +
    `<stop offset='0' stop-color='${c[0]}'/><stop offset='0.55' stop-color='${c[1]}'/><stop offset='1' stop-color='${c[2]}'/>` +
    "</linearGradient><radialGradient id='s' cx='0.82' cy='0.14' r='0.55'>" +
    "<stop offset='0' stop-color='#ffd278' stop-opacity='0.85'/><stop offset='1' stop-color='#ffd278' stop-opacity='0'/>" +
    "</radialGradient></defs>" +
    "<rect width='400' height='300' fill='url(#g)'/><rect width='400' height='300' fill='url(#s)'/></svg>";
  return "data:image/svg+xml," + encodeURIComponent(svg);
}
