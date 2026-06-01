"use client";
import { create } from "zustand";
import { useUI } from "@/store/ui";
import { computeBudget, nightsOf } from "./budget";
import { SINGLE_WINNER_CATS } from "./constants";
import { dayLabel } from "./dates";
import { buildDemoData, computeDaysLeft } from "./seed";
import { isSupabaseConfigured } from "./supabase/env";
import type {
  Budget,
  Cat,
  ItineraryDay,
  ItineraryItem,
  MemberRole,
  OptionItem,
  Person,
  PriceUnit,
  ResearchItem,
  Tone,
  Trip,
  TripStatus,
} from "./types";

/* ---------------------------------------------------------------
   Remote adapter seam: demo = no-ops, Supabase persists.
   Actions update local state optimistically then call the adapter;
   realtime refetch reconciles all clients.
   --------------------------------------------------------------- */
export interface NewTripInput {
  name: string;
  sub: string;
  tone: Tone;
  emoji: string;
  dates: string;
  startDate?: string | null;
  endDate?: string | null;
  people: number;
  coverUrl?: string | null;
}
export type TripPatch = Partial<{
  name: string;
  sub: string;
  tone: Tone;
  emoji: string;
  status: TripStatus;
  dates: string;
  startDate: string | null;
  endDate: string | null;
  people: number;
  goalPerPerson: number;
}>;
export type ProfilePatch = { name?: string; color?: string; avatarUrl?: string | null };

/** Host-authored option (created directly or from an idea). */
export interface NewOptionInput {
  cat: Cat;
  title: string;
  subtitle?: string;
  price: number;
  unit: PriceUnit;
  link?: string;
  tone?: Tone;
  emoji?: string;
  priceNote?: string;
  meta?: [string, string][];
}
export type OptionPatch = Partial<{
  cat: Cat; title: string; subtitle: string; price: number; unit: PriceUnit;
  link: string; tone: Tone; emoji: string; priceNote: string; meta: [string, string][];
}>;
export type ResearchPatch = Partial<{
  title: string; note: string; cat: Cat; amount: number | null; source: string;
}>;
export interface NewItineraryItem { emoji: string; text: string; optionId?: string | null }
export type ItineraryItemPatch = Partial<{ emoji: string; text: string }>;
export type ItineraryDayPatch = Partial<{ title: string; date: string; tone: Tone }>;

export interface RemoteAdapter {
  rate(optionId: string, userId: string, n: number): Promise<void>;
  setWinners(tripId: string, cat: Cat, winnerIds: string[]): Promise<void>;
  addResearch(item: ResearchItem): Promise<void>;
  updateResearch(id: string, patch: ResearchPatch): Promise<void>;
  deleteResearch(id: string): Promise<void>;
  convertResearch(researchId: string, option: OptionItem): Promise<void>;
  addOption(option: OptionItem): Promise<void>;
  updateOption(id: string, patch: OptionPatch): Promise<void>;
  deleteOption(id: string): Promise<void>;
  createTrip(trip: Trip): Promise<void>;
  updateTrip(tripId: string, patch: TripPatch): Promise<void>;
  deleteTrip(tripId: string): Promise<void>;
  leaveTrip(tripId: string, userId: string): Promise<void>;
  setMemberRole(tripId: string, userId: string, role: MemberRole): Promise<void>;
  removeMember(tripId: string, userId: string): Promise<void>;
  setPeopleCount(tripId: string, n: number): Promise<void>;
  setConfirm(tripId: string, userId: string, confirmed: boolean): Promise<void>;
  setCover(tripId: string, url: string): Promise<void>;
  setOptionCover(optionId: string, url: string): Promise<void>;
  updateProfile(userId: string, fields: { name?: string; initials?: string; color?: string; avatar_url?: string | null }): Promise<void>;
  addItineraryDay(day: { id: string; tripId: string; day: number; date: string; title: string; tone: Tone }): Promise<void>;
  updateItineraryDay(id: string, patch: ItineraryDayPatch): Promise<void>;
  deleteItineraryDay(id: string): Promise<void>;
  addItineraryItem(item: { id: string; dayId: string; idx: number; emoji: string; text: string; optionId?: string | null }): Promise<void>;
  updateItineraryItem(id: string, patch: { emoji?: string; text?: string; idx?: number; dayId?: string }): Promise<void>;
  deleteItineraryItem(id: string): Promise<void>;
}
const noop = async () => {};
const demoAdapter: RemoteAdapter = {
  rate: noop, setWinners: noop, addResearch: noop, updateResearch: noop, deleteResearch: noop,
  convertResearch: noop, addOption: noop, updateOption: noop, deleteOption: noop, createTrip: noop,
  updateTrip: noop, deleteTrip: noop, leaveTrip: noop, setMemberRole: noop, removeMember: noop,
  setPeopleCount: noop, setConfirm: noop, setCover: noop, setOptionCover: noop, updateProfile: noop,
  addItineraryDay: noop, updateItineraryDay: noop, deleteItineraryDay: noop,
  addItineraryItem: noop, updateItineraryItem: noop, deleteItineraryItem: noop,
};
let remote: RemoteAdapter = demoAdapter;
export function setRemoteAdapter(a: RemoteAdapter) {
  remote = a;
}

