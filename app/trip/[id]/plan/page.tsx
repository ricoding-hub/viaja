"use client";
import { useParams } from "next/navigation";
import { EmptyState } from "@/components/ui";
import { useReady, useTrip } from "@/lib/hooks";
import type { Tone } from "@/lib/types";

const TONE_COLOR: Record<string, string> = {
  "": "#11BFB2",
  pool: "#1d8fd1",
  sunset: "#ff8a5b",
  palm: "#2fbf8f",
  grape: "#7C6CF0",
  coral: "#FF6F5C",
  night: "#6a5acd",
};

export default function PlanPage() {
  const { id } = useParams<{ id: string }>();
  const tripId = String(id);
  const ready = useReady();
  const { trip, itinerary } = useTrip(tripId);

  if (!ready || !trip) return null;

  return (
    <div className="scroll">
      <div className="safe-top" />
      <div className="pad col gap14">
        <div>
          <h1 style={{ fontSize: 26 }}>Itinerario</h1>
          <p className="muted" style={{ fontSize: 13 }}>
            {itinerary.length ? `${trip.dates} · ${itinerary.length} días en el paraíso` : trip.dates}
          </p>
        </div>

        {itinerary.length === 0 ? (
          <EmptyState emoji="🗓️" title="El plan día a día" sub="Cuando elijan actividades y fechas, el itinerario se arma aquí." />
        ) : (
          <div style={{ position: "relative", paddingLeft: 4 }}>
            <div style={{ position: "absolute", left: 21, top: 8, bottom: 8, width: 2, background: "var(--line)" }} />
            <div className="col gap14">
              {itinerary.map((d) => {
                const color = TONE_COLOR[(d.tone as Tone) || ""] || TONE_COLOR[""];
                return (
                  <div key={d.day} className="row gap12" style={{ alignItems: "flex-start", position: "relative" }}>
                    <div className="col center" style={{ width: 44, height: 44, borderRadius: 14, background: color, color: "#fff", flex: "none", justifyContent: "center", zIndex: 1, boxShadow: "var(--sh-sm)" }}>
                      <span style={{ fontSize: 8, fontWeight: 700, letterSpacing: ".08em", opacity: 0.9 }}>DÍA</span>
                      <span style={{ fontFamily: "var(--font-d)", fontWeight: 800, fontSize: 18, lineHeight: 1 }}>{d.day}</span>
                    </div>
                    <div className="card card-p grow">
                      <span className="muted" style={{ fontSize: 12 }}>{d.date}</span>
                      <h4 style={{ fontSize: 16, margin: "2px 0 8px" }}>{d.title}</h4>
                      <div className="col gap6">
                        {d.items.map(([emoji, text], i) => (
                          <div key={i} className="row center gap8" style={{ fontSize: 13.5 }}>
                            <span style={{ fontSize: 16 }}>{emoji}</span>
                            <span>{text}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        <div className="pb-nav" />
      </div>
    </div>
  );
}
