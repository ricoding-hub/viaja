"use client";
import { getBrowserClient } from "./client";
import { fetchAllData } from "./queries";
import { makeAdapter } from "./adapter";
import { setRemoteAdapter, useData } from "@/lib/store";

/**
 * Live bootstrap: load the signed-in user's data, install the Supabase write
 * adapter, and subscribe to realtime. On any change we debounce-refetch the
 * whole dataset (small per group) so all clients stay consistent. Returns an
 * unsubscribe function.
 */
export async function bootstrapLive(): Promise<() => void> {
  const supabase = getBrowserClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return () => {};

  const data = await fetchAllData(supabase);
  setRemoteAdapter(makeAdapter(supabase));
  useData.getState().hydrateLive(data);

  let timer: ReturnType<typeof setTimeout> | undefined;
  const refetch = () => {
    clearTimeout(timer);
    timer = setTimeout(async () => {
      try {
        useData.getState().hydrateLive(await fetchAllData(supabase));
      } catch (e) {
        console.error("[viaja] realtime refetch failed", e);
      }
    }, 250);
  };

  const channel = supabase.channel("viaja-rt");
  for (const table of ["options", "votes", "trip_members", "research", "trips", "itinerary_days", "itinerary_items"]) {
    channel.on("postgres_changes", { event: "*", schema: "public", table }, refetch);
  }
  channel.subscribe();

  return () => {
    clearTimeout(timer);
    supabase.removeChannel(channel);
  };
}
