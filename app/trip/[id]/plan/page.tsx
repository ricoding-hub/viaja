"use client";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { EmptyState, Icon, Skeleton } from "@/components/ui";
import { Screen } from "@/components/Screen";
import { AppHeader } from "@/components/AppHeader";
import { ItineraryItemSheet } from "@/components/ItineraryItemSheet";
import { useActions, useReady, useTrip } from "@/lib/hooks";
import type { ItineraryItem, Tone } from "@/lib/types";

const TONE_COLOR: Record<string, string> = {
  "": "#11BFB2", pool: "#1d8fd1", sunset: "#ff8a5b", palm: "#2fbf8f", grape: "#7C6CF0", coral: "#FF6F5C", night: "#6a5acd",
};

export default function PlanPage() {
  const { id } = useParams<{ id: string }>();
  const tripId = String(id);
  const ready = useReady();
  const router = useRouter();
  const { trip, itinerary, options, isHost } = useTrip(tripId);
  const {
    addItineraryDay, updateItineraryDay, deleteItineraryDay,
    addItineraryItem, updateItineraryItem, deleteItineraryItem, moveItineraryItem,
  } = useActions();

  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetDayId, setSheetDayId] = useState("");
  const [editing, setEditing] = useState<{ dayId: string; item: ItineraryItem } | null>(null);
  const [editDayId, setEditDayId] = useState<string | null>(null);
  const [dayTitle, setDayTitle] = useState("");
  const [confirmDelDay, setConfirmDelDay] = useState<string | null>(null);

  const header = (
    <AppHeader
      title="Itinerario"
      subtitle={trip?.dates}
      back={() => router.push(`/trip/${tripId}`)}
      actions={isHost && itinerary.length > 0 ? <button className="btn btn-coral btn-sm" onClick={() => addItineraryDay(tripId)}><Icon name="plus" size={16} color="#fff" /> Día</button> : undefined}
    />
  );
  if (!ready || !trip) return <Screen header={header}><Skeleton h={120} r={16} /></Screen>;

  function openAdd(dayId: string) {
    setEditing(null);
    setSheetDayId(dayId);
    setSheetOpen(true);
  }
  function openEditItem(dayId: string, item: ItineraryItem) {
    setEditing({ dayId, item });
    setSheetDayId(dayId);
    setSheetOpen(true);
  }
  function submitItem(p: { dayId: string; emoji: string; text: string; optionId: string | null }) {
    if (editing) {
      if (p.dayId === editing.dayId) {
        updateItineraryItem(tripId, editing.dayId, editing.item.id, { emoji: p.emoji, text: p.text });
      } else {
        deleteItineraryItem(tripId, editing.dayId, editing.item.id);
        addItineraryItem(tripId, p.dayId, { emoji: p.emoji, text: p.text, optionId: p.optionId });
      }
    } else {
      addItineraryItem(tripId, p.dayId, { emoji: p.emoji, text: p.text, optionId: p.optionId });
    }
  }

  return (
    <Screen header={header}>
      {itinerary.length === 0 ? (
        <EmptyState
          emoji="🗓️"
          title="El plan día a día"
          sub={isHost ? "Crea días y agrega actividades — desde tus opciones o escritas a mano." : "Cuando el anfitrión arme el itinerario, aparecerá aquí."}
          cta={isHost ? "Agregar primer día 🗓️" : undefined}
          onCta={() => addItineraryDay(tripId)}
        />
      ) : (
        <div className="col gap14">
          {itinerary.map((d, i) => {
            const color = TONE_COLOR[(d.tone as Tone) || ""] || TONE_COLOR[""];
            return (
              <div key={d.id} className="row gap12" style={{ alignItems: "flex-start" }}>
                <div className="col center" style={{ width: 44, height: 44, borderRadius: 14, background: color, color: "#fff", flex: "none", justifyContent: "center", boxShadow: "var(--sh-sm)" }} aria-label={`Día ${i + 1}`}>
                  <span style={{ fontSize: 8, fontWeight: 700, letterSpacing: ".08em", opacity: 0.9 }}>DÍA</span>
                  <span className="tnum" style={{ fontFamily: "var(--font-d)", fontWeight: 800, fontSize: 18, lineHeight: 1 }}>{i + 1}</span>
                </div>

                <div className="card card-p grow" style={{ minWidth: 0 }}>
                  {/* day header */}
                  {editDayId === d.id ? (
                    <div className="row center gap6" style={{ marginBottom: 8 }}>
                      <input className="input" value={dayTitle} onChange={(e) => setDayTitle(e.target.value)} autoFocus maxLength={50} style={{ minHeight: 38, padding: "6px 10px" }} />
                      <button className="mini-btn" aria-label="Guardar día" onClick={() => { updateItineraryDay(tripId, d.id, { title: dayTitle.trim() || d.title }); setEditDayId(null); }}>
                        <Icon name="check" size={16} color="var(--turq-deep)" />
                      </button>
                    </div>
                  ) : (
                    <div className="row center between" style={{ marginBottom: 8, gap: 8 }}>
                      <div className="col" style={{ minWidth: 0 }}>
                        {d.date && <span className="muted" style={{ fontSize: 12 }}>{d.date}</span>}
                        <h3 className="h3" style={{ margin: "1px 0" }}>{d.title}</h3>
                      </div>
                      {isHost && (
                        <div className="row center gap6" style={{ flex: "none" }}>
                          <button className="mini-btn" aria-label="Editar día" onClick={() => { setEditDayId(d.id); setDayTitle(d.title); }}><Icon name="edit" size={14} color="var(--ink-soft)" /></button>
                          <button className="mini-btn" aria-label="Eliminar día" onClick={() => setConfirmDelDay(d.id)}><Icon name="trash" size={14} color="var(--coral-deep)" /></button>
                        </div>
                      )}
                    </div>
                  )}

                  {confirmDelDay === d.id && (
                    <div className="row center gap8" style={{ marginBottom: 10 }}>
                      <span className="muted" style={{ fontSize: 12.5 }}>¿Eliminar este día?</span>
                      <button className="chip-mini" style={{ color: "var(--coral-deep)" }} onClick={() => { deleteItineraryDay(tripId, d.id); setConfirmDelDay(null); }}>Sí</button>
                      <button className="chip-mini" onClick={() => setConfirmDelDay(null)}>No</button>
                    </div>
                  )}

                  {/* items */}
                  {d.items.length === 0 ? (
                    <p className="muted" style={{ fontSize: 13 }}>Sin actividades aún.</p>
                  ) : (
                    <div className="col">
                      {d.items.map((it, idx) => (
                        <div key={it.id} className="row center gap8" style={{ padding: "8px 0", borderTop: idx ? "1px solid var(--line)" : undefined }}>
                          <button
                            type="button"
                            className="row center gap8 grow"
                            style={{ background: "none", border: 0, textAlign: "left", cursor: isHost ? "pointer" : "default", minWidth: 0, padding: 0 }}
                            onClick={isHost ? () => openEditItem(d.id, it) : undefined}
                          >
                            <span style={{ fontSize: 18, flex: "none" }}>{it.emoji}</span>
                            <span className="grow" style={{ fontSize: 13.5 }}>{it.text}</span>
                          </button>
                          {isHost && (
                            <div className="row center gap4" style={{ flex: "none" }}>
                              <button className="mini-btn" style={{ width: 30, height: 30 }} disabled={idx === 0} onClick={() => moveItineraryItem(tripId, d.id, it.id, -1)} aria-label="Subir">
                                <span style={{ display: "flex", transform: "rotate(180deg)" }}><Icon name="chevD" size={14} /></span>
                              </button>
                              <button className="mini-btn" style={{ width: 30, height: 30 }} disabled={idx === d.items.length - 1} onClick={() => moveItineraryItem(tripId, d.id, it.id, 1)} aria-label="Bajar">
                                <Icon name="chevD" size={14} />
                              </button>
                              <button className="mini-btn" style={{ width: 30, height: 30 }} onClick={() => deleteItineraryItem(tripId, d.id, it.id)} aria-label="Quitar">
                                <Icon name="trash" size={13} color="var(--coral-deep)" />
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {isHost && (
                    <button type="button" className="row center gap8" style={{ marginTop: 10, padding: "9px 12px", borderRadius: 12, border: "1.5px dashed var(--line)", background: "transparent", cursor: "pointer", color: "var(--ink-2)", fontFamily: "var(--font-d)", fontWeight: 700, fontSize: 13, width: "100%", justifyContent: "center" }} onClick={() => openAdd(d.id)}>
                      <Icon name="plus" size={15} color="var(--turq)" /> Agregar actividad
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {isHost && (
            <button type="button" onClick={() => addItineraryDay(tripId)} className="row center gap10" style={{ justifyContent: "center", padding: 14, borderRadius: 16, border: "2px dashed var(--line)", background: "transparent", cursor: "pointer", color: "var(--ink-2)", fontFamily: "var(--font-d)", fontWeight: 700 }}>
              <Icon name="plus" size={18} color="var(--coral)" /> Agregar día
            </button>
          )}
        </div>
      )}

      <ItineraryItemSheet
        open={sheetOpen}
        days={itinerary}
        options={options}
        editing={editing}
        defaultDayId={sheetDayId}
        onClose={() => { setSheetOpen(false); setEditing(null); }}
        onSubmit={submitItem}
      />
    </Screen>
  );
}
