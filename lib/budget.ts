import { CAT_ORDER, DAYS } from "./constants";
import type { Budget, CatBudget, OptionItem, Person } from "./types";

/** Cost of a single option for N people. (Ported from app.jsx `costOf`.) */
export function costOf(o: Pick<OptionItem, "unit" | "price">, n: number, days = DAYS): number {
  if (o.unit === "pp") return o.price * n;
  if (o.unit === "ppd") return o.price * n * days;
  return o.price; // 'total'
}

/**
 * Live budget engine. Pure function ported faithfully from app.jsx
 * `computeBudget`. Derives everything from current winning options +
 * people count, so it can re-run on every realtime change.
 *
 * @param tripOptions options already filtered to a single trip
 * @param members     people in the trip (host/confirmed flags drive progress)
 * @param count       people count (slider)
 */
export function computeBudget(
  tripOptions: OptionItem[],
  members: Person[],
  count: number,
  days = DAYS
): Budget {
  const byCat: Record<string, CatBudget> = {};
  CAT_ORDER.forEach((cat) => {
    const winners = tripOptions.filter((o) => o.cat === cat && o.winner);
    const subtotal = winners.reduce((s, o) => s + costOf(o, count, days), 0);
    byCat[cat] = {
      subtotal,
      perPerson: count ? subtotal / count : 0,
      note: winners.length ? winners.map((w) => w.title).join(" + ") : "Sin elegir aún",
      winners,
    };
  });

  const total = CAT_ORDER.reduce((s, c) => s + byCat[c].subtotal, 0);
  const decided = CAT_ORDER.filter((c) => byCat[c].winners.length).length;
  const confirmed = members.filter((p) => p.host || p.confirmed).length;
  const votesCast = tripOptions.reduce((s, o) => s + Object.keys(o.votes || {}).length, 0);
  const voteScore = tripOptions.length ? votesCast / (tripOptions.length * count) : 0;
  const progress = Math.round(
    ((decided / CAT_ORDER.length) * 0.5 +
      Math.min(1, voteScore) * 0.3 +
      (members.length ? confirmed / members.length : 0) * 0.2) *
      100
  );

  return {
    byCat,
    total,
    perCap: count ? total / count : 0,
    decided,
    progress,
    optCount: tripOptions.length,
  };
}

/** Average of a votes map (personId -> rating). Ported from `avg`. */
export function avg(votes: Record<string, number> | undefined): number {
  const v = Object.values(votes || {});
  if (!v.length) return 0;
  return v.reduce((a, b) => a + b, 0) / v.length;
}
