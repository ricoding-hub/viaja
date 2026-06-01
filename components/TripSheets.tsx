"use client";
import { InviteSheet } from "./InviteSheet";
import { TripSettingsSheet } from "./TripSettingsSheet";
import { useUI } from "@/store/ui";

/** Trip-scoped sheets (invite, settings). Rendered in the trip layout. */
export function TripSheets({ tripId }: { tripId: string }) {
  const sheet = useUI((s) => s.sheet);
  return (
    <>
      <InviteSheet open={sheet === "invite"} tripId={tripId} />
      <TripSettingsSheet open={sheet === "settings"} tripId={tripId} />
    </>
  );
}
