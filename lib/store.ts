"use client";
import { create } from "zustand";
import { useUI } from "@/store/ui";
import { computeBudget } from "./budget";
import { SINGLE_WINNER_CATS } from "./constants";
import { buildDemoData, computeDaysLeft } from "./seed";
import { isSupabaseConfigured } from "./supabase/env";
import type {
  Budget,
  Cat,
  ItineraryDay,
  MemberRole,
  OptionItem,
  Person,
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
}>;
export type ProfilePatch = { name?: string; color?: string };

export interface RemoteAdapter {
  rate(optionId: string, userId: string, n: number): Promise<void>;
  setWinners(tripId: string, cat: Cat, winnerIds: string[]): Promise<void>;
  addResearch(item: ResearchItem): Promise<void>;
  convertResearch(researchId: string, option: OptionItem): Promise<void>;
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
  updateProfile(userId: string, fields: { name?: string; initials?: string; color?: string }): Promise<void>;
}
const noop = async () => {};
const demoAdapter: RemoteAdapter = {
  rate: noop, setWinners: noop, addResearch: noop, convertResearch: noop, createTrip: noop,
  updateTrip: noop, deleteTrip: noop, leaveTrip: noop, setMemberRole: noop, removeMember: noop,
  setPeopleCount: noop, setConfirm: noop, setCover: noop, setOptionCover: noop, updateProfile: noop,
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
  convertResearch: (researchId: string) => void;
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

  convertResearch: (researchId) => {
    const s = get();
    const r = s.research.find((x) => x.id === researchId);
    if (!r || r.converted) return;
    const newId = genId();
    const created: OptionItem = {
      id: newId, trip: r.trip, cat: r.cat, tone: r.tone, emoji: "✨",
      title: r.title.slice(0, 28), subtitle: r.note.slice(0, 40),
      price: r.cat === "comida" ? 400 : 600, unit: r.cat === "hospedaje" ? "total" : "pp",
      priceNote: "estimado", meta: [["Fuente", r.saved], ["Estado", "Nueva"]],
      link: r.source, winner: false, coverUrl: null, votes: { [s.viewerId]: 4 },
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

  updateProfile: (patch) => {
    const { meId } = get();
    const fields: { name?: string; initials?: string; color?: string } = {};
    if (patch.name != null) {
      fields.name = patch.name.trim();
      fields.initials = initialsOf(patch.name);
    }
    if (patch.color != null) fields.color = patch.color;
    set((s) => ({ people: s.people.map((p) => (p.id === meId ? { ...p, ...fields } : p)) }));
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
  return computeBudget(optionsOf(s, tripId), membersOf(s, tripId), count);
}
