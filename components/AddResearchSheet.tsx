"use client";
import { useState } from "react";
import { Icon, Sheet } from "@/components/ui";
import { catMeta } from "@/lib/catMeta";
import type { Cat, ResearchType, Tone } from "@/lib/types";

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

export function AddResearchSheet({
  open,
  savedBy,
  onClose,
  onAdd,
}: {
  open: boolean;
  savedBy: string;
  onClose: () => void;
  onAdd: (item: { type: ResearchType; cat: Cat; tone: Tone; title: string; source: string; note: string; saved: string }) => void;
}) {
  const [val, setVal] = useState("");
  const [cat, setCat] = useState<Cat>("general");
  const { type, isLink } = detect(val);

  function save() {
    if (!val.trim()) return;
    onAdd({
      type,
      cat,
      tone: TONES[Math.floor(Math.random() * TONES.length)],
      title: val.trim().slice(0, 52),
      source: isLink ? val.trim() : "Nota",
      note: "Agregado ahora",
      saved: savedBy,
    });
    setVal("");
    setCat("general");
    onClose();
  }

  return (
    <Sheet open={open} onClose={onClose}>
      <h2 style={{ fontSize: 22 }}>Guardar idea 📌</h2>
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

      <button className="btn btn-coral btn-block" style={{ marginTop: 18 }} disabled={!val.trim()} onClick={save}>
        Guardar idea
      </button>
    </Sheet>
  );
}
