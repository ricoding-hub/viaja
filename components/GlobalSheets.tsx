"use client";
import { CreateTrip } from "./CreateTrip";
import { useUI } from "@/store/ui";

/** Sheets available app-wide (create-trip). Rendered once in the root layout. */
export function GlobalSheets() {
  const sheet = useUI((s) => s.sheet);
  return <CreateTrip open={sheet === "create"} />;
}
