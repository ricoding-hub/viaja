"use client";
import { useParams, useRouter } from "next/navigation";
import { Av, Icon, Ring, fmt } from "@/components/ui";
import { PhotoUpload } from "@/components/PhotoUpload";
import { ViewerChip } from "@/components/ViewerChip";
import { GuestBanner } from "@/components/GuestBanner";
import { useActions, useReady, useTrip } from "@/lib/hooks";
import { useUI } from "@/store/ui";
import { catMeta } from "@/lib/catMeta";
import type { ReactNode } from "react";

export default function DashboardPage() {
  const { id } = useParams<{ id: string }>();
  const tripId = String(id);
  const ready = useReady();
  const router = useRouter();
  const openSheet = useUI((s) => s.openSheet);
  const { setCover } = useActions();
  const { trip, members, options, research, itinerary, budget, me, isHost } = useTrip(tripId);

  if (!ready) return <Splash />;
  if (!trip) return <NotFound onBack={() => router.push("/")} />;

  const empty = options.length === 0;
  const confirmed = members.filter((p) => p.host || p.confirmed).length;
  const pending = members.find((p) => !p.host && !p.confirmed);
  const titleSize = trip.name.length > 15 ? 28 : 36;

  return (
    <div className="scroll">
      {/* hero */}
      <div style={{ position: "relative" }}>
        <PhotoUpload id={`cover-${trip.id}`} kind="cover" tone={trip.tone} value={trip.coverUrl} editable={isHost} onChange={(url) => setCover(trip.id, url)} h={300} r={0}>
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(8,40,46,.55) 0%, rgba(8,40,46,0) 28%, rgba(8,40,46,.72) 100%)", pointerEvents: "none" }} />
        </PhotoUpload>

        <div style={{ position: "absolute", top: 0, left: 0, right: 0 }}>
          <div className="safe-top" />
          <div className="pad row center between">
            <button type="button" className="row center gap4" onClick={() => router.push("/")} style={{ border: 0, background: "rgba(255,255,255,.9)", borderRadius: 99, padding: "7px 12px 7px 8px", cursor: "pointer", fontFamily: "var(--font-d)", fontWeight: 700, fontSize: 13, color: "var(--ink)", boxShadow: "var(--sh-sm)" }}>
              <Icon name="chevL" size={18} color="var(--ink-2)" /> Viajes
            </button>
            <div className="row center gap8">
              <ViewerChip person={me} onClick={() => openSheet("viewer")} dark />
              <button type="button" onClick={() => openSheet("invite")} aria-label="Invitar" style={{ border: 0, background: "rgba(255,255,255,.9)", borderRadius: 99, width: 38, height: 38, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "var(--sh-sm)" }}>
                <Icon name="share" size={18} color="var(--ink-2)" />
              </button>
            </div>
          </div>
        </div>

        <div style={{ position: "absolute", left: 18, right: 18, bottom: 40, color: "#fff", pointerEvents: "none" }}>
          <span className="tag tag-turq" style={{ marginBottom: 8 }}>{trip.emoji} {trip.sub}</span>
          <h1 className="display" style={{ fontSize: titleSize, color: "#fff", marginTop: 6 }}>{trip.name}</h1>
          <p style={{ opacity: 0.92, fontSize: 13, marginTop: 4 }}>{trip.dates} · {trip.people} personas</p>
        </div>
      </div>

      <div className="pad col gap14" style={{ marginTop: -26 }}>
        {/* countdown */}
        <div className="card card-p row center gap14" style={{ position: "relative", zIndex: 2 }}>
          <Ring pct={budget.progress} size={62} sw={7}>
            <span style={{ fontFamily: "var(--font-d)", fontWeight: 800, fontSize: 16 }}>{budget.progress}%</span>
          </Ring>
          <div className="grow">
            <h3 style={{ fontSize: 18 }}>{trip.daysLeft != null ? `Faltan ${trip.daysLeft} días 🎉` : "¡Define las fechas! 📅"}</h3>
            <p className="muted" style={{ fontSize: 13, marginTop: 2 }}>
              {empty ? "Empieza agregando opciones para votar." : `${budget.decided}/4 categorías decididas · ${confirmed}/${members.length} confirmados`}
            </p>
          </div>
        </div>

        {!isHost && <GuestBanner person={me} />}

        {/* quick stats */}
        <div className="row gap10" style={{ alignItems: "stretch" }}>
          <StatCard color="var(--turq)" big={budget.perCap ? fmt(budget.perCap) : "—"} label="por persona" ic="wallet" onClick={() => router.push(`/trip/${tripId}/budget`)} />
          <StatCard color="var(--coral)" big={`${confirmed}/${members.length}`} label="confirmados" ic="users" onClick={() => router.push(`/trip/${tripId}/guests`)} />
          <StatCard color="var(--grape)" big={`${budget.decided}/4`} label="decididas" ic="trophy" onClick={() => router.push(`/trip/${tripId}/options`)} />
        </div>

        {/* module grid */}
        <h3 style={{ fontSize: 17, marginTop: 4 }}>Módulos del viaje</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <ModuleCard label="Opciones" ic="layers" color={catMeta.actividades.color} note={`${budget.decided}/4 decididas`} onClick={() => router.push(`/trip/${tripId}/options`)} />
          <ModuleCard label="Presupuesto" ic="wallet" color={catMeta.hospedaje.color} note={budget.perCap ? fmt(budget.perCap) : "Por armar"} onClick={() => router.push(`/trip/${tripId}/budget`)} />
          <ModuleCard label="Ideas" ic="inbox" color={catMeta.general.color} note={`${research.length} guardadas`} onClick={() => router.push(`/trip/${tripId}/ideas`)} />
          <ModuleCard label="Itinerario" ic="calendar" color={catMeta.transporte.color} note={itinerary.length ? `${itinerary.length} días` : "Por armar"} onClick={() => router.push(`/trip/${tripId}/plan`)} />
        </div>

        {/* getting-started OR activity */}
        {empty ? (
          <div className="col gap10" style={{ marginTop: 4 }}>
            <h3 style={{ fontSize: 17 }}>Para empezar</h3>
            <ActionRow emoji="💡" title="Guarda ideas y links" sub="TikToks, Airbnbs, vuelos…" onClick={() => router.push(`/trip/${tripId}/ideas`)} />
            <ActionRow emoji="🗳️" title="Agrega opciones para votar" sub="Hospedaje, transporte, actividades" onClick={() => router.push(`/trip/${tripId}/options`)} />
            <ActionRow emoji="👋" title="Invita a tu gente" sub="Comparte el link del viaje" onClick={() => openSheet("invite")} />
          </div>
        ) : (
          <div className="col gap10" style={{ marginTop: 4 }}>
            {pending && (
              <button type="button" className="card card-p row center gap10" style={{ cursor: "pointer", borderLeft: "3px solid var(--sun)" }} onClick={() => router.push(`/trip/${tripId}/guests`)}>
                <Av p={pending} size={32} />
                <span className="grow" style={{ fontSize: 13.5 }}><b>{pending.name}</b> aún no confirma.</span>
                <Icon name="chevR" size={18} color="var(--ink-soft)" />
              </button>
            )}
            {trip.id === "pxm" && <ActivityFeed members={members} />}
          </div>
        )}
        <div className="pb-nav" />
      </div>
    </div>
  );
}

