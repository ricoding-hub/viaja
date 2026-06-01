import type { CSSProperties, ReactNode } from "react";

/** Responsive auto-fit grid. Columns reflow by available width (no overflow). */
export function PageGrid({
  children,
  min = 260,
  gap = 12,
  className,
  style,
}: {
  children: ReactNode;
  min?: number;
  gap?: number;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      className={className}
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(auto-fit, minmax(min(${min}px, 100%), 1fr))`,
        gap,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
