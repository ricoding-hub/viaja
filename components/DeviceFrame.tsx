import type { ReactNode } from "react";

/**
 * Wraps the app in a tropical "stage". On phones the app is full-bleed; on
 * desktop it renders inside an iPhone-style bezel for a faithful preview.
 * (Replaces the prototype ios-frame.jsx — presentation only.)
 */
export function DeviceFrame({ children }: { children: ReactNode }) {
  return (
    <div className="stage">
      <div className="device app">{children}</div>
    </div>
  );
}
