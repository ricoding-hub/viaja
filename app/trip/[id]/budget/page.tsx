"use client";
import { useParams, useRouter } from "next/navigation";
import { Count, EmptyState, Icon, Meter, Skeleton, fmt } from "@/components/ui";
import { Screen } from "@/components/Screen";
import { AppHeader } from "@/components/AppHeader";
import { PageGrid } from "@/components/PageGrid";
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

  const header = <AppHeader title="Presupuesto" subtitle="Se actualiza solo con lo que eligen 💸" back={() => router.push(`/trip/${tripId}`)} />;

  if (!ready || !trip) {
    return <Screen header={header}><div className="col gap14"><Skeleton h={150} r={22} /><Skeleton h={120} r={18} /><Skeleton h={96} r={18} /></div></Screen>;
  }

  const goal = trip.goalPerPerson;
  const overGoal = budget.perCap > goal;
  const diff = Math.abs(budget.perCap - goal);

  return (
    <Screen header={header}>
      {budget.optCount === 0 ? (
        <EmptyState emoji="💰" title="Sin números todavía" sub="Agrega opciones y, cuando el anfitrión elija, el presupuesto se arma aquí." cta="Agregar opciones" onCta={() => router.push(`/trip/${tripId}/options`)} />
      ) : (
        <div className="col gap14">
          {/* hero */}
          <div className="card-p" style={{ borderRadius: 24, background: "linear-gradient(135deg, var(--turq), var(--turq-deep))", color: "#fff", boxShadow: "var(--sh-turq)" }}>
            <div className="kicker" style={{ color: "rgba(255,255,255,.85)" }}>Por persona</div>
            <div className="display" style={{ fontSize: "var(--fs-display)", marginTop: 4 }}>
              <Count value={Math.round(budget.perCap)} prefix="$" />
            </div>
            <p style={{ opacity: 0.92, fontSize: 13.5, marginTop: 4 }}>{trip.people} personas · total {fmt(budget.total)}</p>
          </div>

          {/* people slider */}
          <div className="card card-p col gap10">
            <div className="row center between">
              <span className="row center gap8">
                <Icon name="users" size={18} color="var(--coral)" />
                <span className="kicker">¿Cuántos van?</span>
              </span>
              <b className="tnum" style={{ fontFamily: "var(--font-d)", fontSize: 24 }}>{trip.people}</b>
            </div>
            <input type="range" className="coral" min={2} max={12} value={trip.people} disabled={!isHost} onChange={(e) => setPeopleCount(tripId, Number(e.target.value))} aria-label="Número de personas" />
            <p className="muted" style={{ fontSize: 12 }}>
              {isHost ? "Entre más personas, la casa se reparte más barata por cabeza." : "Solo el anfitrión ajusta cuántos van."}
            </p>
          </div>

          {/* goal */}
          <div className="card card-p col gap10">
            <div className="row center between">
              <span className="kicker">Meta por persona</span>
              <b className="tnum" style={{ fontFamily: "var(--font-d)", fontSize: 15 }}>{fmt(goal)}</b>
            </div>
            <Meter pct={Math.min(100, (budget.perCap / goal) * 100)} color={overGoal ? "var(--coral)" : "var(--turq)"} />
            <p style={{ fontSize: 12.5, color: overGoal ? "var(--coral-deep)" : "var(--turq-deep)", fontWeight: 700 }}>
              {overGoal ? `⚠️ Van ${fmt(diff)} arriba de la meta` : `🎉 ¡Van ${fmt(diff)} por debajo de la meta!`}
            </p>
          </div>

          {/* breakdown */}
          <h2 className="h2" style={{ marginTop: 4 }}>Desglose</h2>
          <PageGrid min={300} gap={10}>
            {CAT_ORDER.map((cat) => {
              const b = budget.byCat[cat];
              const meta = catMeta[cat];
              const share = budget.total ? (b.subtotal / budget.total) * 100 : 0;
              return (
                <button key={cat} type="button" onClick={() => router.push(`/trip/${tripId}/options`)} className="card card-int card-p col gap10" style={{ textAlign: "left" }}>
                  <div className="row center between">
                    <span className="row center gap8" style={{ minWidth: 0 }}>
                      <span style={{ width: 36, height: 36, borderRadius: 10, background: meta.color + "1f", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
                        <Icon name={meta.icon} size={17} color={meta.color} />
                      </span>
                      <span className="col" style={{ alignItems: "flex-start", minWidth: 0 }}>
                        <b style={{ fontFamily: "var(--font-d)", fontSize: 14.5 }}>{meta.label}</b>
                        <span className="muted ellip" style={{ fontSize: 12, maxWidth: 170 }}>{b.note}</span>
                      </span>
                    </span>
                    <div style={{ textAlign: "right", flex: "none" }}>
                      <b className="tnum" style={{ fontFamily: "var(--font-d)", fontSize: 15 }}>{fmt(b.subtotal)}</b>
                      <div className="muted tnum" style={{ fontSize: 11 }}>{fmt(b.perPerson)} c/u</div>
                    </div>
                  </div>
                  <Meter pct={share} color={meta.color} h={6} />
                </button>
              );
            })}
          </PageGrid>
        </div>
      )}
    </Screen>
  );
}
