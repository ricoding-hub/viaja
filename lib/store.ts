"use client";
import { create } from "zustand";
import { useUI } from "@/store/ui";
import { computeBudget } from "./budget";
import { PALETTE, SINGLE_WINNER_CATS } from "./constants";
import { buildDemoData, computeDaysLeft } from "./seed";
import { isSupabaseConfigured } from "./supabase/env";
import type {
  Budget,
  Cat,
  ItineraryDay,
  OptionItem,
  Person,
  ResearchItem,
  Tone,
  Trip,
  TripStatus,
} from "./types";

/* ---------------------------------------------------------------
   Remote adapter seam: demo = no-ops, Supabase fills these in
   (Phase 7). Store actions update local state optimistically and
   then call the adapter to persist; realtime reconciles clients.
   --------------------------------------------------------------- */
export interface NewTripInput {
  id: string;
  name: string;
  sub: string;
  tone: Tone;
  emoji: string;
  status: TripStatus;
  dates: string;
  startDate?: string | null;
  endDate?: string | null;
  people: number;
}
export interface RemoteAdapter {
  rate(optionId: string, userId: string, n: number): Promise<void>;
  setWinners(tripId: string, cat: Cat, winnerIds: string[]): Promise<void>;
  addResearch(item: ResearchItem): Promise<void>;
  convertResearch(researchId: string, option: OptionItem): Promise<void>;
  createTrip(trip: Trip): Promise<void>;
  addGuest(tripId: string, person: Person): Promise<void>;
  setPeopleCount(tripId: string, n: number): Promise<void>;
  setConfirm(tripId: string, userId: string, confirmed: boolean): Promise<void>;
  setCover(tripId: string, url: string): Promise<void>;
  setOptionCover(optionId: string, url: string): Promise<void>;
}
const noop = async () => {};
const demoAdapter: RemoteAdapter = {
  rate: noop, setWinners: noop, addResearch: noop, convertResearch: noop,
  createTrip: noop, addGuest: noop, setPeopleCount: noop, setConfirm: noop,
  setCover: noop, setOptionCover: noop,
};
let remote: RemoteAdapter = demoAdapter;
export function setRemoteAdapter(a: RemoteAdapter) {
  remote = a;
}

// Real UUIDs: optimistic rows share the id used for the DB insert, so realtime
// re-fetches reconcile cleanly (no temp/real duplicates) and navigation works.
const genId = (): string => {
  try {
    return crypto.randomUUID();
  } catch {
    return "id-" + Math.random().toString(36).slice(2, 10);
  }
};

// In demo mode (no Supabase env) seed the store immediately so SSR/first paint
// render real content (consistent hydration). Live mode starts empty and is
// hydrated from the server (Phase 7).
const initialDemo = isSupabaseConfigured() ? null : buildDemoData();

export interface DataState {
  ready: boolean;
  mode: "demo" | "live";
  meId: string;
  viewerId: string; // demo: switchable identity; live: meId
  people: Person[];
  trips: Trip[];
  options: OptionItem[];
  research: ResearchItem[];
  itineraryByTrip: Record<string, ItineraryDay[]>;

  /** Load the in-memory demo dataset (no backend). */
  bootstrapDemo: () => void;
  /** Replace store with server data + flag live mode (Phase 7). */
  hydrateLive: (data: Partial<DataState> & { meId: string }) => void;
  /** Merge a realtime patch from Supabase (Phase 7). */
  applyServer: (patch: Partial<Pick<DataState, "people" | "trips" | "options" | "research" | "itineraryByTrip">>) => void;

  setViewer: (id: string) => void;
  rate: (optionId: string, n: number) => void;
  toggleWinner: (optionId: string) => void;
  addResearch: (tripId: string, item: Omit<ResearchItem, "id" | "trip" | "converted">) => void;
  convertResearch: (researchId: string) => void;
  createTrip: (draft: Omit<NewTripInput, "id" | "status">) => string;
  addGuest: (tripId: string, name: string) => void;
  setPeopleCount: (tripId: string, n: number) => void;
  toggleConfirm: (tripId: string, userId?: string) => void;
  setCover: (tripId: string, url: string) => void;
  setOptionCover: (optionId: string, url: string) => void;
}

