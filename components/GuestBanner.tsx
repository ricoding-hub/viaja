"use client";
import { Av } from "@/components/ui";
import type { Person } from "@/lib/types";

/** Reminds a guest they can vote but not decide. */
export function GuestBanner({ person }: { person?: Person }) {
  if (!person) return null;
  return (
    <div
      className="row center gap10"
      style={{
        margin: "0 0 14px",
        padding: "11px 13px",
        borderRadius: 16,
        background: "radial-gradient(118% 150% at 50% 0%, var(--grape-soft), #fff)",
        border: "1px solid var(--line)",
      }}
    >
      <Av p={person} size={30} />
      <p style={{ fontSize: 12.5, lineHeight: 1.4, color: "var(--ink-2)" }}>
        Estás viendo como <b>{person.name}</b> · puedes votar ⭐ pero no decidir.
      </p>
    </div>
  );
}
