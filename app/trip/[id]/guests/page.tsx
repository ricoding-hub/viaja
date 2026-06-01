"use client";
import { useParams } from "next/navigation";
import { Av, Icon, Meter, fmt } from "@/components/ui";
import { useActions, useReady, useTrip } from "@/lib/hooks";
import { useUI } from "@/store/ui";

export default function GuestsPage() {
  const { id } = useParams<{ id: string }>();
  const tripId = String(id);
  const ready = useReady();
  const openSheet = useUI((s) => s.openSheet);
  const { toggleConfirm } = useActions();
  const { members, options, budget, viewerId } = useTrip(tripId);

  if (!ready) return null;

  const confirmed = members.filter((p) => p.host || p.confirmed).length;
  const totalVotables = options.length;

  return (
    <div className="scroll">
      <div className="safe-top" />
      <div className="pad col gap14">
        <div className="row center between">
          <div>
            <h1 style={{ fontSize: 26 }}>Invitados</h1>
            <p className="muted" style={{ fontSize: 13 }}>{confirmed}/{members.length} confirmados · {members.length} en el grupo</p>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={() => openSheet("viewer")}>Ver como</button>
        </div>

        {/* split summary */}
        <div className="card-p" style={{ borderRadius: 20, background: "linear-gradient(135deg, var(--turq), var(--turq-deep))", color: "#fff" }}>
          <div className="kicker" style={{ color: "rgba(255,255,255,.85)" }}>Cuota por persona</div>
          <div className="display" style={{ fontSize: 38, marginTop: 2 }}>{budget.perCap ? fmt(budget.perCap) : "—"}</div>
          <p style={{ opacity: 0.9, fontSize: 12.5, marginTop: 2 }}>Total estimado del viaje · {fmt(budget.total)}</p>
        </div>

        <div className="row center between">
          <h3 style={{ fontSize: 17 }}>El grupo</h3>
          <button className="btn btn-coral btn-sm" onClick={() => openSheet("invite")}>
            <Icon name="plus" size={16} color="#fff" /> Invitar
          </button>
        </div>

        <div className="col gap10">
          {members.map((p) => {
            const isViewer = p.id === viewerId;
            const voted = totalVotables ? options.filter((o) => o.votes[p.id] != null).length : 0;
            const pct = totalVotables ? (voted / totalVotables) * 100 : 0;
            const isConfirmed = p.host || p.confirmed;
            return (
              <div key={p.id} className="card card-p col gap10" style={{ border: isViewer ? "2px solid var(--turq)" : "1px solid var(--line)" }}>
                <div className="row center between">
                  <div className="row center gap10">
                    <Av p={p} size={38} />
                    <div className="col" style={{ alignItems: "flex-start" }}>
                      <div className="row center gap6">
                        <b style={{ fontFamily: "var(--font-d)", fontSize: 15 }}>{p.name}</b>
                        {p.host && <span className="tag tag-turq">ANFITRIÓN</span>}
                        {isViewer && <span className="tag tag-grape">TÚ</span>}
                      </div>
                      <span className="muted" style={{ fontSize: 11 }}>{voted}/{totalVotables} votadas</span>
                    </div>
                  </div>
                  {isConfirmed ? (
                    <span style={{ width: 28, height: 28, borderRadius: 99, background: "var(--turq-soft)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Icon name="check" size={16} color="var(--turq-deep)" />
                    </span>
                  ) : isViewer ? (
                    <button className="btn btn-turq btn-sm" onClick={() => toggleConfirm(tripId, p.id)}>Confirmar</button>
                  ) : (
                    <span className="tag tag-sun">PENDIENTE</span>
                  )}
                </div>
                <Meter pct={pct} h={6} color={p.color} />
              </div>
            );
          })}
        </div>
        <div className="pb-nav" />
      </div>
    </div>
  );
}
