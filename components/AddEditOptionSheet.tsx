"use client";
import { useEffect, useState } from "react";
import { Icon, Sheet } from "@/components/ui";
import { catMeta } from "@/lib/catMeta";
import type { Cat, OptionItem, PriceUnit, Tone } from "@/lib/types";
import type { NewOptionInput, OptionPatch } from "@/lib/store";

const CATS: Cat[] = ["hospedaje", "transporte", "actividades", "comida"];
const UNITS: { value: PriceUnit; label: string }[] = [
  { value: "total", label: "En total" },
  { value: "pp", label: "Por persona" },
  { value: "ppd", label: "Por persona/noche" },
];
const TONE_BY_CAT: Record<Cat, Tone> = { hospedaje: "palm", transporte: "grape", actividades: "coral", comida: "sunset", general: "pool" };

export function AddEditOptionSheet({
  open,
  editing,
  onClose,
  onAdd,
  onSave,
}: {
  open: boolean;
  editing?: OptionItem | null;
  onClose: () => void;
  onAdd: (draft: NewOptionInput) => void;
  onSave: (id: string, patch: OptionPatch) => void;
}) {
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [cat, setCat] = useState<Cat>("hospedaje");
  const [price, setPrice] = useState("");
  const [unit, setUnit] = useState<PriceUnit>("pp");
  const [link, setLink] = useState("");

  useEffect(() => {
    if (open) {
      setTitle(editing?.title ?? "");
      setSubtitle(editing?.subtitle ?? "");
      setCat(editing && editing.cat !== "general" ? editing.cat : "hospedaje");
      setPrice(editing && editing.price > 0 ? String(editing.price) : "");
      setUnit(editing?.unit ?? "pp");
      setLink(editing?.link ?? "");
    }
  }, [open, editing]);

  function save() {
    if (!title.trim()) return;
    const p = price.trim() ? Math.max(0, Math.round(Number(price) || 0)) : 0;
    if (editing) {
      onSave(editing.id, { title: title.trim(), subtitle: subtitle.trim(), cat, price: p, unit, link: link.trim() });
    } else {
      onAdd({ cat, title: title.trim(), subtitle: subtitle.trim(), price: p, unit, link: link.trim(), tone: TONE_BY_CAT[cat] });
    }
    onClose();
  }

  return (
    <Sheet open={open} onClose={onClose}>
      <h2 style={{ fontSize: 22 }}>{editing ? "Editar opción ✏️" : "Nueva opción ⭐"}</h2>
      <p className="muted" style={{ fontSize: 13, margin: "4px 0 14px" }}>Lo que pongas aquí arma el presupuesto del grupo.</p>

      <div className="col gap12">
        <label className="col gap8">
          <span className="field-label">Título</span>
          <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ej. Casa frente al mar 🏖️" autoFocus maxLength={60} />
        </label>
        <label className="col gap8">
          <span className="field-label">Detalle (opcional)</span>
          <input className="input" value={subtitle} onChange={(e) => setSubtitle(e.target.value)} placeholder="Ej. 3 recámaras · alberca" maxLength={80} />
        </label>

        <div className="col gap8">
          <span className="field-label">Categoría</span>
          <div className="chip-row">
            {CATS.map((c) => (
              <button key={c} className={"chip" + (cat === c ? " on" : "")} onClick={() => setCat(c)}>
                <Icon name={catMeta[c].icon} size={14} color={cat === c ? "#fff" : catMeta[c].color} /> {catMeta[c].label}
              </button>
            ))}
          </div>
        </div>

        <div className="field-row">
          <label className="col gap8">
            <span className="field-label">Precio</span>
            <div className="row center gap8">
              <span className="muted" style={{ fontFamily: "var(--font-d)", fontSize: 18 }}>$</span>
              <input className="input" type="number" inputMode="numeric" min={0} value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0" />
            </div>
          </label>
          <label className="col gap8">
            <span className="field-label">Se cobra</span>
            <select className="input" value={unit} onChange={(e) => setUnit(e.target.value as PriceUnit)}>
              {UNITS.map((u) => <option key={u.value} value={u.value}>{u.label}</option>)}
            </select>
          </label>
        </div>

        <label className="col gap8">
          <span className="field-label">Link (opcional)</span>
          <input className="input" value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://airbnb.com/…" />
        </label>
      </div>

      <button className="btn btn-turq btn-block" style={{ marginTop: 18 }} disabled={!title.trim()} onClick={save}>
        {editing ? "Guardar cambios" : "Agregar opción"}
      </button>
    </Sheet>
  );
}
