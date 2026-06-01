import type { ResearchType } from "@/lib/types";
import { Icon } from "./Icon";

/** Colored glyph for a research source type (ported from `SourceGlyph`). */
export function SourceGlyph({ type }: { type: ResearchType | string }) {
  const map: Record<string, [string, string]> = {
    tiktok: ["music", "#FF6F5C"],
    flight: ["plane", "#7C6CF0"],
    link: ["link", "#11BFB2"],
    note: ["note", "#FFB43E"],
  };
  const [ic, col] = map[type] || ["link", "#11BFB2"];
  return (
    <div
      style={{
        width: 34,
        height: 34,
        borderRadius: 11,
        background: col + "22",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flex: "none",
      }}
    >
      <Icon name={ic} size={18} color={col} stroke={2.2} />
    </div>
  );
}
