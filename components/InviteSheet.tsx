"use client";
import { useState } from "react";
import { Icon, Sheet } from "@/components/ui";
import { useTrip } from "@/lib/hooks";
import { useUI } from "@/store/ui";
import { SITE_URL } from "@/lib/supabase/env";

export function InviteSheet({ open, tripId }: { open: boolean; tripId: string }) {
  const { trip, isHost } = useTrip(tripId);
  const showToast = useUI((s) => s.showToast);
  const closeSheet = useUI((s) => s.closeSheet);
  const [role, setRole] = useState<"guest" | "host">("guest");

  const link = `${SITE_URL}/join/${tripId}` + (role === "host" ? "?role=host" : "");

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
    } catch {
      /* ignore */
    }
    showToast("Link copiado 🔗");
  };
  const share = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: `Únete a ${trip?.name ?? "mi viaje"} 🌴`, text: "Organicemos este viaje juntos en Viaja", url: link });
      } catch {
        /* user cancelled */
      }
    } else {
      copy();
    }
  };

  return (
    <Sheet open={open} onClose={closeSheet}>
      <h2 className="h2">Invitar al viaje 🌴</h2>
      <p className="muted" style={{ fontSize: 13, margin: "4px 0 14px" }}>
        Comparte el link para que se unan a <b>{trip?.name}</b>.
      </p>

      {isHost && (
        <div className="col gap8" style={{ marginBottom: 14 }}>
          <span className="field-label">Invitar como</span>
          <div className="seg">
            <button className={role === "guest" ? "on" : ""} onClick={() => setRole("guest")}>Invitado</button>
            <button className={role === "host" ? "on" : ""} onClick={() => setRole("host")}>Organizador</button>
          </div>
        </div>
      )}

      <div className="card card-p row center between" style={{ padding: 12, marginBottom: 12, gap: 8 }}>
        <span className="row center gap8 ellip">
          <Icon name="link" size={18} color="var(--turq)" />
          <span className="ellip" style={{ fontSize: 13 }}>{link}</span>
        </span>
        <button className="btn btn-ghost btn-sm" onClick={copy}>Copiar</button>
      </div>

      <button className="btn btn-turq btn-block" onClick={share}>
        <Icon name="share" size={18} color="#fff" /> Compartir link
      </button>

      <p className="muted" style={{ fontSize: 12, marginTop: 12 }}>
        {role === "host" ? "👑 Quien use este link será organizador y podrá decidir." : "Quien use este link entra como invitado y puede votar ⭐."}
      </p>
    </Sheet>
  );
}
