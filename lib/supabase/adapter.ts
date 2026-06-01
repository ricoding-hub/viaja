import type { SupabaseClient } from "@supabase/supabase-js";
import { useUI } from "@/store/ui";
import type { RemoteAdapter, TripPatch } from "@/lib/store";

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
      const { error } = await supabase.from("votes").upsert({ option_id: optionId, user_id: userId, rating: n }, { onConflict: "option_id,user_id" });
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
        id: item.id, trip_id: item.trip, type: item.type, cat: item.cat, tone: item.tone,
        title: item.title, source: item.source, note: item.note, saved_by: item.savedById ?? null,
      });
      warn(error);
    },

    async convertResearch(researchId, option) {
      const { error: e1 } = await supabase.from("options").insert({
        id: option.id, trip_id: option.trip, cat: option.cat, tone: option.tone, emoji: option.emoji,
        title: option.title, subtitle: option.subtitle, price: option.price, unit: option.unit,
        price_note: option.priceNote, meta: option.meta, link: option.link, winner: false, from_research_id: researchId,
      });
      const { error: e2 } = await supabase.from("research").update({ converted_option_id: option.id }).eq("id", researchId);
      let e3: unknown = null;
      const entry = Object.entries(option.votes)[0];
      if (entry) {
        const r = await supabase.from("votes").upsert({ option_id: option.id, user_id: entry[0], rating: entry[1] }, { onConflict: "option_id,user_id" });
        e3 = r.error;
      }
      warn(e1 || e2 || e3);
    },

    async createTrip(trip) {
      const { error: e1 } = await supabase.from("trips").insert({
        id: trip.id, owner_id: trip.ownerId, name: trip.name, sub: trip.sub, tone: trip.tone, emoji: trip.emoji,
        status: trip.status, start_date: trip.startDate ?? null, end_date: trip.endDate ?? null,
        people_count: trip.people, goal_per_person: trip.goalPerPerson, cover_url: trip.coverUrl ?? null,
      });
      const { error: e2 } = await supabase.from("trip_members").insert({ trip_id: trip.id, user_id: trip.ownerId, role: "host", confirmed: true });
      warn(e1 || e2);
    },

    async updateTrip(tripId, patch: TripPatch) {
      const db: Record<string, unknown> = {};
      if (patch.name != null) db.name = patch.name;
      if (patch.sub != null) db.sub = patch.sub;
      if (patch.tone != null) db.tone = patch.tone;
      if (patch.emoji != null) db.emoji = patch.emoji;
      if (patch.status != null) db.status = patch.status;
      if ("startDate" in patch) db.start_date = patch.startDate ?? null;
      if ("endDate" in patch) db.end_date = patch.endDate ?? null;
      if (patch.people != null) db.people_count = patch.people;
      if (Object.keys(db).length === 0) return;
      const { error } = await supabase.from("trips").update(db).eq("id", tripId);
      warn(error);
    },

    async deleteTrip(tripId) {
      const { error } = await supabase.from("trips").delete().eq("id", tripId);
      warn(error);
    },

    async leaveTrip(tripId, userId) {
      const { error } = await supabase.from("trip_members").delete().eq("trip_id", tripId).eq("user_id", userId);
      warn(error);
    },

    async setMemberRole(tripId, userId, role) {
      const { error } = await supabase.from("trip_members").update({ role }).eq("trip_id", tripId).eq("user_id", userId);
      warn(error);
    },

    async removeMember(tripId, userId) {
      const { error } = await supabase.from("trip_members").delete().eq("trip_id", tripId).eq("user_id", userId);
      warn(error);
    },

    async setPeopleCount(tripId, n) {
      const { error } = await supabase.from("trips").update({ people_count: n }).eq("id", tripId);
      warn(error);
    },

    async setConfirm(tripId, userId, confirmed) {
      const { error } = await supabase.from("trip_members").update({ confirmed }).eq("trip_id", tripId).eq("user_id", userId);
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

    async updateProfile(userId, fields) {
      const { error } = await supabase.from("profiles").update(fields).eq("id", userId);
      warn(error);
    },
  };
}
