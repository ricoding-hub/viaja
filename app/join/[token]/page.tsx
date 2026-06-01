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
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        const target = `/join/${tripId}${role === "host" ? "?role=host" : ""}`;
        router.replace(`/login?next=${encodeURIComponent(target)}`);
        return;
      }
      const { data: prof } = await supabase.from("profiles").select("id").eq("user_id", user.id).single();
      if (prof) {
        await supabase
          .from("trip_members")
          .upsert({ trip_id: tripId, user_id: prof.id, role, confirmed: false }, { onConflict: "trip_id,user_id", ignoreDuplicates: true });
      }
      try {
        const [{ fetchAllData }, { useData }] = await Promise.all([import("@/lib/supabase/queries"), import("@/lib/store")]);
        useData.getState().hydrateLive(await fetchAllData(supabase));
      } catch {
        /* realtime will reconcile */
      }
      router.replace(`/trip/${tripId}`);
    })().catch(() => setMsg("No se pudo unir al viaje. Revisa el enlace."));
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
