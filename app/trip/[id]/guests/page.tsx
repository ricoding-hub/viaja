"use client";
import { useParams, useRouter } from "next/navigation";
import { Av, Icon, Meter, Skeleton, fmt } from "@/components/ui";
import { Screen } from "@/components/Screen";
import { AppHeader } from "@/components/AppHeader";
import { PageGrid } from "@/components/PageGrid";
import { useActions, useReady, useTrip } from "@/lib/hooks";
import { useUI } from "@/store/ui";

export default function GuestsPage() {
  const { id } = useParams<{ id: string }>();
  const tripId = String(id);
  const ready = useReady();
  const router = useRouter();
  const openSheet = useUI((s) => s.openSheet);
  const { toggleConfirm } = useActions();
  const { members, options, budget, viewerId } = useTrip(tripId);

  const confirmed = members.filter((p) => p.host || p.confirmed).length;
  const header = (
    <AppHeader
      title="Invitados"
      subtitle={`${confirmed}/${members.length} confirmados`}
      back={() => router.push(`/trip/${tripId}`)}
      actions={<button className="btn btn-ghost btn-sm" onClick={() => openSheet("viewer")}>Ver como</button>}
    />
  );

  if (!ready) return <Screen width="wide" header={header}><Skeleton h={120} r={20} style={{ marginBottom: 12 }} /><PageGrid min={300} gap={10}><Skeleton h={88} /><Skeleton h={88} /></PageGrid></Screen>;

  const totalVotables = options.length;

  return (
    <Screen width="wide" header={header}>
      <div className="col gap16">
        {/* split summary */}
        <div className="card-p" style={{ borderRadius: 22, background: "linear-gradient(135deg, var(--turq), var(--turq-deep))", color: "#fff", boxShadow: "var(--sh-turq)" }}>
          <div className="kicker" style={{ color: "rgba(255,255,255,.85)" }}>Cuota por persona</div>
          <div className="display" style={{ fontSize: "var(--fs-h1)", marginTop: 2 }}>{budget.perCap ? fmt(budget.perCap) : "—"}</div>
          <p style={{ opacity: 0.92, fontSize: 12.5, marginTop: 2 }}>Total estimado del viaje · {fmt(budget.total)}</p>
        </div>

        <div className="row center between">
          <h2 className="h2">El grupo</h2>
          <button className="btn btn-coral btn-sm" onClick={() => openSheet("invite")}>
            <Icon name="plus" size={16} color="#fff" /> Invitar
          </button>
        </div>

        <PageGrid min={300} gap={10}>
          {members.map((p) => {
            const isViewer = p.id === viewerId;
            const voted = totalVotables ? options.filter((o) => o.votes[p.id] != null).length : 0;
            const pct = totalVotables ? (voted / totalVotables) * 100 : 0;
            const isConfirmed = p.host || p.confirmed;
            return (
              <div key={p.id} className="card card-p col gap10" style={{ border: isViewer ? "2px solid var(--turq)" : "1px solid var(--line)" }}>
                <div className="row center between">
                  <div className="row center gap10" style={{ minWidth: 0 }}>
                    <Av p={p} size={38} />
                    <div className="col" style={{ alignItems: "flex-start", minWidth: 0 }}>
                      <div className="row center gap6">
                        <b className="ellip" style={{ fontFamily: "var(--font-d)", fontSize: 15 }}>{p.name}</b>
                        {p.host && <span className="tag tag-turq">ANFITRIÓN</span>}
                        {isViewer && <span className="tag tag-grape">TÚ</span>}
                      </div>
                      <span className="muted tnum" style={{ fontSize: 11 }}>{voted}/{totalVotables} votadas</span>
                    </div>
                  </div>
                  {isConfirmed ? (
                    <span style={{ width: 28, height: 28, borderRadius: 99, background: "var(--turq-soft)", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }} title="Confirmado">
                      <Icon name="check" size={16} color="var(--turq-deep)" />
                    </span>
                  ) : isViewer ? (
                    <button className="btn btn-turq btn-sm" onClick={() => toggleConfirm(tripId, p.id)}>Confirmar</button>
                  ) : (
                    <span className="tag tag-sun">PENDIENTE</span>
                  )}
                </div>
                <div role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100} aria-label={`Votos de ${p.name}`}>
                  <Meter pct={pct} h={6} color={p.color} />
                </div>
              </div>
            );
          })}
        </PageGrid>
      </div>
    </Screen>
  );
}
