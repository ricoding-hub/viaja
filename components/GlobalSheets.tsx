"use client";
import { CreateTrip } from "./CreateTrip";
import { ProfileSheet } from "./ProfileSheet";
import { useUI } from "@/store/ui";

/** App-wide sheets (create-trip, profile). Rendered once in the shell. */
export function GlobalSheets() {
  const sheet = useUI((s) => s.sheet);
  return (
    <>
      <CreateTrip open={sheet === "create"} />
      <ProfileSheet open={sheet === "profile"} />
    </>
  );
}
