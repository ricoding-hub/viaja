import type { Cat, TripStatus } from "./types";

/** Default trip length (nights) used for per-person-per-day costing when a
 *  trip has no explicit dates. Matches the prototype demo (DAYS = 5). */
export const DAYS = 5;

/** Default per-person budget goal (MXN). */
export const GOAL = 9000;

/** Avatar color palette for new members (from the prototype). */
export const PALETTE = [
  "#11BFB2", "#FF6F5C", "#7C6CF0", "#FFB43E", "#0E8AA6", "#E8638F", "#3FA796",
];

/** Budget categories, in display order. Excludes `general` (research-only). */
export const CAT_ORDER: Cat[] = ["hospedaje", "transporte", "actividades", "comida"];

/** Categories where choosing a winner clears its siblings (single choice). */
export const SINGLE_WINNER_CATS: Cat[] = ["hospedaje", "transporte", "comida"];

/** Tropical gradient tones available for covers/photos. */
export const TONES = ["", "pool", "sunset", "palm", "grape", "coral", "night"] as const;

/** Home "status" tag: [tag css class, label]. */
export const STATUS_TAG: Record<TripStatus, [string, string]> = {
  planeando: ["tag-turq", "🌴 Planeando"],
  idea: ["tag-sun", "💡 Idea"],
  completado: ["tag-grape", "✓ Hecho"],
};

/** Bottom-nav tabs inside a trip. Maps to /trip/[id]/<seg>. */
export const TABS = [
  { seg: "", label: "Inicio", ic: "home" },
  { seg: "options", label: "Opciones", ic: "layers" },
  { seg: "budget", label: "Presupuesto", ic: "wallet" },
  { seg: "ideas", label: "Ideas", ic: "inbox" },
  { seg: "plan", label: "Plan", ic: "calendar" },
] as const;
