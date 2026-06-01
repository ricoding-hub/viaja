"use client";
import { Av, Icon, Sheet } from "@/components/ui";
import { useData } from "@/lib/store";
import { useActions, useTrip } from "@/lib/hooks";
import { useUI } from "@/store/ui";

/**
 * Role sheet. In demo mode you can "become" any member to demonstrate the
 * host/guest model. In live mode a host can toggle a guest preview instead.
 */
export function ViewerSwitch({ open, tripId }: { open: boolean; tripId: string }) {
  const mode = useData((s) => s.mode);
  const { members, viewerId, actualHost } = useTrip(tripId);
  const { setViewer } = useActions();
  const closeSheet = useUI((s) => s.closeSheet);
  const previewAsGuest = useUI((s) => s.previewAsGuest);
  const setPreviewAsGuest = useUI((s) => s.setPreviewAsGuest);

  return (
    <Sheet open={open} onClose={closeSheet}>
      <h2 style={{ fontSize: 22 }}>Ver la app como…</h2>
      <p className="muted" style={{ fontSize: 13, margin: "4px 0 14px" }}>
        El anfitrión decide; los invitados ven y votan ⭐.
      </p>

      {mode === "demo" ? (
        <div className="col gap8">
          {members.map((p) => {
            const on = p.id === viewerId;
            return (
              <button
                key={p.id}
                type="button"
                className="row center between card card-p"
                style={{ border: on ? "2px solid var(--turq)" : "1px solid var(--line)", cursor: "pointer", padding: 12 }}
                onClick={() => {
                  setViewer(p.id);
                  setPreviewAsGuest(false);
                  closeSheet();
                }}
              >
                <span className="row center gap10">
                  <Av p={p} size={36} />
                  <span className="col" style={{ alignItems: "flex-start" }}>
                    <b style={{ fontFamily: "var(--font-d)" }}>{p.name}</b>
                    <span className="muted" style={{ fontSize: 12 }}>{p.host ? "Decide" : "Vota"}</span>
                  </span>
                </span>
                {on && <Icon name="check" size={20} color="var(--turq-deep)" />}
              </button>
            );
          })}
        </div>
      ) : actualHost ? (
        <button
          type="button"
          className="row center between card card-p"
          style={{ width: "100%", cursor: "pointer", padding: 14 }}
          onClick={() => setPreviewAsGuest(!previewAsGuest)}
        >
          <span className="col" style={{ alignItems: "flex-start" }}>
            <b style={{ fontFamily: "var(--font-d)" }}>Vista previa como invitado</b>
            <span className="muted" style={{ fontSize: 12 }}>Oculta los controles de anfitrión.</span>
          </span>
          <span className="tag tag-turq">{previewAsGuest ? "Activado" : "Desactivado"}</span>
        </button>
      ) : (
        <p className="muted" style={{ fontSize: 13 }}>Eres invitado en este viaje: puedes votar ⭐.</p>
      )}
    </Sheet>
  );
}
