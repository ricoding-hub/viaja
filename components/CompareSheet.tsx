"use client";
import { Icon, Photo, Sheet, avg, fmt } from "@/components/ui";
import { catMeta } from "@/lib/catMeta";
import type { Cat, OptionItem } from "@/lib/types";

const UNIT_LABEL: Record<string, string> = { total: "total", pp: "/persona", ppd: "/persona/día" };

export function CompareSheet({ open, cat, options, onClose }: { open: boolean; cat: Cat | null; options: OptionItem[]; onClose: () => void }) {
  if (!cat) return null;
  const meta = catMeta[cat];
  // union of meta keys, preserving first-seen order
  const keys: string[] = [];
  options.forEach((o) => o.meta.forEach(([k]) => { if (!keys.includes(k)) keys.push(k); }));
  const valueOf = (o: OptionItem, key: string) => o.meta.find(([k]) => k === key)?.[1] ?? "—";

  const cell = (winner: boolean, extra: React.CSSProperties = {}): React.CSSProperties => ({
    padding: "10px 12px",
    borderBottom: "1px solid var(--line)",
    fontSize: 13,
    background: winner ? "var(--turq-soft)" : "transparent",
    ...extra,
  });
  const label: React.CSSProperties = { padding: "10px 12px", borderBottom: "1px solid var(--line)", fontSize: 11, fontFamily: "var(--font-d)", fontWeight: 700, color: "var(--ink-soft)", textTransform: "uppercase", letterSpacing: ".06em", position: "sticky", left: 0, background: "var(--sand)" };

  return (
    <Sheet open={open} onClose={onClose}>
      <div className="row center gap8" style={{ marginBottom: 12 }}>
        <Icon name={meta.icon} size={20} color={meta.color} />
        <h2 style={{ fontSize: 20 }}>Comparar {meta.label}</h2>
      </div>

      <div style={{ overflowX: "auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: `92px repeat(${options.length}, minmax(132px, 1fr))`, minWidth: "min-content", border: "1px solid var(--line)", borderRadius: 14, overflow: "hidden", background: "#fff" }}>
          {/* header */}
          <div style={{ ...label }} />
          {options.map((o) => (
            <div key={o.id} style={cell(o.winner, { display: "flex", flexDirection: "column", gap: 6 })}>
              <Photo tone={o.tone} src={o.coverUrl || undefined} h={52} r={10} />
              <b style={{ fontFamily: "var(--font-d)", fontSize: 13 }}>{o.title}</b>
              {o.winner && <span className="tag tag-win" style={{ alignSelf: "flex-start" }}>Elegida</span>}
            </div>
          ))}

          {/* precio */}
          <div style={label}>Precio</div>
          {options.map((o) => (
            <div key={o.id} style={cell(o.winner)}>
              <b style={{ fontFamily: "var(--font-d)" }}>{o.price === 0 ? "Gratis" : fmt(o.price)}</b>
              <span className="muted" style={{ fontSize: 11 }}> {UNIT_LABEL[o.unit]}</span>
            </div>
          ))}

          {/* rating */}
          <div style={label}>Rating</div>
          {options.map((o) => {
            const r = avg(o.votes);
            return (
              <div key={o.id} style={cell(o.winner)}>
                <span className="row center gap4">
                  <Icon name="star" size={13} color="#FFB43E" fill="#FFB43E" stroke={1.5} /> {r ? r.toFixed(1) : "—"}
                </span>
              </div>
            );
          })}

          {/* meta rows */}
          {keys.map((k) => (
            <Row key={k}>
              <div style={label}>{k}</div>
              {options.map((o) => (
                <div key={o.id} style={cell(o.winner)}>{valueOf(o, k)}</div>
              ))}
            </Row>
          ))}
        </div>
      </div>

      <button className="btn btn-ghost btn-block" style={{ marginTop: 16 }} onClick={onClose}>Cerrar</button>
    </Sheet>
  );
}

/** Grid is flat; this fragment just groups a row's cells for readability. */
function Row({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
