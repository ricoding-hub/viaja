"use client";
import { useUI } from "@/store/ui";

export function Toast() {
  const toast = useUI((s) => s.toast);
  if (!toast) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        bottom: 100,
        transform: "translateX(-50%)",
        zIndex: 90,
        background: "var(--ink)",
        color: "#fff",
        padding: "12px 18px",
        borderRadius: 16,
        fontFamily: "var(--font-d)",
        fontWeight: 700,
        fontSize: 13.5,
        whiteSpace: "nowrap",
        maxWidth: "92%",
        boxShadow: "var(--sh-lg)",
        animation: "pop .3s cubic-bezier(.34,1.56,.64,1) both",
      }}
    >
      {toast}
    </div>
  );
}
