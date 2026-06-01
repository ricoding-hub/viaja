"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/supabase/env";

/** Invite link target: /join/<tripId>. Adds the signed-in user as a member. */
export default function JoinPage() {
  const { token } = useParams<{ token: string }>();
  const tripId = String(token);
  const router = useRouter();
  const [msg, setMsg] = useState("Uniéndote al viaje…");

  useEffect(() => {
    (async () => {
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
        router.replace("/login");
        return;
      }
      const { data: prof } = await supabase.from("profiles").select("id").eq("user_id", user.id).single();
      if (prof) {
        await supabase
          .from("trip_members")
          .upsert({ trip_id: tripId, user_id: prof.id, role: "guest", confirmed: false }, { onConflict: "trip_id,user_id", ignoreDuplicates: true });
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
    <div className="scroll">
      <div className="safe-top" />
      <div className="col center" style={{ flex: 1, justifyContent: "center", gap: 10, padding: 24, textAlign: "center" }}>
        <div className="floaty" style={{ fontSize: 48 }}>🌴</div>
        <p className="muted">{msg}</p>
      </div>
    </div>
  );
}
