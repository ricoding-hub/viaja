/** Reusable empty state (ported from prototype `EmptyState`). */
export function EmptyState({
  emoji,
  title,
  sub,
  cta,
  onCta,
  disabled,
}: {
  emoji: string;
  title: string;
  sub: string;
  cta?: string;
  onCta?: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="col center" style={{ textAlign: "center", padding: "38px 24px", gap: 10 }}>
      <div className="floaty" style={{ fontSize: 52 }}>
        {emoji}
      </div>
      <h3 style={{ fontSize: 20 }}>{title}</h3>
      <p className="muted" style={{ fontSize: 14, maxWidth: 260, lineHeight: 1.5 }}>
        {sub}
      </p>
      {cta && (
        <button className="btn btn-coral btn-sm" style={{ marginTop: 6 }} onClick={onCta} disabled={disabled}>
          {cta}
        </button>
      )}
    </div>
  );
}
