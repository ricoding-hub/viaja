import type { ItineraryDay, OptionItem, Person, ResearchItem, Trip } from "./types";
import { GOAL } from "./constants";

/** Days until a yyyy-mm-dd date from today (null if no date). */
export function computeDaysLeft(startDate?: string | null): number | null {
  if (!startDate) return null;
  const d = new Date(startDate + "T00:00:00");
  if (isNaN(d.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const ms = d.getTime() - today.getTime();
  const days = Math.ceil(ms / 86400000);
  return days >= 0 ? days : null;
}

export interface DemoData {
  people: Person[];
  trips: Trip[];
  options: OptionItem[];
  research: ResearchItem[];
  itineraryByTrip: Record<string, ItineraryDay[]>;
}

/**
 * The Puerto Escondido demo dataset (+ two more trips), ported from the
 * prototype data.js. Used directly in demo mode and as the template the
 * Supabase `clone_demo_trips` function reproduces for new users.
 */
export function buildDemoData(): DemoData {
  const people: Person[] = [
    { id: "ric", name: "Ricardo", initials: "R", color: "#11BFB2", host: true },
    { id: "ale", name: "Ale", initials: "A", color: "#FF6F5C", host: true },
    { id: "memo", name: "Memo", initials: "M", color: "#7C6CF0", confirmed: true },
    { id: "sofi", name: "Sofi", initials: "S", color: "#FFB43E", confirmed: true },
    { id: "dani", name: "Dani", initials: "D", color: "#0E8AA6", confirmed: false },
  ];

  const options: OptionItem[] = [
    // ---------- HOSPEDAJE ----------
    { id: "h1", trip: "pxm", cat: "hospedaje", tone: "pool", emoji: "🏝️", title: "Casa Aleta", subtitle: "Villa con alberca privada · Zicatela", price: 13500, unit: "total", priceNote: "5 noches · toda la casa", meta: [["Alberca", "Privada"], ["Recámaras", "3"], ["A la playa", "4 min"]], link: "airbnb.com/casa-aleta", winner: true, votes: { ric: 5, ale: 5, memo: 4, sofi: 5 } },
    { id: "h2", trip: "pxm", cat: "hospedaje", tone: "palm", emoji: "🌿", title: "Selva Suites", subtitle: "Bungalows boutique · La Punta", price: 11000, unit: "total", priceNote: "5 noches · 3 bungalows", meta: [["Alberca", "Compartida"], ["Recámaras", "3"], ["A la playa", "2 min"]], link: "airbnb.com/selva-suites", winner: false, votes: { ric: 4, ale: 3, memo: 5, sofi: 4 } },
    { id: "h3", trip: "pxm", cat: "hospedaje", tone: "sunset", emoji: "🛏️", title: "Hotel Marea", subtitle: "Hotel frente al mar · Zicatela", price: 16200, unit: "total", priceNote: "5 noches · 3 cuartos", meta: [["Alberca", "Rooftop"], ["Cuartos", "3"], ["A la playa", "0 min"]], link: "booking.com/marea", winner: false, votes: { ric: 3, ale: 4, memo: 3, sofi: 3 } },
    // ---------- TRANSPORTE ----------
    { id: "t1", trip: "pxm", cat: "transporte", tone: "pool", emoji: "✈️", title: "Volaris directo", subtitle: "MEX → PXM · vuelo redondo", price: 2380, unit: "pp", priceNote: "por persona · redondo", meta: [["Duración", "1h 10m"], ["Escalas", "Directo"], ["Maleta", "Incluida"]], link: "volaris.com", winner: true, votes: { ric: 5, ale: 4, memo: 4, sofi: 5 } },
    { id: "t2", trip: "pxm", cat: "transporte", tone: "grape", emoji: "🚐", title: "Roadtrip en van", subtitle: "Renta de van · 7h de camino", price: 1450, unit: "pp", priceNote: "gasolina + casetas + renta ÷ 5", meta: [["Duración", "7h"], ["Flexible", "Sí"], ["Vibe", "Aventura"]], link: "nota de Ale", winner: false, votes: { ric: 3, ale: 5, memo: 2, sofi: 3 } },
    // ---------- ACTIVIDADES ----------
    { id: "a1", trip: "pxm", cat: "actividades", tone: "night", emoji: "🐬", title: "Bioluminiscencia", subtitle: "Tour nocturno en laguna de Manialtepec", price: 650, unit: "pp", priceNote: "por persona · incluye guía", meta: [["Duración", "3h"], ["Horario", "Noche"], ["Wow", "★★★★★"]], link: "tiktok.com/@viajespxm", winner: true, votes: { ric: 5, ale: 5, memo: 5, sofi: 4 } },
    { id: "a2", trip: "pxm", cat: "actividades", tone: "sunset", emoji: "🏄", title: "Clase de surf", subtitle: "Para principiantes · playa Carrizalillo", price: 500, unit: "pp", priceNote: "por persona · 2h con tabla", meta: [["Duración", "2h"], ["Nivel", "Principiante"], ["Tabla", "Incluida"]], link: "instagram.com/surfpxm", winner: true, votes: { ric: 4, ale: 5, memo: 5, sofi: 5 } },
    { id: "a3", trip: "pxm", cat: "actividades", tone: "palm", emoji: "🐢", title: "Liberación de tortugas", subtitle: "Atardecer en Bahías de Chacahua", price: 0, unit: "pp", priceNote: "gratis · donativo sugerido", meta: [["Duración", "1h"], ["Horario", "Atardecer"], ["Costo", "Donativo"]], link: "nota de Sofi", winner: false, votes: { ric: 4, ale: 4, memo: 3, sofi: 5 } },
    // ---------- COMIDA & BEBIDA ----------
    { id: "c1", trip: "pxm", cat: "comida", tone: "coral", emoji: "🍤", title: "Plan gastronómico", subtitle: "Mezcla de market + restaurantes", price: 480, unit: "ppd", priceNote: "estimado por persona / día", meta: [["Desayunos", "En casa"], ["Cenas", "Fuera"], ["Mezcal", "Incluido 😏"]], link: "estimado del grupo", winner: true, votes: { ric: 4, ale: 4, memo: 4, sofi: 4 } },
  ];

  const research: ResearchItem[] = [
    { id: "r1", trip: "pxm", type: "tiktok", cat: "actividades", tone: "night", title: "POV: la laguna brilla de noche 🌊✨", source: "tiktok.com/@viajespxm", note: "Bioluminiscencia — dicen que junio es la mejor época", saved: "Ale", converted: "a1" },
    { id: "r2", trip: "pxm", type: "flight", cat: "transporte", tone: "pool", title: "Volaris MEX–PXM $2,380 redondo", source: "volaris.com", note: "Precio baja si compramos antes del 15 de junio", saved: "Ricardo", converted: "t1" },
    { id: "r3", trip: "pxm", type: "link", cat: "hospedaje", tone: "pool", title: "Casa Aleta — alberca privada 🏝️", source: "airbnb.com/casa-aleta", note: "3 recámaras, cabe perfecto, a 4 min de la playa", saved: "Ricardo", converted: "h1" },
    { id: "r4", trip: "pxm", type: "note", cat: "comida", tone: "coral", title: "Lista de antojos 🍤", source: "Nota", note: "Tacos del Carmen, Almoraduz, mercado de Zicatela, mezcalería de La Punta", saved: "Sofi", converted: null },
    { id: "r5", trip: "pxm", type: "link", cat: "actividades", tone: "sunset", title: "Surf en Carrizalillo para novatos", source: "instagram.com/surfpxm", note: "Clase grupal, nos dan descuento si somos +4", saved: "Memo", converted: "a2" },
    { id: "r6", trip: "pxm", type: "note", cat: "general", tone: "grape", title: "Idea: pastel sorpresa 🎂 para Ale", source: "Nota", note: "Encargar pastel para la noche del cumpleaños (no decirle 🤫)", saved: "Ricardo", converted: null },
  ];

  const itineraryByTrip: Record<string, ItineraryDay[]> = {
    pxm: [
      { day: 1, date: "Vie 19 jun", title: "Llegada & La Punta", tone: "sunset", items: [["✈️", "Vuelo MEX–PXM 9:40am"], ["🏝️", "Check-in Casa Aleta"], ["🌅", "Atardecer + cena en La Punta"]] },
      { day: 2, date: "Sáb 20 jun", title: "Surf & playa", tone: "pool", items: [["🏄", "Clase de surf en Carrizalillo"], ["🥥", "Tarde de alberca"], ["🍤", "Cena de mariscos"]] },
      { day: 3, date: "Dom 21 jun", title: "🎂 Cumple de Ale", tone: "coral", items: [["🛥️", "Tour de bahías"], ["🐢", "Liberación de tortugas"], ["🎉", "¡Fiesta sorpresa en la casa!"]] },
      { day: 4, date: "Lun 22 jun", title: "Bioluminiscencia", tone: "night", items: [["😴", "Mañana libre"], ["🛍️", "Mercado de Zicatela"], ["🐬", "Tour nocturno bioluminiscente"]] },
      { day: 5, date: "Mar 23 jun", title: "Despedida", tone: "palm", items: [["🥞", "Brunch en La Punta"], ["🧳", "Check-out"], ["✈️", "Vuelo de regreso 6:10pm"]] },
    ],
  };

  const trips: Trip[] = [
    { id: "pxm", name: "Puerto Escondido", sub: "Cumple de Ale 🎂", tone: "pool", emoji: "🏝️", status: "planeando", dates: "19–23 jun 2026", startDate: "2026-06-19", endDate: "2026-06-23", daysLeft: computeDaysLeft("2026-06-19"), people: 5, goalPerPerson: GOAL, active: true, coverUrl: null, memberIds: ["ric", "ale", "memo", "sofi", "dani"], memberInfo: { ric: { role: "host", confirmed: true }, ale: { role: "host", confirmed: true }, memo: { role: "guest", confirmed: true }, sofi: { role: "guest", confirmed: true }, dani: { role: "guest", confirmed: false } }, ownerId: "ric" },
    { id: "val", name: "Valle de Bravo", sub: "Escape de fin de semana", tone: "palm", emoji: "⛰️", status: "idea", dates: "Sin fecha", startDate: null, endDate: null, daysLeft: null, people: 6, goalPerPerson: GOAL, active: false, coverUrl: null, memberIds: ["ric", "ale", "memo"], memberInfo: { ric: { role: "host", confirmed: true }, ale: { role: "host", confirmed: true }, memo: { role: "guest", confirmed: false } }, ownerId: "ric" },
    { id: "cdmx", name: "Roma & Condesa", sub: "Finde gastronómico", tone: "grape", emoji: "🌮", status: "completado", dates: "Mar 2026", startDate: null, endDate: null, daysLeft: null, people: 4, goalPerPerson: GOAL, active: false, coverUrl: null, memberIds: ["ric", "ale", "memo", "sofi"], memberInfo: { ric: { role: "host", confirmed: true }, ale: { role: "host", confirmed: true }, memo: { role: "guest", confirmed: true }, sofi: { role: "guest", confirmed: true } }, ownerId: "ric" },
  ];

  return { people, trips, options, research, itineraryByTrip };
}
