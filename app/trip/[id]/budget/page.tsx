"use client";
import { useParams, useRouter } from "next/navigation";
import { Count, EmptyState, Icon, Meter, fmt } from "@/components/ui";
import { useActions, useReady, useTrip } from "@/lib/hooks";
import { catMeta } from "@/lib/catMeta";
import { CAT_ORDER } from "@/lib/constants";

export default function BudgetPage() {
  const { id } = useParams<{ id: string }>();
  const tripId = String(id);
  const ready = useReady();
  const router = useRouter();
  const { trip, budget, isHost } = useTrip(tripId);
  const { setPeopleCount } = useActions();

  if (!ready || !trip) return null;

  const goal = trip.goalPerPerson;
  const overGoal = budget.perCap > goal;
  const diff = Math.abs(budget.perCap - goal);
  const total = budget.total;

  return (
    <div className="scroll">
      <div className="safe-top" />
      <div className="pad col gap14">
        <div>
          <h1 style={{ fontSize: 26 }}>Presupuesto</h1>
          <p className="muted" style={{ fontSize: 13 }}>Se actualiza solo con lo que eligen 💸</p>
        </div>

        {budget.optCount === 0 ? (
          <EmptyState emoji="💰" title="Sin números todavía" sub="Agrega opciones y, cuando el anfitrión elija, el presupuesto se arma aquí." cta="Agregar opciones" onCta={() => router.push(`/trip/${tripId}/options`)} />
        ) : (
          <>
            {/* hero */}
            <div className="card-p" style={{ borderRadius: 24, background: "linear-gradient(135deg, var(--turq), var(--turq-deep))", color: "#fff", boxShadow: "var(--sh-turq)" }}>
              <div className="kicker" style={{ color: "rgba(255,255,255,.85)" }}>Por persona</div>
              <div className="display" style={{ fontSize: 50, marginTop: 4 }}>
                <Count value={Math.round(budget.perCap)} prefix="$" />
              </div>
              <p style={{ opacity: 0.9, fontSize: 13, marginTop: 4 }}>{trip.people} personas · total {fmt(total)}</p>
            </div>

            {/* people slider */}
            <div className="card card-p col gap10">
              <div className="row center between">
                <span className="row center gap8">
                  <Icon name="users" size={18} color="var(--coral)" />
                  <span className="kicker">¿Cuántos van?</span>
                </span>
                <b style={{ fontFamily: "var(--font-d)", fontSize: 24 }}>{trip.people}</b>
              </div>
              <input type="range" className="coral" min={2} max={12} value={trip.people} disabled={!isHost} onChange={(e) => setPeopleCount(tripId, Number(e.target.value))} />
              <p className="muted" style={{ fontSize: 12 }}>
                {isHost ? "Entre más personas, la casa se reparte más barata por cabeza." : "Solo el anfitrión ajusta cuántos van."}
              </p>
            </div>

            {/* goal */}
            <div className="card card-p col gap10">
              <div className="row center between">
                <span className="kicker">Meta por persona</span>
                <b style={{ fontFamily: "var(--font-d)", fontSize: 15 }}>{fmt(goal)}</b>
              </div>
              <Meter pct={Math.min(100, (budget.perCap / goal) * 100)} color={overGoal ? "var(--coral)" : "var(--turq)"} />
              <p style={{ fontSize: 12.5, color: overGoal ? "var(--coral-deep)" : "var(--turq-deep)", fontWeight: 700 }}>
                {overGoal ? `⚠️ Van ${fmt(diff)} arriba de la meta` : `🎉 ¡Van ${fmt(diff)} por debajo de la meta!`}
              </p>
            </div>

            {/* breakdown */}
            <h3 style={{ fontSize: 17, marginTop: 4 }}>Desglose</h3>
            <div className="col gap10">
              {CAT_ORDER.map((cat) => {
                const b = budget.byCat[cat];
                const meta = catMeta[cat];
                const share = total ? (b.subtotal / total) * 100 : 0;
                return (
                  <button key={cat} type="button" onClick={() => router.push(`/trip/${tripId}/options`)} className="card card-p col gap10" style={{ cursor: "pointer", textAlign: "left" }}>
                    <div className="row center between">
                      <span className="row center gap8">
                        <span style={{ width: 34, height: 34, borderRadius: 10, background: meta.color + "1f", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Icon name={meta.icon} size={17} color={meta.color} />
                        </span>
                        <span className="col" style={{ alignItems: "flex-start" }}>
                          <b style={{ fontFamily: "var(--font-d)", fontSize: 14.5 }}>{meta.label}</b>
                          <span className="muted ellip" style={{ fontSize: 12, maxWidth: 150 }}>{b.note}</span>
                        </span>
                      </span>
                      <div style={{ textAlign: "right" }}>
                        <b style={{ fontFamily: "var(--font-d)", fontSize: 15 }}>{fmt(b.subtotal)}</b>
                        <div className="muted" style={{ fontSize: 11 }}>{fmt(b.perPerson)} c/u</div>
                      </div>
                    </div>
                    <Meter pct={share} color={meta.color} h={6} />
                  </button>
                );
              })}
            </div>
          </>
        )}
        <div className="pb-nav" />
      </div>
    </div>
  );
}
