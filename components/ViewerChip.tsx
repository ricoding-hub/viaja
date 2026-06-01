"use client";
import { Av, Icon } from "@/components/ui";
import type { Person } from "@/lib/types";

/** Glass pill showing the current user; tap to open the profile sheet. */
export function ViewerChip({ person, onClick, dark }: { person?: Person; onClick: () => void; dark?: boolean }) {
  if (!person) return null;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Tu perfil"
      className="row center gap6"
      style={{
        border: 0,
        cursor: "pointer",
        padding: "5px 10px 5px 5px",
        borderRadius: 99,
        background: dark ? "rgba(255,255,255,.92)" : "#fff",
        backdropFilter: dark ? "blur(8px)" : undefined,
        boxShadow: "var(--sh-sm)",
        color: "var(--ink)",
        maxWidth: 150,
      }}
    >
      <Av p={person} size={26} />
      <span className="ellip" style={{ fontFamily: "var(--font-d)", fontWeight: 700, fontSize: 13 }}>{person.name}</span>
      <Icon name="chevD" size={15} color="var(--ink-soft)" />
    </button>
  );
}
