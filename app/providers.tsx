"use client";
import { useEffect } from "react";
import { useData } from "@/lib/store";
import { isSupabaseConfigured } from "@/lib/supabase/env";

/**
 * Client bootstrap. Demo mode (no Supabase env) is already seeded at store
 * init; live mode loads the signed-in user's data + subscribes to realtime.
 */
export function AppProviders({ children }: { children: React.ReactNode }) {
  const ready = useData((s) => s.ready);
  const bootstrapDemo = useData((s) => s.bootstrapDemo);

  useEffect(() => {
    let cleanup = () => {};
    if (isSupabaseConfigured()) {
      import("@/lib/supabase/live")
        .then((m) => m.bootstrapLive())
        .then((fn) => {
          cleanup = fn;
        })
        .catch((e) => console.error("[viaja] live bootstrap failed", e));
    } else if (!ready) {
      bootstrapDemo();
    }
    return () => cleanup();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <>{children}</>;
}
