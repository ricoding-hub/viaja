"use client";
import { Av, Icon } from "@/components/ui";
import type { Person } from "@/lib/types";

/** Pill showing the current viewer's role; opens the viewer/role sheet. */
export function ViewerChip({ person, onClick, dark }: { person?: Person; onClick: () => void; dark?: boolean }) {
  if (!person) return null;
  return (
    <button
      type="button"
      onClick={onClick}
      className="row center gap6"
      style={{
        border: 0,
        cursor: "pointer",
        padding: "5px 10px 5px 5px",
        borderRadius: 99,
        background: dark ? "rgba(255,255,255,.85)" : "#fff",
        backdropFilter: dark ? "blur(6px)" : undefined,
        boxShadow: "var(--sh-sm)",
        color: "var(--ink)",
      }}
    >
      <Av p={person} size={26} />
      <span style={{ fontFamily: "var(--font-d)", fontWeight: 700, fontSize: 13 }}>
        {person.host ? "Anfitrión" : "Invitado"}
      </span>
      <Icon name="chevD" size={16} color="var(--ink-soft)" />
    </button>
  );
}