function StatCard({ color, big, label, ic, onClick }: { color: string; big: ReactNode; label: string; ic: string; onClick?: () => void }) {
  return (
    <button type="button" onClick={onClick} className="card col center grow" style={{ padding: "14px 8px", gap: 4, cursor: "pointer" }}>
      <Icon name={ic} size={20} color={color} />
      <div style={{ fontFamily: "var(--font-d)", fontWeight: 800, fontSize: 18 }}>{big}</div>
      <div className="muted" style={{ fontSize: 11 }}>{label}</div>
    </button>
  );
}

function ModuleCard({ label, ic, color, note, onClick }: { label: string; ic: string; color: string; note: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="card col" style={{ padding: 14, gap: 10, cursor: "pointer", textAlign: "left", alignItems: "flex-start" }}>
      <span style={{ width: 40, height: 40, borderRadius: 12, background: color + "1f", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon name={ic} size={20} color={color} />
      </span>
      <div>
        <div style={{ fontFamily: "var(--font-d)", fontWeight: 700, fontSize: 15 }}>{label}</div>
        <div className="muted" style={{ fontSize: 12 }}>{note}</div>
      </div>
    </button>
  );
}

function ActionRow({ emoji, title, sub, onClick }: { emoji: string; title: string; sub: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="card card-p row center gap12" style={{ cursor: "pointer", textAlign: "left" }}>
      <span style={{ fontSize: 24 }}>{emoji}</span>
      <div className="grow">
        <div style={{ fontFamily: "var(--font-d)", fontWeight: 700, fontSize: 14.5 }}>{title}</div>
        <div className="muted" style={{ fontSize: 12 }}>{sub}</div>
      </div>
      <Icon name="chevR" size={18} color="var(--ink-soft)" />
    </button>
  );
}

function ActivityFeed({ members }: { members: { id: string; name: string; initials: string; color: string }[] }) {
  const feed = [
    ["ale", "votó ⭐⭐⭐⭐⭐ por Bioluminiscencia", "hace 2h"],
    ["memo", "guardó una idea en Ideas", "hace 5h"],
    ["sofi", "confirmó su asistencia ✓", "ayer"],
  ] as const;
  const by = Object.fromEntries(members.map((m) => [m.id, m]));
  return (
    <div className="col gap10">
      <h3 style={{ fontSize: 17 }}>Actividad</h3>
      {feed.map(([who, action, time], i) => {
        const p = by[who];
        if (!p) return null;
        return (
          <div key={i} className="row center gap10">
            <Av p={p} size={32} />
            <span className="grow" style={{ fontSize: 13 }}><b>{p.name}</b> {action}</span>
            <span className="muted" style={{ fontSize: 11 }}>{time}</span>
          </div>
        );
      })}
    </div>
  );
}

function Splash() {
  return (
    <div className="col center" style={{ flex: 1, justifyContent: "center", gap: 10 }}>
      <div className="floaty" style={{ fontSize: 48 }}>🌴</div>
      <p className="muted">Cargando…</p>
    </div>
  );
}

function NotFound({ onBack }: { onBack: () => void }) {
  return (
    <div className="col center" style={{ flex: 1, justifyContent: "center", gap: 12, padding: 24, textAlign: "center" }}>
      <div style={{ fontSize: 48 }}>🧭</div>
      <h2>Viaje no encontrado</h2>
      <button className="btn btn-turq btn-sm" onClick={onBack}>Volver a Mis viajes</button>
    </div>
  );
}