export const useData = create<DataState>((set, get) => ({
  ready: !!initialDemo,
  mode: "demo",
  meId: "ric",
  viewerId: "ric",
  people: initialDemo?.people ?? [],
  trips: initialDemo?.trips ?? [],
  options: initialDemo?.options ?? [],
  research: initialDemo?.research ?? [],
  itineraryByTrip: initialDemo?.itineraryByTrip ?? {},

  bootstrapDemo: () => {
    if (get().ready && get().mode === "demo") return;
    const d = buildDemoData();
    remote = demoAdapter;
    set({
      ready: true,
      mode: "demo",
      meId: "ric",
      viewerId: "ric",
      people: d.people,
      trips: d.trips,
      options: d.options,
      research: d.research,
      itineraryByTrip: d.itineraryByTrip,
    });
  },

  hydrateLive: (data) =>
    set({
      ready: true,
      mode: "live",
      viewerId: data.meId,
      ...data,
    }),

  applyServer: (patch) => set((s) => ({ ...s, ...patch })),

  setViewer: (id) => set({ viewerId: id }),

  rate: (optionId, n) => {
    const { viewerId } = get();
    set((s) => ({
      options: s.options.map((o) =>
        o.id === optionId ? { ...o, votes: { ...o.votes, [viewerId]: n } } : o
      ),
    }));
    void remote.rate(optionId, viewerId, n);
  },

  toggleWinner: (optionId) => {
    const s = get();
    const target = s.options.find((o) => o.id === optionId);
    if (!target) return;
    if (!isHost(s, target.trip, s.viewerId) || useUI.getState().previewAsGuest) {
      useUI.getState().showToast("Solo el anfitrión decide 🔒");
      return;
    }
    const turningOn = !target.winner;
    const single = SINGLE_WINNER_CATS.includes(target.cat);
    set((st) => ({
      options: st.options.map((o) => {
        if (o.id === optionId) return { ...o, winner: turningOn };
        if (turningOn && single && o.trip === target.trip && o.cat === target.cat)
          return { ...o, winner: false };
        return o;
      }),
    }));
    // persist the resulting winner set for this trip+cat
    const winners = get()
      .options.filter((o) => o.trip === target.trip && o.cat === target.cat && o.winner)
      .map((o) => o.id);
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

  convertResearch: (researchId) => {
    const s = get();
    const r = s.research.find((x) => x.id === researchId);
    if (!r || r.converted) return;
    const newId = genId();
    const created: OptionItem = {
      id: newId,
      trip: r.trip,
      cat: r.cat,
      tone: r.tone,
      emoji: "✨",
      title: r.title.slice(0, 28),
      subtitle: r.note.slice(0, 40),
      price: r.cat === "comida" ? 400 : 600,
      unit: r.cat === "hospedaje" ? "total" : "pp",
      priceNote: "estimado",
      meta: [["Fuente", r.saved], ["Estado", "Nueva"]],
      link: r.source,
      winner: false,
      coverUrl: null,
      votes: { [s.viewerId]: 4 },
    };
    set((st) => ({
      options: [...st.options, created],
      research: st.research.map((x) => (x.id === researchId ? { ...x, converted: newId } : x)),
    }));
    useUI.getState().showToast("Convertida en opción ⭐ ¡ya pueden votarla!");
    void remote.convertResearch(researchId, created);
  },

  createTrip: (draft) => {
    const id = genId();
    const { viewerId } = get();
    const trip: Trip = {
      id,
      name: draft.name,
      sub: draft.sub,
      tone: draft.tone,
      emoji: draft.emoji,
      status: "planeando",
      dates: draft.dates,
      startDate: draft.startDate ?? null,
      endDate: draft.endDate ?? null,
      daysLeft: computeDaysLeft(draft.startDate),
      people: draft.people,
      goalPerPerson: 9000,
      active: true,
      coverUrl: null,
      memberIds: [viewerId],
      memberInfo: { [viewerId]: { role: "host", confirmed: true } },
      ownerId: viewerId,
    };
    set((s) => ({
      trips: [...s.trips.map((t) => ({ ...t, active: false })), trip],
    }));
    useUI.getState().showToast("¡Viaje creado! 🌴 Agrega opciones");
    void remote.createTrip(trip);
    return id;
  },

  addGuest: (tripId, name) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const id = genId();
    const { people } = get();
    const person: Person = {
      id,
      name: trimmed,
      initials: trimmed[0]?.toUpperCase() || "?",
      color: PALETTE[people.length % PALETTE.length],
      confirmed: false,
    };
    set((s) => ({
      people: [...s.people, person],
      trips: s.trips.map((t) =>
        t.id === tripId
          ? { ...t, memberIds: [...t.memberIds, id], memberInfo: { ...t.memberInfo, [id]: { role: "guest", confirmed: false } } }
          : t
      ),
    }));
    useUI.getState().showToast(`${trimmed} fue invitado 🎉`);
    void remote.addGuest(tripId, person);
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
}));

/* ---------------------------- selectors ---------------------------- */

/** Minimal data slice the selector helpers need (DataState satisfies this). */
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

/** A person is host of a trip per their membership role (or trip owner). */
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
      return {
        ...p,
        host: info ? info.role === "host" : isHost(s, tripId, p.id),
        confirmed: info ? info.confirmed : p.confirmed,
      };
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
  return computeBudget(optionsOf(s, tripId), membersOf(s, tripId), count);
}
