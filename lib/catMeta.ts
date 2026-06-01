import type { Cat, CatMetaEntry } from "./types";

/** Per-category label/icon/color (from the prototype data.js catMeta). */
export const catMeta: Record<Cat, CatMetaEntry> = {
  hospedaje: { label: "Hospedaje", icon: "bed", color: "#11BFB2" },
  transporte: { label: "Transporte", icon: "plane", color: "#7C6CF0" },
  actividades: { label: "Actividades", icon: "star", color: "#FF6F5C" },
  comida: { label: "Comida & bebida", icon: "food", color: "#FFB43E" },
  general: { label: "General", icon: "pin", color: "#0E8AA6" },
};
