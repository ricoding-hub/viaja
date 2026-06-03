"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/supabase/env";

/** Invite link target: /join/<tripId>?role=host|guest. Adds the signed-in user. */
export default function JoinPage() {
  const { token } = useParams<{ token: string }>();
  const tripId = String(token);
  const router = useRouter();
  const [msg, setMsg] = useState("Uniéndote al viaje…");

  useEffect(() => {
    (async () => {
      const role = new URLSearchParams(window.location.search).get("role") === "host" ? "host" : "guest";

      if (!isSupabaseConfigured()) {
        router.replace(`/trip/${tripId}`);
        return;
      }

      const { getBrowserClient } = await import("@/lib/supabase/client");
      const supabase = getBrowserClient();

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        const target = `/join/${tripId}${role === "host" ? "?role=host" : ""}`;
        router.replace(`/login?next=${encodeURIComponent(target)}`);
        return;
      }

      const { error: joinErr } = await supabase.rpc("join_trip", {
        p_trip_id: tripId,
        p_role: role,
      });

      if (joinErr) {
        console.error("[join] rpc failed", joinErr);
        setMsg(`Error al unirse: ${joinErr.code} – ${joinErr.message}`);
        return;
      }

      // Refetch AFTER the upsert so the store has the newly joined trip.
      // This must run last to win any race against AppProviders' bootstrapLive.
      const { refetchLive } = await import("@/lib/supabase/live");
      await refetchLive();

      router.replace(`/trip/${tripId}`);
    })().catch((e) => {
      console.error("[join] unexpected error", e);
      setMsg(`Error inesperado: ${e?.message ?? String(e)}`);
    });
  }, [tripId, router]);

  return (
    <div className="screen">
      <div className="safe-top" />
      <div className="col center" style={{ flex: 1, justifyContent: "center", gap: 14, padding: 24, textAlign: "center" }}>
        <div className="spinner" style={{ width: 30, height: 30 }} />
        <p className="muted">{msg}</p>
      </div>
    </div>
  );
}
