"use client";
import { useParams, useRouter } from "next/navigation";
import { EmptyState, Skeleton } from "@/components/ui";
import { Screen } from "@/components/Screen";
import { AppHeader } from "@/components/AppHeader";
import { useReady, useTrip } from "@/lib/hooks";
import type { Tone } from "@/lib/types";

const TONE_COLOR: Record<string, string> = {
  "": "#11BFB2", pool: "#1d8fd1", sunset: "#ff8a5b", palm: "#2fbf8f", grape: "#7C6CF0", coral: "#FF6F5C", night: "#6a5acd",
};

export default function PlanPage() {
  const { id } = useParams<{ id: string }>();
  const tripId = String(id);
  const ready = useReady();
  const router = useRouter();
  const { trip, itinerary } = useTrip(tripId);

  const header = <AppHeader title="Itinerario" subtitle={trip?.dates} back={() => router.push(`/trip/${tripId}`)} />;
  if (!ready || !trip) return <Screen header={header}><Skeleton h={120} r={16} /></Screen>;

  return (
    <Screen header={header}>
      {itinerary.length === 0 ? (
        <EmptyState emoji="🗓️" title="El plan día a día" sub="Cuando elijan actividades y fechas, el itinerario se arma aquí." />
      ) : (
        <ol style={{ position: "relative", paddingLeft: 4, listStyle: "none", margin: 0 }}>
          <div style={{ position: "absolute", left: 21, top: 10, bottom: 10, width: 2, background: "var(--line)" }} aria-hidden />
          <div className="col gap14">
            {itinerary.map((d) => {
              const color = TONE_COLOR[(d.tone as Tone) || ""] || TONE_COLOR[""];
              return (
                <li key={d.day} className="row gap12" style={{ alignItems: "flex-start", position: "relative" }}>
                  <div className="col center" style={{ width: 44, height: 44, borderRadius: 14, background: color, color: "#fff", flex: "none", justifyContent: "center", zIndex: 1, boxShadow: "var(--sh-sm)" }} aria-label={`Día ${d.day}`}>
                    <span style={{ fontSize: 8, fontWeight: 700, letterSpacing: ".08em", opacity: 0.9 }}>DÍA</span>
                    <span className="tnum" style={{ fontFamily: "var(--font-d)", fontWeight: 800, fontSize: 18, lineHeight: 1 }}>{d.day}</span>
                  </div>
                  <div className="card card-p grow">
                    <span className="muted" style={{ fontSize: 12 }}>{d.date}</span>
                    <h3 className="h3" style={{ margin: "2px 0 8px" }}>{d.title}</h3>
                    <div className="col gap6">
                      {d.items.map(([emoji, text], i) => (
                        <div key={i} className="row center gap8" style={{ fontSize: 13.5 }}>
                          <span style={{ fontSize: 16 }}>{emoji}</span>
                          <span>{text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </li>
              );
            })}
          </div>
        </ol>
      )}
    </Screen>
  );
}
