/** Money / number formatting helpers (ported from components.jsx). */

export const fmt = (n: number): string => "$" + Math.round(n).toLocaleString("es-MX");

export const fmtK = (n: number): string =>
  n >= 1000 ? "$" + (n / 1000).toFixed(n % 1000 === 0 ? 0 : 1) + "k" : "$" + n;

export { avg } from "@/lib/budget";
