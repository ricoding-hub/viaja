import type { CSSProperties, ReactNode } from "react";
import type { Tone } from "@/lib/types";
import { gradSrc } from "@/lib/tones";

export { gradSrc };

export interface PhotoProps {
  tone?: Tone | string;
  emoji?: string;
  label?: string;
  h?: number | string;
  r?: number | string;
  /** real uploaded image url; when present it covers the gradient */
  src?: string | null;
  alt?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

/**
 * Tropical gradient placeholder (ported from prototype `Photo`), extended to
 * render a real cover image when `src` is provided.
 */
export function Photo({ tone = "", emoji, label, h = 150, r, src, alt, style = {}, children }: PhotoProps) {
  const cls = tone ? `ph ph-${tone}` : "ph";
  return (
    <div className={cls} style={{ height: h, borderRadius: r, ...style }}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt || ""} className="ph-img" />
      ) : (
        <>
          {emoji && <div className="ph-emoji floaty">{emoji}</div>}
          {label && <div className="ph-label">▦ {label}</div>}
        </>
      )}
      {children}
    </div>
  );
}
