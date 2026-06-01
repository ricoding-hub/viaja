import type { CSSProperties } from "react";

export function Skeleton({
  w = "100%",
  h = 16,
  r = 12,
  style,
}: {
  w?: number | string;
  h?: number | string;
  r?: number | string;
  style?: CSSProperties;
}) {
  return <div className="skeleton" style={{ width: w, height: h, borderRadius: r, ...style }} aria-hidden />;
}

export function Spinner({ size = 28 }: { size?: number }) {
  return <div className="spinner" style={{ width: size, height: size }} role="status" aria-label="Cargando" />;
}
