"use client";
import { useEffect, useState } from "react";
import { Icon, Sheet } from "@/components/ui";
import { catMeta } from "@/lib/catMeta";
import type { ItineraryDay, ItineraryItem, OptionItem } from "@/lib/types";

const EMOJIS = ["📍", "🏖️", "🍽️", "🏠", "✈️", "🚗", "🎉", "🌅", "🏄", "🛏️", "☕", "🛒", "🍹", "🏛️", "⛰️", "🚤"];
const CAT_EMOJI: Record<string, string> = { hospedaje: "🏠", transporte: "🚗", actividades: "📍", comida: "🍽️", general: "📌" };

export function ItineraryItemSheet({
  open,
  days,
  options,
  editing,
  defaultDayId,
  onClose,
  onSubmit,
}: {
  open: boolean;
  days: ItineraryDay[];
  options: OptionItem[];
  editing?: { dayId: string; item: ItineraryItem } | null;
  defaultDayId: string;
  onClose: () => void;
  onSubmit: (p: { dayId: string; emoji: string; text: string; optionId: string | null }) => void;
}) {
  const [tab, setTab] = useState<"option" | "manual">("manual");
  const [dayId, setDayId] = useState(defaultDayId);
  const [emoji, setEmoji] = useState("📍");
  const [text, setText] = useState("");
  const [optionId, setOptionId] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setDayId(editing?.dayId ?? defaultDayId);
      setEmoji(editing?.item.emoji ?? "📍");
      setText(editing?.item.text ?? "");
      setOptionId(editing?.item.optionId ?? null);
      setTab(!editing && options.length ? "option" : "manual");
    }
  }, [open, editing, defaultDayId, options.length]);

  function pickOption(o: OptionItem) {
    setOptionId(o.id);
    setEmoji(CAT_EMOJI[o.cat] ?? "📍");
    setText(o.title);
    setTab("manual");
  }

  function submit() {
    if (!text.trim() || !dayId) return;
    onSubmit({ dayId, emoji: emoji || "📍", text: text.trim().slice(0, 80), optionId });
    onClose();
  }

  return (
    <Sheet open={open} onClose={onClose}>
      <h2 style={{ fontSize: 22 }}>{editing ? "Editar actividad ✏️" : "Agregar al itinerario 🗓️"}</h2>

      {days.length > 0 && (
        <>
          <p className="kicker" style={{ margin: "14px 0 8px" }}>Día</p>
          <div className="chip-row">
            {days.map((d, i) => (
              <button key={d.id} className={"chip" + (dayId === d.id ? " on" : "")} onClick={() => setDayId(d.id)}>
                Día {i + 1}{d.date ? ` · ${d.date}` : ""}
              </button>
            ))}
          </div>
        </>
      )}

      {!editing && options.length > 0 && (
        <div className="seg" style={{ marginTop: 14 }}>
          <button className={tab === "option" ? "on" : ""} onClick={() => setTab("option")}>Desde opción</button>
          <button className={tab === "manual" ? "on" : ""} onClick={() => setTab("manual")}>Escribir</button>
        </div>
      )}

      {tab === "option" && !editing ? (
        <div className="col gap8" style={{ marginTop: 14, maxHeight: 280, overflowY: "auto" }}>
          {options.map((o) => (
            <button key={o.id} type="button" className="card card-int row center gap10" style={{ padding: 12, textAlign: "left" }} onClick={() => pickOption(o)}>
              <span style={{ width: 36, height: 36, borderRadius: 10, background: catMeta[o.cat].color + "1f", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
                <Icon name={catMeta[o.cat].icon} size={17} color={catMeta[o.cat].color} />
              </span>
              <span className="grow ellip" style={{ fontFamily: "var(--font-d)", fontWeight: 700, fontSize: 14 }}>{o.title}</span>
              {o.winner && <span className="tag tag-turq" style={{ flex: "none" }}>Elegida</span>}
            </button>
          ))}
        </div>
      ) : (
        <div className="col gap12" style={{ marginTop: 14 }}>
          <div className="col gap8">
            <span className="field-label">Emoji</span>
            <div className="row wrap gap6">
              {EMOJIS.map((e) => (
                <button key={e} type="button" onClick={() => setEmoji(e)} style={{ width: 40, height: 40, borderRadius: 12, fontSize: 20, cursor: "pointer", background: emoji === e ? "var(--turq-soft)" : "#fff", border: emoji === e ? "2px solid var(--turq)" : "1px solid var(--line)" }}>{e}</button>
              ))}
            </div>
          </div>
          <label className="col gap8">
            <span className="field-label">¿Qué van a hacer?</span>
            <input className="input" value={text} onChange={(e) => setText(e.target.value)} placeholder="Ej. Check-in en la casa 🏠" autoFocus maxLength={80} />
          </label>
        </div>
      )}

      <button className="btn btn-turq btn-block" style={{ marginTop: 18 }} disabled={!text.trim() || !dayId} onClick={submit}>
        {editing ? "Guardar" : "Agregar"}
      </button>
    </Sheet>
  );
}
