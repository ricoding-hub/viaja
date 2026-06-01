"use client";
import { AvStack, Icon, Stars, avg, fmt } from "@/components/ui";
import { PhotoUpload } from "@/components/PhotoUpload";
import type { OptionItem, Person } from "@/lib/types";

const UNIT_LABEL: Record<string, string> = { total: "total", pp: "/persona", ppd: "/persona/día" };

export function OptionCard({
  o,
  members,
  viewerId,
  canChoose,
  onRate,
  onChoose,
  onCover,
}: {
  o: OptionItem;
  members: Person[];
  viewerId: string;
  canChoose: boolean;
  onRate: (n: number) => void;
  onChoose: () => void;
  onCover: (url: string) => void;
}) {
  const myVote = o.votes[viewerId] || 0;
  const rating = avg(o.votes);
  const voters = members.filter((m) => o.votes[m.id] != null);
  const voteCount = Object.keys(o.votes).length;

  return (
    <div className="card" style={{ overflow: "hidden", border: o.winner ? "2px solid var(--turq)" : "1px solid var(--line)", boxShadow: o.winner ? "var(--sh-md)" : "var(--sh-sm)" }}>
      <div style={{ position: "relative" }}>
        <PhotoUpload id={`photo-${o.id}`} kind="option" tone={o.tone} value={o.coverUrl} alt={o.title} editable={canChoose} onChange={onCover} h={132} r={0} editVariant="icon" editPosition="tl" editLabel="Cambiar foto">
          {o.winner && (
            <span className="tag tag-win" style={{ position: "absolute", top: 10, right: 10 }}>
              <Icon name="trophy" size={13} color="#fff" /> Elegida
            </span>
          )}
        </PhotoUpload>
      </div>

      <div style={{ padding: 14 }}>
        <div className="row between" style={{ alignItems: "flex-start", gap: 10 }}>
          <div className="grow" style={{ minWidth: 0 }}>
            <h4 style={{ fontSize: 16 }}>{o.title}</h4>
            <p className="muted" style={{ fontSize: 12.5, marginTop: 2 }}>{o.subtitle}</p>
          </div>
          <div style={{ textAlign: "right", flex: "none" }}>
            <div style={{ fontFamily: "var(--font-d)", fontWeight: 800, fontSize: 18, color: "var(--turq-deep)" }}>
              {o.price === 0 ? "Gratis" : fmt(o.price)}
            </div>
            <div className="muted" style={{ fontSize: 11 }}>{UNIT_LABEL[o.unit]}</div>
          </div>
        </div>

        {o.meta.length > 0 && (
          <div className="row" style={{ flexWrap: "wrap", gap: 6, marginTop: 10 }}>
            {o.meta.map(([k, v], i) => (
              <span key={i} className="tag" style={{ background: "var(--sand-2)", color: "var(--ink-2)" }}>
                {k}: <b>{v}</b>
              </span>
            ))}
          </div>
        )}

        {o.link && (
          <div className="row center gap6 muted" style={{ fontSize: 12, marginTop: 10 }}>
            <Icon name="link" size={14} color="var(--ink-soft)" />
            <span className="ellip">{o.link}</span>
          </div>
        )}

        <div style={{ height: 1, background: "var(--line)", margin: "12px 0" }} />

        <div className="row center between">
          <div className="col gap4">
            <span className="kicker" style={{ fontSize: 10 }}>Tu voto</span>
            <Stars value={myVote} onRate={onRate} size={22} />
          </div>
          <div className="col" style={{ alignItems: "flex-end", gap: 4 }}>
            <div className="row center gap4">
              <Icon name="star" size={15} color="#FFB43E" fill="#FFB43E" stroke={1.5} />
              <b style={{ fontFamily: "var(--font-d)", fontSize: 14 }}>{rating ? rating.toFixed(1) : "—"}</b>
            </div>
            <div className="row center gap6">
              <AvStack people={voters} size={20} max={4} />
              <span className="muted" style={{ fontSize: 11 }}>{voteCount} {voteCount === 1 ? "voto" : "votos"}</span>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 12 }}>
          {canChoose ? (
            <button className={"btn btn-block btn-sm " + (o.winner ? "btn-turq" : "btn-ghost")} onClick={onChoose}>
              {o.winner ? "✓ Elegida para el plan" : "Elegir esta opción"}
            </button>
          ) : o.winner ? (
            <div className="tag tag-turq" style={{ width: "100%", justifyContent: "center", padding: "9px" }}>Elegida por el anfitrión</div>
          ) : (
            <p className="muted" style={{ fontSize: 12, textAlign: "center" }}>Tu voto ayuda a decidir ⭐</p>
          )}
        </div>
      </div>
    </div>
  );
}
