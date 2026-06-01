import type { ItineraryDay, OptionItem, Person, ResearchItem, Trip } from "./types";

/** Days until a yyyy-mm-dd date from today (null if no date). */
export function computeDaysLeft(startDate?: string | null): number | null {
  if (!startDate) return null;
  const d = new Date(startDate + "T00:00:00");
  if (isNaN(d.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const days = Math.ceil((d.getTime() - today.getTime()) / 86400000);
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
 * Demo mode (no Supabase env) starts CLEAN — just the current user, no example
 * trips. Creating a trip makes you host; joining via an invite link makes you a
 * guest. (Live mode loads real data from Supabase.)
 */
export function buildDemoData(): DemoData {
  const people: Person[] = [{ id: "me", name: "Tú", initials: "T", color: "#11BFB2", host: true }];
  return { people, trips: [], options: [], research: [], itineraryByTrip: {} };
}
