import type { Person } from "@/lib/types";

export function Av({ p, size = 30 }: { p: Person; size?: number }) {
  const style: React.CSSProperties = { width: size, height: size, fontSize: size * 0.4 };
  if (p.avatarUrl) {
    style.backgroundImage = `url(${p.avatarUrl})`;
  } else {
    style.background = p.color;
  }
  return (
    <div className="av" title={p.name} style={style}>
      {p.avatarUrl ? "" : p.initials}
    </div>
  );
}

export function AvStack({ people, size = 28, max = 5 }: { people: Person[]; size?: number; max?: number }) {
  const show = people.slice(0, max);
  return (
    <div className="av-stack">
      {show.map((p) => (
        <Av key={p.id} p={p} size={size} />
      ))}
    </div>
  );
}
