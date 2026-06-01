"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon, Sheet } from "@/components/ui";
import { useActions, useTrip } from "@/lib/hooks";
import { useUI } from "@/store/ui";
import { formatDateRange } from "@/lib/dates";
import { STATUS_OPTIONS, VIBES } from "@/lib/constants";
import type { TripStatus } from "@/lib/types";

export function TripSettingsSheet({ open, tripId }: { open: boolean; tripId: string }) {
  const router = useRouter();
  const { trip, isHost } = useTrip(tripId);
  const { updateTrip, deleteTrip, leaveTrip } = useActions();
  const closeSheet = useUI((s) => s.closeSheet);

  const [name, setName] = useState("");
  const [sub, setSub] = useState("");
  const [vibe, setVibe] = useState(VIBES[0]);
  const [status, setStatus] = useState<TripStatus>("planeando");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [confirmDel, setConfirmDel] = useState(false);

  useEffect(() => {
    if (open && trip) {
      setName(trip.name);
      setSub(trip.sub);
      setVibe(VIBES.find((v) => v.tone === trip.tone) ?? { tone: trip.tone, emoji: trip.emoji, label: "Viaje" });
      setStatus(trip.status);
      setStart(trip.startDate || "");
      setEnd(trip.endDate || "");
      setConfirmDel(false);
    }
  }, [open, trip]);

  if (!open) return null;
  if (!trip) {
    return <Sheet open={open} onClose={closeSheet}><p className="muted">Cargando…</p></Sheet>;
  }

  function saveHost() {
    updateTrip(tripId, {
      name: name.trim() || trip!.name,
      sub,
      tone: vibe.tone,
      emoji: vibe.emoji,
      status,
      startDate: start || null,
      endDate: end || null,
      dates: formatDateRange(start, end),
    });
    closeSheet();
  }
  function del() {
    closeSheet();
    deleteTrip(tripId);
    router.push("/");
  }
  function leave() {
    closeSheet();
    leaveTrip(tripId);
    router.push("/");
  }

  return (
    <Sheet open={open} onClose={closeSheet}>
      <h2 className="h2">Ajustes del viaje</h2>

      {isHost ? (
        <div className="col gap14" style={{ marginTop: 14 }}>
          <label className="col gap8">
            <span className="field-label">Nombre</span>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} maxLength={60} />
          </label>
          <label className="col gap8">
            <span className="field-label">Subtítulo</span>
            <input className="input" value={sub} onChange={(e) => setSub(e.target.value)} maxLength={60} placeholder="Ej. Cumple en la playa 🎂" />
          </label>
          <div className="field-row">
            <label className="col gap8">
              <span className="field-label">Llegada</span>
              <input type="date" className="input" value={start} onChange={(e) => setStart(e.target.value)} />
            </label>
            <label className="col gap8">
              <span className="field-label">Salida</span>
              <input type="date" className="input" value={end} min={start || undefined} onChange={(e) => setEnd(e.target.value)} />
            </label>
          </div>

          <div className="col gap8">
            <span className="field-label">Vibra</span>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
              {VIBES.map((v) => (
                <button key={v.tone} type="button" className="col center" style={{ gap: 4, padding: "12px 6px", borderRadius: 14, cursor: "pointer", background: "#fff", border: vibe.tone === v.tone ? "2px solid var(--turq)" : "1px solid var(--line)" }} onClick={() => setVibe(v)}>
                  <span style={{ fontSize: 22 }}>{v.emoji}</span>
                  <span style={{ fontSize: 11.5, fontFamily: "var(--font-d)", fontWeight: 700 }}>{v.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="col gap8">
            <span className="field-label">Estado</span>
            <div className="seg">
              {STATUS_OPTIONS.map((s) => (
                <button key={s.value} className={status === s.value ? "on" : ""} onClick={() => setStatus(s.value)}>{s.label}</button>
              ))}
            </div>
          </div>

          <button className="btn btn-turq btn-block" onClick={saveHost}>Guardar cambios</button>

          <div className="hairline" />
          {!confirmDel ? (
            <button className="btn btn-ghost btn-block" style={{ color: "var(--coral-deep)" }} onClick={() => setConfirmDel(true)}>
              <Icon name="trash" size={18} color="var(--coral-deep)" /> Eliminar viaje
            </button>
          ) : (
            <div className="col gap10">
              <p className="muted" style={{ fontSize: 13 }}>¿Eliminar <b>{trip.name}</b> y todo su contenido? No se puede deshacer.</p>
              <div className="row gap8">
                <button className="btn btn-ghost grow" onClick={() => setConfirmDel(false)}>Cancelar</button>
                <button className="btn btn-coral grow" onClick={del}>Sí, eliminar</button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="col gap12" style={{ marginTop: 14 }}>
          <p className="muted" style={{ fontSize: 14 }}>Eres invitado en este viaje. Puedes votar ⭐ las opciones.</p>
          <button className="btn btn-ghost btn-block" style={{ color: "var(--coral-deep)" }} onClick={leave}>
            <Icon name="logout" size={18} color="var(--coral-deep)" /> Salir del viaje
          </button>
        </div>
      )}
    </Sheet>
  );
}
