"use client";
import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Av, Icon, Ring, Skeleton, fmt } from "@/components/ui";
import { Screen } from "@/components/Screen";
import { PageGrid } from "@/components/PageGrid";
import { PhotoUpload } from "@/components/PhotoUpload";
import { ViewerChip } from "@/components/ViewerChip";
import { GuestBanner } from "@/components/GuestBanner";
import { useActions, useReady, useTrip } from "@/lib/hooks";
import { useUI } from "@/store/ui";
import { catMeta } from "@/lib/catMeta";
import { CAT_ORDER } from "@/lib/constants";
import type { ReactNode } from "react";

export default function DashboardPage() {
  const { id } = useParams<{ id: string }>();
  const tripId = String(id);
  const ready = useReady();
  const router = useRouter();
  const openSheet = useUI((s) => s.openSheet);
  const { setCover } = useActions();
  const { trip, members, options, research, itinerary, budget, me, isHost } = useTrip(tripId);

  // If ready but trip is missing, it may be a bootstrap race after joining via
  // invite link. Retry a fresh fetch once before declaring not found.
  const [resolved, setResolved] = useState(false);
  const retried = useRef(false);
  useEffect(() => {
    if (!ready || trip) { setResolved(true); return; }
    if (retried.current) { setResolved(true); return; }
    retried.current = true;
    import("@/lib/supabase/live")
      .then((m) => m.refetchLive())
      .catch(() => {})
      .finally(() => setResolved(true));
  }, [ready, trip]);

  if (!ready || !resolved) return <DashboardSkeleton />;
  if (!trip) return <NotFound onBack={() => router.push("/")} />;

  const empty = options.length === 0;
  const confirmed = members.filter((p) => p.host || p.confirmed).length;
  const pending = members.find((p) => !p.host && !p.confirmed);
  const go = (seg: string) => router.push(`/trip/${tripId}${seg}`);

  const hero = (
    <div style={{ position: "relative" }}>
      <PhotoUpload
        id={`cover-${trip.id}`}
        kind="cover"
        tone={trip.tone}
        value={trip.coverUrl}
        alt={trip.name}
        editable={isHost}
        onChange={(url) => setCover(trip.id, url)}
        h="clamp(248px, 40vh, 380px)"
        r={0}
        editPosition="br"
        editVariant="icon"
        editLabel="Cambiar portada"
      >
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(8,40,46,.5) 0%, rgba(8,40,46,0) 26%, rgba(8,40,46,.78) 100%)" }} />
      </PhotoUpload>

      {/* top controls — above the cover edit button */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 30 }}>
        <div className="safe-top" />
        <div className="container wide row center" style={{ paddingTop: 8, gap: 8 }}>
          <button type="button" className="icon-btn glass only-mobile" onClick={() => router.push("/")} aria-label="Volver a Mis viajes">
            <Icon name="chevL" size={20} />
          </button>
          <div className="row center gap8" style={{ marginLeft: "auto" }}>
            <ViewerChip person={me} onClick={() => openSheet("profile")} dark />
            <button type="button" className="icon-btn glass" onClick={() => openSheet("invite")} aria-label="Invitar">
              <Icon name="share" size={18} />
            </button>
            <button type="button" className="icon-btn glass" onClick={() => openSheet("settings")} aria-label="Ajustes del viaje">
              <Icon name="settings" size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* title */}
      <div className="container wide" style={{ position: "absolute", left: 0, right: 0, bottom: 34, color: "#fff", pointerEvents: "none" }}>
        <span className="tag tag-glass">{trip.emoji} {trip.sub}</span>
        <h1 className="display" style={{ fontSize: "var(--fs-display)", color: "#fff", marginTop: 8 }}>{trip.name}</h1>
        <p style={{ opacity: 0.92, fontSize: 13.5, marginTop: 4 }}>{trip.dates} · {trip.people} personas</p>
      </div>
    </div>
  );

  return (
    <Screen width="wide" bleed={hero}>
      <div className="col gap14" style={{ marginTop: -28 }}>
        {/* countdown */}
        <div className="card card-p row center gap14" style={{ position: "relative", zIndex: 2 }}>
          <Ring pct={budget.progress} size={64} sw={7}>
            <span className="tnum" style={{ fontFamily: "var(--font-d)", fontWeight: 800, fontSize: 16 }}>{budget.progress}%</span>
          </Ring>
          <div className="grow">
            <h2 className="h3">{trip.daysLeft != null ? `Faltan ${trip.daysLeft} días 🎉` : "¡Define las fechas! 📅"}</h2>
            <p className="muted" style={{ fontSize: 13, marginTop: 2 }}>
              {empty ? "Empieza agregando opciones para votar." : `${budget.decided}/4 categorías decididas · ${confirmed}/${members.length} confirmados`}
            </p>
          </div>
        </div>

        {!isHost && <GuestBanner person={me} />}

        {/* stats */}
        <div className="grid grid-stat">
          <StatCard color="var(--turq)" big={budget.perCap ? fmt(budget.perCap) : "—"} label="por persona" ic="wallet" onClick={() => go("/budget")} />
          <StatCard color="var(--coral)" big={`${confirmed}/${members.length}`} label="confirmados" ic="users" onClick={() => go("/guests")} />
          <StatCard color="var(--grape)" big={`${budget.decided}/4`} label="decididas" ic="trophy" onClick={() => go("/options")} />
        </div>

        {/* modules */}
        <h2 className="h2" style={{ marginTop: 4 }}>Módulos del viaje</h2>
        <PageGrid min={150} gap={10}>
          <ModuleCard label="Opciones" ic="layers" color={catMeta.actividades.color} note={`${budget.decided}/4 decididas`} onClick={() => go("/options")} />
          <ModuleCard label="Presupuesto" ic="wallet" color={catMeta.hospedaje.color} note={budget.perCap ? fmt(budget.perCap) : "Por armar"} onClick={() => go("/budget")} />
          <ModuleCard label="Ideas" ic="inbox" color={catMeta.general.color} note={`${research.length} guardadas`} onClick={() => go("/ideas")} />
          <ModuleCard label="Itinerario" ic="calendar" color={catMeta.transporte.color} note={itinerary.length ? `${itinerary.length} días` : "Por armar"} onClick={() => go("/plan")} />
        </PageGrid>

        {empty ? (
          <section className="col gap10" style={{ marginTop: 4 }}>
            <h2 className="h2">Para empezar</h2>
            <ActionRow emoji="💡" title="Guarda ideas y links" sub="TikToks, Airbnbs, vuelos…" onClick={() => go("/ideas")} />
            <ActionRow emoji="🗳️" title="Agrega opciones para votar" sub="Hospedaje, transporte, actividades" onClick={() => go("/options")} />
            <ActionRow emoji="👋" title="Invita a tu gente" sub="Comparte el link del viaje" onClick={() => openSheet("invite")} />
          </section>
        ) : (
          <section className="col gap10" style={{ marginTop: 4 }}>
            {pending && (
              <button type="button" className="card card-int card-p row center gap10" style={{ borderLeft: "3px solid var(--sun)" }} onClick={() => go("/guests")}>
                <Av p={pending} size={32} />
                <span className="grow" style={{ fontSize: 13.5 }}><b>{pending.name}</b> aún no confirma.</span>
                <Icon name="chevR" size={18} color="var(--ink-soft)" />
              </button>
            )}
            {budget.decided > 0 && (
              <>
                <h2 className="h2">En el plan</h2>
                <div className="card col" style={{ overflow: "hidden" }}>
                  {CAT_ORDER.filter((c) => budget.byCat[c].winners.length).map((c, i, arr) => (
                    <div key={c}>
                      <button type="button" className="row center gap12 card-int" style={{ width: "100%", padding: 14, textAlign: "left" }} onClick={() => go("/options")}>
                        <span style={{ width: 36, height: 36, borderRadius: 10, background: catMeta[c].color + "1f", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
                          <Icon name={catMeta[c].icon} size={18} color={catMeta[c].color} />
                        </span>
                        <div className="grow" style={{ minWidth: 0 }}>
                          <div className="muted" style={{ fontSize: 11.5 }}>{catMeta[c].label}</div>
                          <b className="ellip" style={{ fontFamily: "var(--font-d)", fontSize: 14 }}>{budget.byCat[c].note}</b>
                        </div>
                        <Icon name="check" size={18} color="var(--turq-deep)" />
                      </button>
                      {i < arr.length - 1 && <div className="hairline" />}
                    </div>
                  ))}
                </div>
              </>
            )}
          </section>
        )}
      </div>
    </Screen>
  );
}

function StatCard({ color, big, label, ic, onClick }: { color: string; big: ReactNode; label: string; ic: string; onClick?: () => void }) {
  return (
    <button type="button" onClick={onClick} className="card card-int col center" style={{ padding: "16px 8px", gap: 5 }}>
      <Icon name={ic} size={20} color={color} />
      <div className="tnum" style={{ fontFamily: "var(--font-d)", fontWeight: 800, fontSize: 19 }}>{big}</div>
      <div className="muted" style={{ fontSize: 11.5 }}>{label}</div>
    </button>
  );
}

function ModuleCard({ label, ic, color, note, onClick }: { label: string; ic: string; color: string; note: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="card card-int col" style={{ padding: 16, gap: 12, textAlign: "left", alignItems: "flex-start" }}>
      <span style={{ width: 42, height: 42, borderRadius: 13, background: color + "1f", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon name={ic} size={21} color={color} />
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
    <button type="button" onClick={onClick} className="card card-int card-p row center gap12" style={{ textAlign: "left" }}>
      <span style={{ fontSize: 24 }}>{emoji}</span>
      <div className="grow">
        <div style={{ fontFamily: "var(--font-d)", fontWeight: 700, fontSize: 14.5 }}>{title}</div>
        <div className="muted" style={{ fontSize: 12 }}>{sub}</div>
      </div>
      <Icon name="chevR" size={18} color="var(--ink-soft)" />
    </button>
  );
}

function DashboardSkeleton() {
  return (
    <Screen width="wide" bleed={<Skeleton h="clamp(248px,40vh,380px)" r={0} />}>
      <div className="col gap14" style={{ marginTop: -28 }}>
        <Skeleton h={88} r={18} style={{ position: "relative", zIndex: 2 }} />
        <div className="grid grid-stat"><Skeleton h={86} /><Skeleton h={86} /><Skeleton h={86} /></div>
        <PageGrid min={150} gap={10}><Skeleton h={108} /><Skeleton h={108} /><Skeleton h={108} /><Skeleton h={108} /></PageGrid>
      </div>
    </Screen>
  );
}

function NotFound({ onBack }: { onBack: () => void }) {
  return (
    <Screen>
      <div className="col center" style={{ minHeight: "60dvh", justifyContent: "center", gap: 12, textAlign: "center" }}>
        <div style={{ fontSize: 52 }}>🧭</div>
        <h1 className="h1">Viaje no encontrado</h1>
        <button className="btn btn-turq btn-sm" onClick={onBack}>Volver a Mis viajes</button>
      </div>
    </Screen>
  );
}