const genId = (): string => {
  try {
    return crypto.randomUUID();
  } catch {
    return "id-" + Math.random().toString(36).slice(2, 10);
  }
};

/** Initials from a display name: up to 2 word-initials. */
export function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  return (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase();
}

// Demo mode (no Supabase env) starts clean: just the current user, no trips.
const initialDemo = isSupabaseConfigured() ? null : buildDemoData();

export interface DataState {
  ready: boolean;
  mode: "demo" | "live";
  meId: string;
  viewerId: string;
  people: Person[];
  trips: Trip[];
  options: OptionItem[];
  research: ResearchItem[];
  itineraryByTrip: Record<string, ItineraryDay[]>;

  bootstrapDemo: () => void;
  hydrateLive: (data: Partial<DataState> & { meId: string }) => void;

  rate: (optionId: string, n: number) => void;
  toggleWinner: (optionId: string) => void;
  addResearch: (tripId: string, item: Omit<ResearchItem, "id" | "trip" | "converted">) => void;
  updateResearch: (researchId: string, patch: ResearchPatch) => void;
  deleteResearch: (researchId: string) => void;
  convertResearch: (researchId: string) => void;
  addOption: (tripId: string, draft: NewOptionInput) => void;
  updateOption: (optionId: string, patch: OptionPatch) => void;
  deleteOption: (optionId: string) => void;
  addItineraryDay: (tripId: string) => void;
  updateItineraryDay: (tripId: string, dayId: string, patch: ItineraryDayPatch) => void;
  deleteItineraryDay: (tripId: string, dayId: string) => void;
  addItineraryItem: (tripId: string, dayId: string, item: NewItineraryItem) => void;
  updateItineraryItem: (tripId: string, dayId: string, itemId: string, patch: ItineraryItemPatch) => void;
  deleteItineraryItem: (tripId: string, dayId: string, itemId: string) => void;
  moveItineraryItem: (tripId: string, dayId: string, itemId: string, dir: -1 | 1) => void;
  createTrip: (draft: NewTripInput) => string;
  updateTrip: (tripId: string, patch: TripPatch) => void;
  deleteTrip: (tripId: string) => void;
  leaveTrip: (tripId: string) => void;
  setMemberRole: (tripId: string, userId: string, role: MemberRole) => void;
  removeMember: (tripId: string, userId: string) => void;
  setPeopleCount: (tripId: string, n: number) => void;
  toggleConfirm: (tripId: string, userId?: string) => void;
  setCover: (tripId: string, url: string) => void;
  setOptionCover: (optionId: string, url: string) => void;
  updateProfile: (patch: ProfilePatch) => void;
}

