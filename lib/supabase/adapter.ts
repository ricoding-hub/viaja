import type { SupabaseClient } from "@supabase/supabase-js";
import { useUI } from "@/store/ui";
import type { RemoteAdapter } from "@/lib/store";

function warn(error: unknown) {
  if (error) {
    console.error("[viaja] supabase write failed:", error);
    useUI.getState().showToast("No se pudo guardar 🔌");
  }
}

/** RemoteAdapter backed by Supabase. Writes persist; realtime reconciles reads. */
export function makeAdapter(supabase: SupabaseClient): RemoteAdapter {
  return {
    async rate(optionId, userId, n) {
      const { error } = await supabase
        .from("votes")
        .upsert({ option_id: optionId, user_id: userId, rating: n }, { onConflict: "option_id,user_id" });
      warn(error);
    },

    async setWinners(tripId, cat, winnerIds) {
      const { error: e1 } = await supabase.from("options").update({ winner: false }).eq("trip_id", tripId).eq("cat", cat);
      let e2: unknown = null;
      if (winnerIds.length) {
        const r = await supabase.from("options").update({ winner: true }).in("id", winnerIds);
        e2 = r.error;
      }
      warn(e1 || e2);
    },

    async addResearch(item) {
      const { error } = await supabase.from("research").insert({
        id: item.id,
        trip_id: item.trip,
        type: item.type,
        cat: item.cat,
        tone: item.tone,
        title: item.title,
        source: item.source,
        note: item.note,
        saved_by: item.savedById ?? null,
      });
      warn(error);
    },

    async convertResearch(researchId, option) {
      const { error: e1 } = await supabase.from("options").insert({
        id: option.id,
        trip_id: option.trip,
        cat: option.cat,
        tone: option.tone,
        emoji: option.emoji,
        title: option.title,
        subtitle: option.subtitle,
        price: option.price,
        unit: option.unit,
        price_note: option.priceNote,
        meta: option.meta,
        link: option.link,
        winner: false,
        from_research_id: researchId,
      });
      const { error: e2 } = await supabase.from("research").update({ converted_option_id: option.id }).eq("id", researchId);
      // seed the converter's vote (votes map is { [meId]: 4 })
      let e3: unknown = null;
      const entry = Object.entries(option.votes)[0];
      if (entry) {
        const r = await supabase
          .from("votes")
          .upsert({ option_id: option.id, user_id: entry[0], rating: entry[1] }, { onConflict: "option_id,user_id" });
        e3 = r.error;
      }
      warn(e1 || e2 || e3);
    },

    async createTrip(trip) {
      const { error: e1 } = await supabase.from("trips").insert({
        id: trip.id,
        owner_id: trip.ownerId,
        name: trip.name,
        sub: trip.sub,
        tone: trip.tone,
        emoji: trip.emoji,
        status: trip.status,
        start_date: trip.startDate ?? null,
        end_date: trip.endDate ?? null,
        people_count: trip.people,
        goal_per_person: trip.goalPerPerson,
      });
      const { error: e2 } = await supabase
        .from("trip_members")
        .insert({ trip_id: trip.id, user_id: trip.ownerId, role: "host", confirmed: true });
      warn(e1 || e2);
    },

    async addGuest(tripId, person) {
      const { error: e1 } = await supabase
        .from("profiles")
        .insert({ id: person.id, name: person.name, initials: person.initials, color: person.color, is_demo: true });
      const { error: e2 } = await supabase
        .from("trip_members")
        .insert({ trip_id: tripId, user_id: person.id, role: "guest", confirmed: false });
      warn(e1 || e2);
    },

    async setPeopleCount(tripId, n) {
      const { error } = await supabase.from("trips").update({ people_count: n }).eq("id", tripId);
      warn(error);
    },

    async setConfirm(tripId, userId, confirmed) {
      const { error } = await supabase
        .from("trip_members")
        .update({ confirmed })
        .eq("trip_id", tripId)
        .eq("user_id", userId);
      warn(error);
    },

    async setCover(tripId, url) {
      const { error } = await supabase.from("trips").update({ cover_url: url }).eq("id", tripId);
      warn(error);
    },

    async setOptionCover(optionId, url) {
      const { error } = await supabase.from("options").update({ cover_url: url }).eq("id", optionId);
      warn(error);
    },
  };
}
