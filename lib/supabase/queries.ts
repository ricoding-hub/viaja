import type { SupabaseClient } from "@supabase/supabase-js";
import { formatDateRange } from "@/lib/dates";
import { computeDaysLeft } from "@/lib/seed";
import type {
  ItineraryDay,
  MemberInfo,
  OptionItem,
  Person,
  ResearchItem,
  Trip,
  TripStatus,
} from "@/lib/types";

export interface LiveData {
  meId: string;
  people: Person[];
  trips: Trip[];
  options: OptionItem[];
  research: ResearchItem[];
  itineraryByTrip: Record<string, ItineraryDay[]>;
}

const STATUS_ORDER: Record<TripStatus, number> = { planeando: 0, idea: 1, completado: 2 };

/** Fetch the current user's full dataset (RLS scopes it to their trips). */
export async function fetchAllData(supabase: SupabaseClient): Promise<LiveData> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No hay sesión activa.");

  const [profiles, trips, members, options, votes, research, days, items] = await Promise.all([
    supabase.from("profiles").select("*"),
    supabase.from("trips").select("*"),
    supabase.from("trip_members").select("*"),
    supabase.from("options").select("*"),
    supabase.from("votes").select("*"),
    supabase.from("research").select("*"),
    supabase.from("itinerary_days").select("*"),
    supabase.from("itinerary_items").select("*"),
  ]);

  const profileRows = profiles.data ?? [];
  const nameById: Record<string, string> = {};
  const people: Person[] = profileRows.map((p) => {
    nameById[p.id] = p.name;
    return { id: p.id, name: p.name, initials: p.initials, color: p.color, avatarUrl: p.avatar_url };
  });
  const meId = profileRows.find((p) => p.user_id === user.id)?.id ?? "";

  // members grouped by trip
  const memberIds: Record<string, string[]> = {};
  const memberInfo: Record<string, Record<string, MemberInfo>> = {};
  for (const m of members.data ?? []) {
    (memberIds[m.trip_id] ||= []).push(m.user_id);
    (memberInfo[m.trip_id] ||= {})[m.user_id] = { role: m.role, confirmed: m.confirmed };
  }

  // votes grouped by option
  const votesByOption: Record<string, Record<string, number>> = {};
  for (const v of votes.data ?? []) {
    (votesByOption[v.option_id] ||= {})[v.user_id] = v.rating;
  }

  const mappedOptions: OptionItem[] = (options.data ?? []).map((o) => ({
    id: o.id,
    trip: o.trip_id,
    cat: o.cat,
    tone: o.tone,
    emoji: o.emoji,
    title: o.title,
    subtitle: o.subtitle,
    price: o.price,
    unit: o.unit,
    priceNote: o.price_note,
    meta: (o.meta ?? []) as [string, string][],
    link: o.link,
    winner: o.winner,
    coverUrl: o.cover_url,
    votes: votesByOption[o.id] ?? {},
  }));

  const mappedResearch: ResearchItem[] = (research.data ?? []).map((r) => ({
    id: r.id,
    trip: r.trip_id,
    type: r.type,
    cat: r.cat,
    tone: r.tone,
    title: r.title,
    source: r.source,
    note: r.note,
    amount: r.amount ?? null,
    saved: r.saved_by ? nameById[r.saved_by] ?? "Alguien" : "Alguien",
    savedById: r.saved_by ?? undefined,
    converted: r.converted_option_id,
  }));

  // itinerary
  const itemsByDay: Record<string, { id: string; idx: number; emoji: string; text: string; option_id: string | null }[]> = {};
  for (const it of items.data ?? []) (itemsByDay[it.day_id] ||= []).push(it);
  const itineraryByTrip: Record<string, ItineraryDay[]> = {};
  for (const d of days.data ?? []) {
    const dayItems = (itemsByDay[d.id] ?? [])
      .sort((a, b) => a.idx - b.idx)
      .map((i) => ({ id: i.id, emoji: i.emoji, text: i.text, optionId: i.option_id ?? null }));
    (itineraryByTrip[d.trip_id] ||= []).push({ id: d.id, day: d.day, date: d.date, title: d.title, tone: d.tone, items: dayItems });
  }
  for (const k of Object.keys(itineraryByTrip)) itineraryByTrip[k].sort((a, b) => a.day - b.day);

  const mappedTrips: Trip[] = (trips.data ?? []).map((t) => ({
    id: t.id,
    name: t.name,
    sub: t.sub,
    tone: t.tone,
    emoji: t.emoji,
    status: t.status,
    startDate: t.start_date,
    endDate: t.end_date,
    dates: formatDateRange(t.start_date, t.end_date),
    daysLeft: computeDaysLeft(t.start_date),
    people: t.people_count,
    goalPerPerson: t.goal_per_person,
    coverUrl: t.cover_url,
    memberIds: memberIds[t.id] ?? [],
    memberInfo: memberInfo[t.id] ?? {},
    ownerId: t.owner_id,
    active: false,
  }));

  // featured = planeando first, then by soonest start date
  mappedTrips.sort((a, b) => {
    const s = STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
    if (s !== 0) return s;
    return (a.startDate || "9999").localeCompare(b.startDate || "9999");
  });
  if (mappedTrips[0]) mappedTrips[0].active = true;

  return { meId, people, trips: mappedTrips, options: mappedOptions, research: mappedResearch, itineraryByTrip };
}