export const useData = create<DataState>((set, get) => ({
  ready: !!initialDemo,
  mode: "demo",
  meId: "me",
  viewerId: "me",
  people: initialDemo?.people ?? [],
  trips: initialDemo?.trips ?? [],
  options: initialDemo?.options ?? [],
  research: initialDemo?.research ?? [],
  itineraryByTrip: initialDemo?.itineraryByTrip ?? {},

  bootstrapDemo: () => {
    if (get().ready && get().mode === "demo") return;
    const d = buildDemoData();
    remote = demoAdapter;
    set({ ready: true, mode: "demo", meId: "me", viewerId: "me", people: d.people, trips: d.trips, options: d.options, research: d.research, itineraryByTrip: d.itineraryByTrip });
  },

  hydrateLive: (data) => set({ ready: true, mode: "live", viewerId: data.meId, ...data }),

  rate: (optionId, n) => {
    const { viewerId } = get();
    set((s) => ({ options: s.options.map((o) => (o.id === optionId ? { ...o, votes: { ...o.votes, [viewerId]: n } } : o)) }));
    void remote.rate(optionId, viewerId, n);
  },

  toggleWinner: (optionId) => {
    const s = get();
    const target = s.options.find((o) => o.id === optionId);
    if (!target) return;
    if (!isHost(s, target.trip, s.viewerId)) {
      useUI.getState().showToast("Solo el anfitrión decide 🔒");
      return;
    }
    const turningOn = !target.winner;
    const single = SINGLE_WINNER_CATS.includes(target.cat);
    set((st) => ({
      options: st.options.map((o) => {
        if (o.id === optionId) return { ...o, winner: turningOn };
        if (turningOn && single && o.trip === target.trip && o.cat === target.cat) return { ...o, winner: false };
        return o;
      }),
    }));
    const winners = get().options.filter((o) => o.trip === target.trip && o.cat === target.cat && o.winner).map((o) => o.id);
    void remote.setWinners(target.trip, target.cat, winners);
    if (turningOn) {
      useUI.getState().burst();
      useUI.getState().showToast(`¡${target.title} entró al plan! 🎉`);
    } else {
      useUI.getState().showToast("Quitada del plan");
    }
  },

  addResearch: (tripId, item) => {
    const r: ResearchItem = { ...item, id: genId(), trip: tripId, converted: null };
    set((s) => ({ research: [r, ...s.research] }));
    useUI.getState().showToast("Idea guardada 📌");
    void remote.addResearch(r);
  },

  updateResearch: (researchId, patch) => {
    set((s) => ({ research: s.research.map((r) => (r.id === researchId ? { ...r, ...patch } : r)) }));
    useUI.getState().showToast("Idea actualizada ✓");
    void remote.updateResearch(researchId, patch);
  },

  deleteResearch: (researchId) => {
    set((s) => ({ research: s.research.filter((r) => r.id !== researchId) }));
    useUI.getState().showToast("Idea eliminada");
    void remote.deleteResearch(researchId);
  },

  convertResearch: (researchId) => {
    const s = get();
    const r = s.research.find((x) => x.id === researchId);
    if (!r || r.converted) return;
    const newId = genId();
    const realNote = r.note && r.note !== "Agregado ahora" ? r.note : "";
    const hasSource = r.source && r.source !== "Nota";
    const created: OptionItem = {
      id: newId, trip: r.trip, cat: r.cat === "general" ? "actividades" : r.cat, tone: r.tone, emoji: "✨",
      title: r.title.slice(0, 48), subtitle: realNote.slice(0, 60),
      price: r.amount ?? 0, unit: r.cat === "hospedaje" ? "total" : "pp",
      priceNote: r.amount ? "estimado" : "Por definir",
      meta: [], link: hasSource ? r.source : "",
      winner: false, coverUrl: null, votes: {},
    };
    set((st) => ({
      options: [...st.options, created],
      research: st.research.map((x) => (x.id === researchId ? { ...x, converted: newId } : x)),
    }));
    useUI.getState().showToast("Convertida en opción ⭐ ¡ya pueden votarla!");
    void remote.convertResearch(researchId, created);
  },

  addOption: (tripId, draft) => {
    const created: OptionItem = {
      id: genId(), trip: tripId, cat: draft.cat, tone: draft.tone ?? "", emoji: draft.emoji ?? "✨",
      title: draft.title.trim(), subtitle: draft.subtitle?.trim() ?? "",
      price: Math.max(0, Math.round(draft.price || 0)), unit: draft.unit,
      priceNote: draft.priceNote ?? "", meta: draft.meta ?? [],
      link: draft.link?.trim() ?? "", winner: false, coverUrl: null, votes: {},
    };
    set((s) => ({ options: [...s.options, created] }));
    useUI.getState().showToast("Opción agregada ⭐");
    void remote.addOption(created);
  },

  updateOption: (optionId, patch) => {
    set((s) => ({ options: s.options.map((o) => (o.id === optionId ? { ...o, ...patch } : o)) }));
    useUI.getState().showToast("Opción actualizada ✓");
    void remote.updateOption(optionId, patch);
  },

  deleteOption: (optionId) => {
    set((s) => ({ options: s.options.filter((o) => o.id !== optionId) }));
    useUI.getState().showToast("Opción eliminada");
    void remote.deleteOption(optionId);
  },

  createTrip: (draft) => {
    const id = genId();
    const { viewerId } = get();
    const trip: Trip = {
      id, name: draft.name, sub: draft.sub, tone: draft.tone, emoji: draft.emoji,
      status: "planeando", dates: draft.dates, startDate: draft.startDate ?? null, endDate: draft.endDate ?? null,
      daysLeft: computeDaysLeft(draft.startDate), people: draft.people, goalPerPerson: 9000,
      active: true, coverUrl: draft.coverUrl ?? null,
      memberIds: [viewerId], memberInfo: { [viewerId]: { role: "host", confirmed: true } }, ownerId: viewerId,
    };
    set((s) => ({ trips: [...s.trips.map((t) => ({ ...t, active: false })), trip] }));
    useUI.getState().showToast("¡Viaje creado! 🌴 Agrega opciones");
    void remote.createTrip(trip);
    return id;
  },

  updateTrip: (tripId, patch) => {
    set((s) => ({
      trips: s.trips.map((t) => {
        if (t.id !== tripId) return t;
        const next = { ...t, ...patch };
        if ("startDate" in patch) next.daysLeft = computeDaysLeft(patch.startDate ?? null);
        return next;
      }),
    }));
    useUI.getState().showToast("Viaje actualizado ✓");
    void remote.updateTrip(tripId, patch);
  },

  deleteTrip: (tripId) => {
    set((s) => ({
      trips: s.trips.filter((t) => t.id !== tripId),
      options: s.options.filter((o) => o.trip !== tripId),
      research: s.research.filter((r) => r.trip !== tripId),
    }));
    useUI.getState().showToast("Viaje eliminado");
    void remote.deleteTrip(tripId);
  },

  leaveTrip: (tripId) => {
    set((s) => ({ trips: s.trips.filter((t) => t.id !== tripId) }));
    useUI.getState().showToast("Saliste del viaje");
    void remote.leaveTrip(tripId, get().meId);
  },

  setMemberRole: (tripId, userId, role) => {
    set((s) => ({
      trips: s.trips.map((t) => {
        if (t.id !== tripId) return t;
        const cur = t.memberInfo[userId] || { role: "guest" as const, confirmed: false };
        return { ...t, memberInfo: { ...t.memberInfo, [userId]: { ...cur, role } } };
      }),
    }));
    useUI.getState().showToast(role === "host" ? "Ahora es organizador 👑" : "Ahora es invitado");
    void remote.setMemberRole(tripId, userId, role);
  },

  removeMember: (tripId, userId) => {
    set((s) => ({
      trips: s.trips.map((t) => {
        if (t.id !== tripId) return t;
        const memberInfo = { ...t.memberInfo };
        delete memberInfo[userId];
        return { ...t, memberIds: t.memberIds.filter((m) => m !== userId), memberInfo };
      }),
    }));
    useUI.getState().showToast("Quitado del viaje");
    void remote.removeMember(tripId, userId);
  },

  setPeopleCount: (tripId, n) => {
    set((s) => ({ trips: s.trips.map((t) => (t.id === tripId ? { ...t, people: n } : t)) }));
    void remote.setPeopleCount(tripId, n);
  },

  toggleConfirm: (tripId, userId) => {
    const uid = userId ?? get().viewerId;
    let next = false;
    set((s) => ({
      trips: s.trips.map((t) => {
        if (t.id !== tripId) return t;
        const cur = t.memberInfo[uid] || { role: "guest" as const, confirmed: false };
        next = !cur.confirmed;
        return { ...t, memberInfo: { ...t.memberInfo, [uid]: { ...cur, confirmed: next } } };
      }),
    }));
    void remote.setConfirm(tripId, uid, next);
  },

  setCover: (tripId, url) => {
    set((s) => ({ trips: s.trips.map((t) => (t.id === tripId ? { ...t, coverUrl: url } : t)) }));
    void remote.setCover(tripId, url);
  },

  setOptionCover: (optionId, url) => {
    set((s) => ({ options: s.options.map((o) => (o.id === optionId ? { ...o, coverUrl: url } : o)) }));
    void remote.setOptionCover(optionId, url);
  },

  addItineraryDay: (tripId) => {
    const s = get();
    const trip = s.trips.find((t) => t.id === tripId);
    const existing = s.itineraryByTrip[tripId] ?? [];
    const sortKey = existing.length ? Math.max(...existing.map((d) => d.day)) + 1 : 1;
    const pos = existing.length;
    const day: ItineraryDay = {
      id: genId(), day: sortKey, date: dayLabel(trip?.startDate, pos),
      title: `Día ${pos + 1}`, tone: (trip?.tone as Tone) ?? "", items: [],
    };
    set((st) => ({ itineraryByTrip: { ...st.itineraryByTrip, [tripId]: [...existing, day] } }));
    void remote.addItineraryDay({ id: day.id, tripId, day: day.day, date: day.date, title: day.title, tone: day.tone });
  },

  updateItineraryDay: (tripId, dayId, patch) => {
    set((st) => ({
      itineraryByTrip: {
        ...st.itineraryByTrip,
        [tripId]: (st.itineraryByTrip[tripId] ?? []).map((d) => (d.id === dayId ? { ...d, ...patch } : d)),
      },
    }));
    void remote.updateItineraryDay(dayId, patch);
  },

  deleteItineraryDay: (tripId, dayId) => {
    set((st) => ({
      itineraryByTrip: { ...st.itineraryByTrip, [tripId]: (st.itineraryByTrip[tripId] ?? []).filter((d) => d.id !== dayId) },
    }));
    useUI.getState().showToast("Día eliminado");
    void remote.deleteItineraryDay(dayId);
  },

  addItineraryItem: (tripId, dayId, item) => {
    const it: ItineraryItem = { id: genId(), emoji: item.emoji, text: item.text, optionId: item.optionId ?? null };
    let idx = 0;
    set((st) => ({
      itineraryByTrip: {
        ...st.itineraryByTrip,
        [tripId]: (st.itineraryByTrip[tripId] ?? []).map((d) => {
          if (d.id !== dayId) return d;
          idx = d.items.length;
          return { ...d, items: [...d.items, it] };
        }),
      },
    }));
    useUI.getState().showToast("Agregado al itinerario 🗓️");
    void remote.addItineraryItem({ id: it.id, dayId, idx, emoji: it.emoji, text: it.text, optionId: it.optionId });
  },

  updateItineraryItem: (tripId, dayId, itemId, patch) => {
    set((st) => ({
      itineraryByTrip: {
        ...st.itineraryByTrip,
        [tripId]: (st.itineraryByTrip[tripId] ?? []).map((d) =>
          d.id !== dayId ? d : { ...d, items: d.items.map((i) => (i.id === itemId ? { ...i, ...patch } : i)) }
        ),
      },
    }));
    void remote.updateItineraryItem(itemId, patch);
  },

  deleteItineraryItem: (tripId, dayId, itemId) => {
    set((st) => ({
      itineraryByTrip: {
        ...st.itineraryByTrip,
        [tripId]: (st.itineraryByTrip[tripId] ?? []).map((d) =>
          d.id !== dayId ? d : { ...d, items: d.items.filter((i) => i.id !== itemId) }
        ),
      },
    }));
    void remote.deleteItineraryItem(itemId);
  },

  moveItineraryItem: (tripId, dayId, itemId, dir) => {
    let moved: { a: ItineraryItem; ai: number; b: ItineraryItem; bi: number } | null = null;
    set((st) => ({
      itineraryByTrip: {
        ...st.itineraryByTrip,
        [tripId]: (st.itineraryByTrip[tripId] ?? []).map((d) => {
          if (d.id !== dayId) return d;
          const items = [...d.items];
          const i = items.findIndex((x) => x.id === itemId);
          const j = i + dir;
          if (i < 0 || j < 0 || j >= items.length) return d;
          [items[i], items[j]] = [items[j], items[i]];
          moved = { a: items[i], ai: i, b: items[j], bi: j };
          return { ...d, items };
        }),
      },
    }));
    if (moved) {
      const m = moved as { a: ItineraryItem; ai: number; b: ItineraryItem; bi: number };
      void remote.updateItineraryItem(m.a.id, { idx: m.ai });
      void remote.updateItineraryItem(m.b.id, { idx: m.bi });
    }
  },

  updateProfile: (patch) => {
    const { meId } = get();
    const fields: { name?: string; initials?: string; color?: string; avatar_url?: string | null } = {};
    const local: Partial<Person> = {};
    if (patch.name != null) {
      fields.name = patch.name.trim();
      fields.initials = initialsOf(patch.name);
      local.name = fields.name;
      local.initials = fields.initials;
    }
    if (patch.color != null) {
      fields.color = patch.color;
      local.color = patch.color;
    }
    if (patch.avatarUrl !== undefined) {
      fields.avatar_url = patch.avatarUrl;
      local.avatarUrl = patch.avatarUrl;
    }
    set((s) => ({ people: s.people.map((p) => (p.id === meId ? { ...p, ...local } : p)) }));
    useUI.getState().showToast("Perfil actualizado ✓");
    void remote.updateProfile(meId, fields);
  },
}));

