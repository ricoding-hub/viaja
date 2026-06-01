import type { ReactNode } from "react";

export function Meter({ pct, color = "var(--turq)", h = 10 }: { pct: number; color?: string; h?: number }) {
  return (
    <div className="meter" style={{ height: h }}>
      <i style={{ width: Math.min(100, Math.max(0, pct)) + "%", background: color }} />
    </div>
  );
}

export function Ring({
  pct,
  size = 64,
  sw = 8,
  color = "var(--turq)",
  track = "#EFE6D7",
  children,
}: {
  pct: number;
  size?: number;
  sw?: number;
  color?: string;
  track?: string;
  children?: ReactNode;
}) {
  const r = (size - sw) / 2;
  const c = 2 * Math.PI * r;
  const off = c - (Math.min(100, pct) / 100) * c;
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} className="ring">
        <circle cx={size / 2} cy={size / 2} r={r} stroke={track} strokeWidth={sw} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={sw}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={off}
        />
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
        }}
      >
        {children}
      </div>
    </div>
  );
}
