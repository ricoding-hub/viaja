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
        title: item.title, source: item.source, note: item.note, amount: item.amount ?? null,
        saved_by: item.savedById ?? null,
      });
      warn(error);
    },

    async updateResearch(id, patch) {
      const db: Record<string, unknown> = {};
      if (patch.title != null) db.title = patch.title;
      if (patch.note != null) db.note = patch.note;
      if (patch.cat != null) db.cat = patch.cat;
      if (patch.source != null) db.source = patch.source;
      if ("amount" in patch) db.amount = patch.amount ?? null;
      if (Object.keys(db).length === 0) return;
      const { error } = await supabase.from("research").update(db).eq("id", id);
      warn(error);
    },

    async deleteResearch(id) {
      const { error } = await supabase.from("research").delete().eq("id", id);
      warn(error);
    },

    async convertResearch(researchId, option) {
      const { error: e1 } = await supabase.from("options").insert({
        id: option.id, trip_id: option.trip, cat: option.cat, tone: option.tone, emoji: option.emoji,
        title: option.title, subtitle: option.subtitle, price: option.price, unit: option.unit,
        price_note: option.priceNote, meta: option.meta, link: option.link, winner: false, from_research_id: researchId,
      });
      const { error: e2 } = await supabase.from("research").update({ converted_option_id: option.id }).eq("id", researchId);
      warn(e1 || e2);
    },

    async addOption(option) {
      const { error } = await supabase.from("options").insert({
        id: option.id, trip_id: option.trip, cat: option.cat, tone: option.tone, emoji: option.emoji,
        title: option.title, subtitle: option.subtitle, price: option.price, unit: option.unit,
        price_note: option.priceNote, meta: option.meta, link: option.link, winner: false,
      });
      warn(error);
    },

    async updateOption(id, patch) {
      const db: Record<string, unknown> = {};
      if (patch.cat != null) db.cat = patch.cat;
      if (patch.title != null) db.title = patch.title;
      if (patch.subtitle != null) db.subtitle = patch.subtitle;
      if (patch.price != null) db.price = patch.price;
      if (patch.unit != null) db.unit = patch.unit;
      if (patch.link != null) db.link = patch.link;
      if (patch.tone != null) db.tone = patch.tone;
      if (patch.emoji != null) db.emoji = patch.emoji;
      if (patch.priceNote != null) db.price_note = patch.priceNote;
      if (patch.meta != null) db.meta = patch.meta;
      if (Object.keys(db).length === 0) return;
      const { error } = await supabase.from("options").update(db).eq("id", id);
      warn(error);
    },

    async deleteOption(id) {
      const { error } = await supabase.from("options").delete().eq("id", id);
      warn(error);
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
      if (patch.goalPerPerson != null) db.goal_per_person = patch.goalPerPerson;
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

    async addItineraryDay(d) {
      const { error } = await supabase.from("itinerary_days").insert({
        id: d.id, trip_id: d.tripId, day: d.day, date: d.date, title: d.title, tone: d.tone,
      });
      warn(error);
    },

    async updateItineraryDay(id, patch) {
      const db: Record<string, unknown> = {};
      if (patch.title != null) db.title = patch.title;
      if (patch.date != null) db.date = patch.date;
      if (patch.tone != null) db.tone = patch.tone;
      if (Object.keys(db).length === 0) return;
      const { error } = await supabase.from("itinerary_days").update(db).eq("id", id);
      warn(error);
    },

    async deleteItineraryDay(id) {
      const { error } = await supabase.from("itinerary_days").delete().eq("id", id);
      warn(error);
    },

    async addItineraryItem(it) {
      const { error } = await supabase.from("itinerary_items").insert({
        id: it.id, day_id: it.dayId, idx: it.idx, emoji: it.emoji, text: it.text, option_id: it.optionId ?? null,
      });
      warn(error);
    },

    async updateItineraryItem(id, patch) {
      const db: Record<string, unknown> = {};
      if (patch.emoji != null) db.emoji = patch.emoji;
      if (patch.text != null) db.text = patch.text;
      if (patch.idx != null) db.idx = patch.idx;
      if (patch.dayId != null) db.day_id = patch.dayId;
      if (Object.keys(db).length === 0) return;
      const { error } = await supabase.from("itinerary_items").update(db).eq("id", id);
      warn(error);
    },

    async deleteItineraryItem(id) {
      const { error } = await supabase.from("itinerary_items").delete().eq("id", id);
      warn(error);
    },
  };
}
