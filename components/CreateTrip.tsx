"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon, Sheet } from "@/components/ui";
import { PhotoUpload } from "@/components/PhotoUpload";
import { useActions } from "@/lib/hooks";
import { formatDateRange } from "@/lib/dates";
import { VIBES } from "@/lib/constants";
import { useUI } from "@/store/ui";

export function CreateTrip({ open }: { open: boolean }) {
  const router = useRouter();
  const { createTrip } = useActions();
  const closeSheet = useUI((s) => s.closeSheet);

  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [dest, setDest] = useState("");
  const [vibe, setVibe] = useState(VIBES[0]);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [people, setPeople] = useState(4);
  const [cover, setCoverUrl] = useState<string | null>(null);

  function reset() {
    setStep(0); setName(""); setDest(""); setVibe(VIBES[0]);
    setStart(""); setEnd(""); setPeople(4); setCoverUrl(null);
  }
  function close() {
    reset();
    closeSheet();
  }

  function finish() {
    const id = createTrip({
      name: name.trim() || "Nuevo viaje",
      sub: dest.trim() || vibe.label,
      tone: vibe.tone,
      emoji: vibe.emoji,
      dates: formatDateRange(start, end),
      startDate: start || null,
      endDate: end || null,
      people,
      coverUrl: cover,
    });
    close();
    router.push(`/trip/${id}`);
  }

  const canNext = step !== 0 || name.trim().length > 0;
  const dotColor = (i: number) => (i <= step ? "var(--turq)" : "var(--sand-2)");

  return (
    <Sheet open={open} onClose={close}>
      {/* header: back/close + progress dots */}
      <div className="row center between" style={{ marginBottom: 16 }}>
        <button
          type="button"
          className="row center"
          style={{ border: 0, background: "none", cursor: "pointer", padding: 6 }}
          onClick={() => (step > 0 ? setStep(step - 1) : close())}
          aria-label="Atrás"
        >
          <Icon name={step > 0 ? "arrowL" : "close"} size={22} color="var(--ink-2)" />
        </button>
        <div className="row gap6">
          {[0, 1, 2, 3].map((i) => (
            <span key={i} style={{ width: i === step ? 22 : 7, height: 7, borderRadius: 99, background: dotColor(i), transition: "all .25s" }} />
          ))}
        </div>
        <span style={{ width: 34 }} />
      </div>

      {step === 0 && (
        <div className="col gap14 stagger">
          <h2 style={{ fontSize: 24 }}>Lo básico ✨</h2>
          <input className="input" placeholder="Ej. Cumple en la playa 🎂" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
          <input className="input" placeholder="Destino — Ej. Puerto Escondido" value={dest} onChange={(e) => setDest(e.target.value)} />
          <p className="kicker">¿Qué vibra?</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
            {VIBES.map((v) => (
              <button
                key={v.tone}
                type="button"
                className="col center"
                style={{ gap: 4, padding: "14px 6px", borderRadius: 16, cursor: "pointer", background: "#fff", border: vibe.tone === v.tone ? "2px solid var(--turq)" : "1px solid var(--line)" }}
                onClick={() => setVibe(v)}
              >
                <span style={{ fontSize: 26 }}>{v.emoji}</span>
                <span style={{ fontSize: 12, fontFamily: "var(--font-d)", fontWeight: 700 }}>{v.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="col gap14 stagger">
          <h2 style={{ fontSize: 24 }}>Fechas & gente 🗓️</h2>
          <div className="row gap10">
            <label className="col grow" style={{ gap: 6 }}>
              <span className="kicker">Llegada</span>
              <input className="input" type="date" value={start} onChange={(e) => setStart(e.target.value)} />
            </label>
            <label className="col grow" style={{ gap: 6 }}>
              <span className="kicker">Salida</span>
              <input className="input" type="date" value={end} min={start || undefined} onChange={(e) => setEnd(e.target.value)} />
            </label>
          </div>
          <div className="card card-p col gap10">
            <div className="row center between">
              <span className="kicker">¿Cuántos van?</span>
              <b style={{ fontFamily: "var(--font-d)", fontSize: 22 }}>{people}</b>
            </div>
            <input type="range" className="coral" min={2} max={12} value={people} onChange={(e) => setPeople(Number(e.target.value))} />
            <p className="muted" style={{ fontSize: 12 }}>Podrás ajustarlo después — el presupuesto se reparte solo.</p>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="col gap14">
          <h2 style={{ fontSize: 24 }}>Portada 🌴</h2>
          <PhotoUpload id="new-trip" kind="cover" tone={vibe.tone} value={cover} editable onChange={setCoverUrl} h={200} r={20} placeholder="Sube una foto que les emocione" />
          <div className="card card-p row center between">
            <span className="row center gap10">
              <span style={{ fontSize: 26 }}>{vibe.emoji}</span>
              <span className="col" style={{ alignItems: "flex-start" }}>
                <b style={{ fontFamily: "var(--font-d)" }}>{name.trim() || "Tu viaje"}</b>
                <span className="muted" style={{ fontSize: 12 }}>{formatDateRange(start, end)} · {people} personas</span>
              </span>
            </span>
            <span className="tag tag-turq">{vibe.label}</span>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="col center gap12" style={{ textAlign: "center", padding: "10px 0" }}>
          <div className="floaty" style={{ fontSize: 56 }}>🎉</div>
          <h2 style={{ fontSize: 24 }}>¡Todo listo!</h2>
          <p className="muted" style={{ fontSize: 14, maxWidth: 280, lineHeight: 1.5 }}>
            Crea el viaje y empieza a guardar ideas y opciones. Podrás invitar a tu gente desde Invitados.
          </p>
        </div>
      )}

      <div style={{ marginTop: 20 }}>
        {step < 3 ? (
          <button className="btn btn-turq btn-block" disabled={!canNext} onClick={() => setStep(step + 1)}>
            Continuar
          </button>
        ) : (
          <button className="btn btn-coral btn-block" onClick={finish}>
            Crear viaje 🌴
          </button>
        )}
      </div>
    </Sheet>
  );
}
