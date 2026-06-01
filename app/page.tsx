"use client";
import { useRouter } from "next/navigation";
import { AvStack, Icon, Meter, Photo, Skeleton, fmt } from "@/components/ui";
import { Screen } from "@/components/Screen";
import { AppHeader } from "@/components/AppHeader";
import { PageGrid } from "@/components/PageGrid";
import { useMe, useReady, useTrips } from "@/lib/hooks";
import { useUI } from "@/store/ui";
import { STATUS_TAG } from "@/lib/constants";
import type { Trip } from "@/lib/types";

export default function HomePage() {
  const ready = useReady();
  const me = useMe();
  const { trips, featured, homeBudget, membersByTrip } = useTrips();
  const openSheet = useUI((s) => s.openSheet);
  const router = useRouter();

  const bell = (
    <button type="button" className="icon-btn" aria-label="Notificaciones" style={{ position: "relative" }}>
      <Icon name="bell" size={20} color="var(--ink-2)" />
      <span style={{ position: "absolute", top: 9, right: 10, width: 8, height: 8, borderRadius: 99, background: "var(--coral)", border: "2px solid #fff" }} />
    </button>
  );

  if (!ready || !me) {
    return (
      <Screen width="wide" header={<AppHeader kicker="Bienvenido" title="Hola 🌴" actions={bell} />}>
        <Skeleton h={196} r={20} style={{ marginBottom: 18 }} />
        <PageGrid min={300} gap={12}>
          <Skeleton h={92} /><Skeleton h={92} /><Skeleton h={92} />
        </PageGrid>
      </Screen>
    );
  }

  const others = trips.filter((t) => t.id !== featured?.id);
  const perCap = homeBudget?.perCap || 0;

  return (
    <Screen
      width="wide"
      header={<AppHeader kicker="Bienvenido" title={`Hola ${me.name} 🌴`} actions={bell} />}
    >
      <div className="col gap20" style={{ paddingBottom: 8 }}>
        {!featured ? (
          <EmptyHome onCreate={() => openSheet("create")} />
        ) : (
          <>
            {/* featured trip */}
            <button type="button" className="card card-int" style={{ overflow: "hidden", padding: 0, textAlign: "left", width: "100%" }} onClick={() => router.push(`/trip/${featured.id}`)}>
              <Photo tone={featured.tone} src={featured.coverUrl || undefined} alt={featured.name} h={210} r={0}>
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(8,40,46,0) 36%, rgba(8,40,46,.82))" }} />
                <span className="tag tag-glass" style={{ position: "absolute", top: 14, left: 14 }}>🌴 Planeando ahora</span>
                {featured.daysLeft != null && (
                  <div style={{ position: "absolute", top: 12, right: 12, background: "rgba(255,255,255,.94)", backdropFilter: "blur(6px)", borderRadius: 14, padding: "7px 11px", textAlign: "center", boxShadow: "var(--sh-sm)" }}>
                    <div className="tnum" style={{ fontFamily: "var(--font-d)", fontWeight: 800, fontSize: 19, lineHeight: 1, color: "var(--ink)" }}>{featured.daysLeft}</div>
                    <div className="kicker" style={{ fontSize: 9 }}>DÍAS</div>
                  </div>
                )}
                <div style={{ position: "absolute", left: 18, bottom: 16, right: 18, color: "#fff" }}>
                  <p style={{ fontSize: 13, opacity: 0.92 }}>{featured.sub}</p>
                  <div className="display" style={{ fontSize: "var(--fs-h1)", color: "#fff", marginTop: 2 }}>{featured.name}</div>
                </div>
              </Photo>
              <div className="card-p col gap14">
                <div className="row center between wrap gap10">
                  <div className="row center gap10">
                    <AvStack people={membersByTrip(featured.id)} size={28} />
                    <span className="muted" style={{ fontSize: 13 }}>{featured.dates}</span>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div className="tnum" style={{ fontFamily: "var(--font-d)", fontWeight: 800, fontSize: 20, color: "var(--turq-deep)" }}>
                      {perCap ? fmt(perCap) : "Por armar"}
                    </div>
                    <div className="kicker" style={{ fontSize: 9 }}>POR PERSONA</div>
                  </div>
                </div>
                <div className="col gap6">
                  <div className="row center between">
                    <span className="kicker" style={{ fontSize: 10 }}>Avance de organización</span>
                    <span className="muted tnum" style={{ fontSize: 12, fontWeight: 700 }}>{homeBudget?.progress ?? 0}%</span>
                  </div>
                  <Meter pct={homeBudget?.progress ?? 0} />
                </div>
              </div>
            </button>

            {others.length > 0 && (
              <section className="col gap12">
                <h2 className="h2">Otros planes</h2>
                <PageGrid min={300} gap={12}>
                  {others.map((t) => (
                    <TripMini key={t.id} trip={t} count={membersByTrip(t.id).length} onClick={() => router.push(`/trip/${t.id}`)} />
                  ))}
                </PageGrid>
              </section>
            )}

            <button type="button" onClick={() => openSheet("create")} className="row center gap10" style={{ justifyContent: "center", padding: 18, borderRadius: 18, border: "2px dashed var(--line)", background: "transparent", cursor: "pointer", color: "var(--ink-2)", fontFamily: "var(--font-d)", fontWeight: 700 }}>
              <Icon name="plus" size={20} color="var(--turq-deep)" /> Nuevo viaje
            </button>
          </>
        )}
      </div>
    </Screen>
  );
}

function TripMini({ trip, count, onClick }: { trip: Trip; count: number; onClick: () => void }) {
  const [cls, label] = STATUS_TAG[trip.status];
  return (
    <button type="button" onClick={onClick} className="card card-int row center gap12" style={{ padding: 10, textAlign: "left", width: "100%" }}>
      <Photo tone={trip.tone} src={trip.coverUrl || undefined} alt={trip.name} h={68} r={14} style={{ width: 68, flex: "none" }} />
      <div className="grow col gap4" style={{ minWidth: 0 }}>
        <div className="row center gap8">
          <b className="ellip" style={{ fontFamily: "var(--font-d)", fontSize: 15 }}>{trip.name}</b>
          <span className={`tag ${cls}`}>{label}</span>
        </div>
        <span className="muted ellip" style={{ fontSize: 12.5 }}>{trip.sub}</span>
        <div className="row center gap10 muted" style={{ fontSize: 12 }}>
          <span className="row center gap4"><Icon name="calendar" size={13} color="var(--ink-soft)" /> {trip.dates}</span>
          <span className="row center gap4"><Icon name="users" size={13} color="var(--ink-soft)" /> {count}</span>
        </div>
      </div>
      <Icon name="chevR" size={18} color="var(--ink-soft)" />
    </button>
  );
}

function EmptyHome({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="card" style={{ overflow: "hidden", textAlign: "center" }}>
      <Photo tone="pool" h={150}><div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(8,40,46,0), rgba(8,40,46,.5))" }} /></Photo>
      <div className="card-p col center gap10" style={{ padding: "22px 20px 26px" }}>
        <h2 className="h2">Tu primer viaje empieza aquí 🌴</h2>
        <p className="muted" style={{ fontSize: 14, maxWidth: 360, lineHeight: 1.5 }}>
          Crea un viaje, invita a tu gente y empieza a votar opciones con presupuesto en vivo.
        </p>
        <button className="btn btn-coral" onClick={onCreate} style={{ marginTop: 4 }}>
          <Icon name="plus" size={18} color="#fff" /> Crear viaje
        </button>
      </div>
    </div>
  );
}
