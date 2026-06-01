"use client";
import { useState } from "react";
import { Icon, Sheet } from "@/components/ui";
import { useActions, useTrip } from "@/lib/hooks";
import { useUI } from "@/store/ui";
import { SITE_URL } from "@/lib/supabase/env";

export function InviteSheet({ open, tripId }: { open: boolean; tripId: string }) {
  const { trip, isHost } = useTrip(tripId);
  const { addGuest } = useActions();
  const showToast = useUI((s) => s.showToast);
  const closeSheet = useUI((s) => s.closeSheet);
  const [name, setName] = useState("");

  const link = `${SITE_URL}/join/${tripId}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
    } catch {
      /* ignore */
    }
    showToast("Link copiado 🔗");
  };

  const channels: [string, string][] = [
    ["WhatsApp", "#25D366"],
    ["Mensajes", "#0E8AA6"],
    ["Copiar", "#7C6CF0"],
  ];

  return (
    <Sheet open={open} onClose={closeSheet}>
      <h2 style={{ fontSize: 22 }}>Invitar al viaje 🌴</h2>
      <p className="muted" style={{ fontSize: 13, margin: "4px 0 14px" }}>
        Comparte el link para que se unan a <b>{trip?.name}</b>.
      </p>

      <div className="row center between card card-p" style={{ padding: 12, marginBottom: 12 }}>
        <span className="row center gap8 ellip">
          <Icon name="link" size={18} color="var(--turq)" />
          <span className="ellip" style={{ fontSize: 13 }}>{link}</span>
        </span>
        <button className="btn btn-turq btn-sm" onClick={copy}>Copiar</button>
      </div>

      <div className="row gap8" style={{ marginBottom: 18 }}>
        {channels.map(([label, col]) => (
          <button
            key={label}
            type="button"
            className="col center card"
            style={{ flex: 1, padding: "14px 6px", gap: 6, cursor: "pointer" }}
            onClick={() => {
              if (label === "Copiar") copy();
              else showToast(`Compartido por ${label} ✓`);
            }}
          >
            <span style={{ width: 34, height: 34, borderRadius: 11, background: col + "22", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon name="share" size={18} color={col} />
            </span>
            <span style={{ fontSize: 12, fontFamily: "var(--font-d)", fontWeight: 700 }}>{label}</span>
          </button>
        ))}
      </div>

      {isHost && (
        <>
          <p className="kicker" style={{ marginBottom: 8 }}>O agrega a alguien</p>
          <div className="row gap8">
            <input
              className="input"
              placeholder="Nombre de tu invitado"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <button
              className="btn btn-coral"
              disabled={!name.trim()}
              onClick={() => {
                addGuest(tripId, name);
                setName("");
              }}
            >
              Agregar
            </button>
          </div>
        </>
      )}
    </Sheet>
  );
}
