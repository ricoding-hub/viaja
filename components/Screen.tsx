import type { ReactNode } from "react";

interface ScreenProps {
  children: ReactNode;
  /** sticky page header (usually <AppHeader/>) */
  header?: ReactNode;
  /** full-bleed content above the padded container (e.g. dashboard hero) */
  bleed?: ReactNode;
  width?: "default" | "wide" | "narrow";
  className?: string;
}

/** Scroll region + responsive max-width container + bottom-nav clearance.
 *  Replaces the repeated `.scroll / .safe-top / .pad / .pb-nav` scaffold. */
export function Screen({ children, header, bleed, width = "default", className }: ScreenProps) {
  const w = width === "default" ? "" : " " + width;
  return (
    <div className={"screen" + (className ? " " + className : "")}>
      {bleed}
      <div className={"container" + w}>
        {header}
        {children}
        <div className="pb-nav" />
      </div>
    </div>
  );
}
