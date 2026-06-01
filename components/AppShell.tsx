import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Toast } from "./Toast";
import { ConfettiHost } from "./ConfettiHost";
import { GlobalSheets } from "./GlobalSheets";

/**
 * Responsive app shell. Always fills 100dvh. On phones it's a single column
 * with the bottom TabBar (rendered by the trip layout); on desktop a persistent
 * left Sidebar appears and the content column fills the rest. Global overlays
 * live here so they sit above both columns.
 */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="shell">
      <Sidebar />
      <main className="app">
        {children}
        <Toast />
        <ConfettiHost />
        <GlobalSheets />
      </main>
    </div>
  );
}
