"use client";
import { useEffect, useState } from "react";
import { Icon, Sheet } from "@/components/ui";
import { catMeta } from "@/lib/catMeta";
import type { Cat, ResearchItem, ResearchType, Tone } from "@/lib/types";

const TONES: Tone[] = ["pool", "sunset", "palm", "grape", "coral", "night"];
const CATS: Cat[] = ["hospedaje", "transporte", "actividades", "comida", "general"];

const TYPE_LABEL: Record<ResearchType, string> = { tiktok: "TikTok", flight: "Vuelo", link: "Link", note: "Nota" };

function detect(val: string): { type: ResearchType; isLink: boolean } {
  const isLink = /https?:|\.com|\.mx|tiktok|airbnb|booking|instagram/i.test(val);
  const type: ResearchType = /tiktok/i.test(val)
    ? "tiktok"
    : /volaris|aero|vuelo|flight/i.test(val)
    ? "flight"
    : isLink
    ? "link"
    : "note";
  return { type, isLink };
}

export interface NewResearch {
  type: ResearchType;
  cat: Cat;
  tone: Tone;
  title: string;
  source: string;
  note: string;
  amount: number | null;
  saved: string;
  savedById?: string;
}

export function AddResearchSheet({
  open,
  savedBy,
  savedById,
  editing,
  onClose,
  onAdd,
  onSave,
}: {
  open: boolean;
  savedBy: string;
  savedById?: string;
  editing?: ResearchItem | null;
  onClose: () => void;
  onAdd: (item: NewResearch) => void;
  onSave: (id: string, patch: { title?: string; cat?: Cat; amount?: number | null; source?: string }) => void;
}) {
  const [val, setVal] = useState("");
  const [cat, setCat] = useState<Cat>("general");
  const [amount, setAmount] = useState("");
  const { type, isLink } = detect(val);

  useEffect(() => {
    if (open) {
      setVal(editing?.title ?? "");
      setCat(editing?.cat ?? "general");
      setAmount(editing?.amount != null ? String(editing.amount) : "");
    }
  }, [open, editing]);

  function save() {
    if (!val.trim()) return;
    const amt = amount.trim() ? Math.max(0, Math.round(Number(amount) || 0)) : null;
    const title = val.trim().slice(0, 60);
    if (editing) {
      onSave(editing.id, { title, cat, amount: amt, source: isLink ? val.trim() : editing.source });
    } else {
      onAdd({
        type,
        cat,
        tone: TONES[Math.floor(Math.random() * TONES.length)],
        title,
        source: isLink ? val.trim() : "Nota",
        note: "",
        amount: amt,
        saved: savedBy,
        savedById,
      });
    }
    setVal("");
    setCat("general");
    setAmount("");
    onClose();
  }

  return (
    <Sheet open={open} onClose={onClose}>
      <h2 style={{ fontSize: 22 }}>{editing ? "Editar idea ✏️" : "Guardar idea 📌"}</h2>
      <p className="muted" style={{ fontSize: 13, margin: "4px 0 14px" }}>Pega un link, TikTok, vuelo o escribe una nota.</p>

      <textarea className="input" placeholder="https://tiktok.com/… · airbnb.com/… · o una nota 📝" value={val} onChange={(e) => setVal(e.target.value)} autoFocus />

      {val.trim() && (
        <div className="row center gap6 muted" style={{ fontSize: 12, marginTop: 8 }}>
          <Icon name="sparkle" size={14} color="var(--turq)" /> Detectado como <b>{TYPE_LABEL[type]}</b>
        </div>
      )}

      <p className="kicker" style={{ margin: "16px 0 8px" }}>Categoría</p>
      <div className="chip-row">
        {CATS.map((c) => (
          <button key={c} className={"chip" + (cat === c ? " on" : "")} onClick={() => setCat(c)}>
            <Icon name={catMeta[c].icon} size={14} color={cat === c ? "#fff" : catMeta[c].color} /> {catMeta[c].label}
          </button>
        ))}
      </div>

      <label className="col gap8" style={{ marginTop: 16 }}>
        <span className="kicker">Presupuesto estimado (opcional)</span>
        <div className="row center gap8">
          <span className="muted" style={{ fontFamily: "var(--font-d)", fontSize: 18 }}>$</span>
          <input className="input" type="number" inputMode="numeric" min={0} placeholder="0" value={amount} onChange={(e) => setAmount(e.target.value)} />
        </div>
        <span className="muted" style={{ fontSize: 11.5 }}>Si la conviertes en opción, este monto entra al presupuesto.</span>
      </label>

      <button className="btn btn-coral btn-block" style={{ marginTop: 18 }} disabled={!val.trim()} onClick={save}>
        {editing ? "Guardar cambios" : "Guardar idea"}
      </button>
    </Sheet>
  );
}
