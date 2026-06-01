"use client";
import { useRouter } from "next/navigation";
import { AvStack, Icon, Meter, Photo, fmt } from "@/components/ui";
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

  if (!ready || !me) return <BootSplash />;

  const others = trips.filter((t) => t.id !== featured?.id);
  const perCap = homeBudget?.perCap || 0;

  return (
    <div className="scroll">
      <div className="safe-top" />
      <div className="pad col gap18" style={{ paddingBottom: 40 }}>
        {/* greeting */}
        <div className="row center between">
          <div>
            <p className="muted" style={{ fontSize: 13 }}>Bienvenido</p>
            <h1 style={{ fontSize: 28 }}>Hola {me.name} 🌴</h1>
          </div>
          <button type="button" className="row center" style={{ position: "relative", border: 0, background: "#fff", borderRadius: 14, width: 44, height: 44, justifyContent: "center", boxShadow: "var(--sh-sm)", cursor: "pointer" }} aria-label="Notificaciones">
            <Icon name="bell" size={22} color="var(--ink-2)" />
            <span style={{ position: "absolute", top: 11, right: 12, width: 8, height: 8, borderRadius: 99, background: "var(--coral)", border: "2px solid #fff" }} />
          </button>
        </div>

        {/* featured trip */}
        {featured && (
          <button type="button" className="card" style={{ overflow: "hidden", padding: 0, textAlign: "left", cursor: "pointer", border: "1px solid var(--line)" }} onClick={() => router.push(`/trip/${featured.id}`)}>
            <Photo tone={featured.tone} src={featured.coverUrl || undefined} h={186} r={0}>
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(8,40,46,0) 38%, rgba(8,40,46,.78))" }} />
              <span className="tag tag-turq" style={{ position: "absolute", top: 14, left: 14 }}>🌴 Planeando ahora</span>
              {featured.daysLeft != null && (
                <div style={{ position: "absolute", top: 12, right: 12, background: "rgba(255,255,255,.92)", backdropFilter: "blur(6px)", borderRadius: 14, padding: "6px 10px", textAlign: "center" }}>
                  <div style={{ fontFamily: "var(--font-d)", fontWeight: 800, fontSize: 18, lineHeight: 1, color: "var(--ink)" }}>{featured.daysLeft}</div>
                  <div className="kicker" style={{ fontSize: 9 }}>DÍAS</div>
                </div>
              )}
              <div style={{ position: "absolute", left: 16, bottom: 14, right: 16, color: "#fff" }}>
                <p style={{ fontSize: 13, opacity: 0.9 }}>{featured.sub}</p>
                <h2 style={{ fontSize: 26, color: "#fff" }}>{featured.name}</h2>
              </div>
            </Photo>
            <div className="card-p col gap12">
              <div className="row center between">
                <div className="row center gap10">
                  <AvStack people={membersByTrip(featured.id)} size={28} />
                  <span className="muted" style={{ fontSize: 13 }}>{featured.dates}</span>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontFamily: "var(--font-d)", fontWeight: 800, fontSize: 20, color: "var(--turq-deep)" }}>
                    {perCap ? fmt(perCap) : "Por armar"}
                  </div>
                  <div className="kicker" style={{ fontSize: 9 }}>POR PERSONA</div>
                </div>
              </div>
              <div className="col gap6">
                <div className="row center between">
                  <span className="kicker" style={{ fontSize: 10 }}>Avance de organización</span>
                  <span className="muted" style={{ fontSize: 12, fontWeight: 700 }}>{homeBudget?.progress ?? 0}%</span>
                </div>
                <Meter pct={homeBudget?.progress ?? 0} />
              </div>
            </div>
          </button>
        )}

        {/* other plans */}
        {others.length > 0 && (
          <div className="col gap10">
            <h3 style={{ fontSize: 17 }}>Otros planes</h3>
            {others.map((t) => (
              <OtherTripCard key={t.id} trip={t} count={membersByTrip(t.id).length} onClick={() => router.push(`/trip/${t.id}`)} />
            ))}
          </div>
        )}

        {/* new trip */}
        <button type="button" onClick={() => openSheet("create")} className="row center gap10" style={{ justifyContent: "center", padding: 18, borderRadius: 20, border: "2px dashed var(--line)", background: "transparent", cursor: "pointer", color: "var(--ink-2)", fontFamily: "var(--font-d)", fontWeight: 700 }}>
          <Icon name="plus" size={20} color="var(--turq-deep)" />
          Nuevo viaje
        </button>
      </div>
    </div>
  );
}

function OtherTripCard({ trip, count, onClick }: { trip: Trip; count: number; onClick: () => void }) {
  const [cls, label] = STATUS_TAG[trip.status];
  return (
    <button type="button" onClick={onClick} className="card row center gap12" style={{ padding: 10, textAlign: "left", cursor: "pointer", width: "100%" }}>
      <Photo tone={trip.tone} src={trip.coverUrl || undefined} h={64} r={14} style={{ width: 64, flex: "none" }} />
      <div className="grow col gap4" style={{ minWidth: 0 }}>
        <div className="row center gap8">
          <b style={{ fontFamily: "var(--font-d)", fontSize: 15 }} className="ellip">{trip.name}</b>
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

function BootSplash() {
  return (
    <div className="col center" style={{ flex: 1, justifyContent: "center", gap: 10 }}>
      <div className="floaty" style={{ fontSize: 48 }}>🌴</div>
      <p className="muted">Cargando…</p>
    </div>
  );
}
