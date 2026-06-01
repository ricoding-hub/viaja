const MONTHS = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

/** Spanish display string for a date range, e.g. "19–23 jun 2026". */
export function formatDateRange(start?: string | null, end?: string | null): string {
  if (!start) return "Sin fecha";
  const s = new Date(start + "T00:00:00");
  if (isNaN(s.getTime())) return "Sin fecha";
  const e = end ? new Date(end + "T00:00:00") : null;
  const y = (e && !isNaN(e.getTime()) ? e : s).getFullYear();
  if (e && !isNaN(e.getTime()) && s.getMonth() === e.getMonth())
    return `${s.getDate()}–${e.getDate()} ${MONTHS[s.getMonth()]} ${y}`;
  if (e && !isNaN(e.getTime()))
    return `${s.getDate()} ${MONTHS[s.getMonth()]} – ${e.getDate()} ${MONTHS[e.getMonth()]} ${y}`;
  return `${s.getDate()} ${MONTHS[s.getMonth()]} ${y}`;
}
