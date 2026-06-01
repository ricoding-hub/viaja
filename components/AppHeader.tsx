import type { ReactNode } from "react";
import { Icon } from "@/components/ui";

interface AppHeaderProps {
  title: string;
  subtitle?: string;
  kicker?: string;
  /** mobile-only back affordance (desktop uses the sidebar) */
  back?: () => void;
  actions?: ReactNode;
  size?: "lg" | "md";
}

/** Consistent sticky, blurred page header used across screens. */
export function AppHeader({ title, subtitle, kicker, back, actions, size = "lg" }: AppHeaderProps) {
  return (
    <header className="appbar">
      <div className="safe-top" />
      <div className="appbar-row">
        {back && (
          <button className="icon-btn only-mobile" onClick={back} aria-label="Atrás" style={{ width: 40, height: 40 }}>
            <Icon name="chevL" size={20} />
          </button>
        )}
        <div className="grow" style={{ minWidth: 0 }}>
          {kicker && <div className="kicker">{kicker}</div>}
          <h1 className={size === "lg" ? "h1" : "h2"}>{title}</h1>
          {subtitle && <p className="muted" style={{ fontSize: 13, marginTop: 2 }}>{subtitle}</p>}
        </div>
        {actions && <div className="row center gap8" style={{ flex: "none" }}>{actions}</div>}
      </div>
    </header>
  );
}
