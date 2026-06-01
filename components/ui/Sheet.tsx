"use client";
import { useEffect, useRef, type ReactNode } from "react";

/** Bottom-sheet on phones / centered modal on desktop. Dialog semantics +
 *  Esc-to-close + focus-on-open. The focus effect depends only on `open`
 *  (onClose is read via a ref) so typing in inputs does NOT re-run it — that
 *  was stealing focus and closing the mobile keyboard on every keystroke. */
export function Sheet({ open, onClose, children }: { open: boolean; onClose: () => void; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCloseRef.current();
    };
    document.addEventListener("keydown", onKey);
    // Move focus into the dialog once, but never steal it from an autofocus input.
    const t = setTimeout(() => {
      const el = ref.current;
      if (el && !el.contains(document.activeElement)) el.focus();
    }, 40);
    return () => {
      document.removeEventListener("keydown", onKey);
      clearTimeout(t);
    };
  }, [open]);

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
