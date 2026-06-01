"use client";
import { useEffect, useRef, type ReactNode } from "react";

/** Bottom-sheet on phones / centered modal on desktop (ported from prototype `Sheet`).
 *  Adds dialog semantics, Esc-to-close, and focus-on-open. */
export function Sheet({ open, onClose, children }: { open: boolean; onClose: () => void; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const t = setTimeout(() => ref.current?.focus(), 30);
    return () => {
      document.removeEventListener("keydown", onKey);
      clearTimeout(t);
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="sheet-bg" onClick={onClose}>
      <div ref={ref} className="sheet" role="dialog" aria-modal="true" tabIndex={-1} onClick={(e) => e.stopPropagation()}>
        <div className="sheet-grab" />
        {children}
      </div>
    </div>
  );
}
