"use client";
import { InviteSheet } from "./InviteSheet";
import { ViewerSwitch } from "./ViewerSwitch";
import { useUI } from "@/store/ui";

/** Trip-scoped sheets (invite, role switch). Rendered in the trip layout. */
export function TripSheets({ tripId }: { tripId: string }) {
  const sheet = useUI((s) => s.sheet);
  return (
    <>
      <InviteSheet open={sheet === "invite"} tripId={tripId} />
      <ViewerSwitch open={sheet === "viewer"} tripId={tripId} />
    </>
  );
}
