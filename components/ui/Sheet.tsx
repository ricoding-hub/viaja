"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

// Ref-count open sheets so the body class only clears when the last one closes.
let openSheets = 0;

/** Bottom-sheet on phones / centered modal on desktop. Rendered through a
 *  portal to <body> so it escapes any page stacking context (it always sits
 *  above the bottom nav, which we also hide via `body.sheet-open`). The focus
 *  effect depends only on `open` (onClose is read via a ref) so typing in
 *  inputs does NOT re-run it — that was stealing focus and closing the mobile
 *  keyboard on every keystroke. */
export function Sheet({ open, onClose, children }: { open: boolean; onClose: () => void; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    openSheets += 1;
    document.body.classList.add("sheet-open");
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
      openSheets = Math.max(0, openSheets - 1);
      if (openSheets === 0) document.body.classList.remove("sheet-open");
    };
  }, [open]);

  // Keep the tapped field above the on-screen keyboard (iOS Safari).
  function onFocusField(e: React.FocusEvent<HTMLDivElement>) {
    const t = e.target as HTMLElement;
    if (t.matches("input, textarea, select")) {
      setTimeout(() => t.scrollIntoView({ block: "center", behavior: "smooth" }), 120);
    }
  }

  if (!open || !mounted) return null;
  return createPortal(
    <div className="sheet-bg" onClick={onClose}>
      <div
        ref={ref}
        className="sheet"
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        onFocusCapture={onFocusField}
      >
        <div className="sheet-grab" />
        {children}
      </div>
    </div>,
    document.body
  );
}