/* ---------------------------- selectors ---------------------------- */

export interface DataSlice {
  people: Person[];
  trips: Trip[];
  options: OptionItem[];
  research: ResearchItem[];
  itineraryByTrip: Record<string, ItineraryDay[]>;
  viewerId: string;
}

export function peopleById(s: DataSlice): Record<string, Person> {
  return Object.fromEntries(s.people.map((p) => [p.id, p]));
}

export function isHost(s: DataSlice, tripId: string, personId: string): boolean {
  const trip = s.trips.find((t) => t.id === tripId);
  if (!trip) return false;
  const info = trip.memberInfo?.[personId];
  if (info) return info.role === "host";
  return trip.ownerId === personId;
}

export function membersOf(s: DataSlice, tripId: string): Person[] {
  const trip = s.trips.find((t) => t.id === tripId);
  const by = peopleById(s);
  return (trip?.memberIds || [])
    .map((id) => by[id])
    .filter(Boolean)
    .map((p) => {
      const info = trip?.memberInfo?.[p.id];
      return { ...p, host: info ? info.role === "host" : isHost(s, tripId, p.id), confirmed: info ? info.confirmed : p.confirmed };
    });
}

export function optionsOf(s: DataSlice, tripId: string): OptionItem[] {
  return s.options.filter((o) => o.trip === tripId);
}
export function researchOf(s: DataSlice, tripId: string): ResearchItem[] {
  return s.research.filter((r) => r.trip === tripId);
}
export function itineraryOf(s: DataSlice, tripId: string): ItineraryDay[] {
  return s.itineraryByTrip[tripId] || [];
}
export function budgetOf(s: DataSlice, tripId: string): Budget {
  const trip = s.trips.find((t) => t.id === tripId);
  const count = trip?.people || membersOf(s, tripId).length || 1;
  return computeBudget(optionsOf(s, tripId), membersOf(s, tripId), count, nightsOf(trip));
}
