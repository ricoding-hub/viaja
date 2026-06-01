"use client";
import { useEffect } from "react";
import { useData } from "@/lib/store";

/**
 * Client bootstrap. In demo mode (no Supabase env) it loads the in-memory
 * dataset. In live mode the server layout hydrates the store first (Phase 7);
 * this still runs the demo fallback if hydration hasn't happened.
 */
export function AppProviders({ children }: { children: React.ReactNode }) {
  const ready = useData((s) => s.ready);
  const bootstrapDemo = useData((s) => s.bootstrapDemo);

  useEffect(() => {
    if (!ready) bootstrapDemo();
  }, [ready, bootstrapDemo]);

  return <>{children}</>;
}
