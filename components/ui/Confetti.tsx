"use client";

/** Confetti burst (ported from prototype `Confetti`). */
export function Confetti({ show }: { show: boolean }) {
  if (!show) return null;
  const colors = ["#11BFB2", "#FF6F5C", "#FFB43E", "#7C6CF0", "#0E8AA6"];
  const pcs = Array.from({ length: 36 }, (_, i) => ({
    left: Math.random() * 100,
    bg: colors[i % colors.length],
    delay: Math.random() * 0.3,
    dur: 1.1 + Math.random() * 0.7,
    rot: Math.random() * 360,
    round: i % 3 === 0,
  }));
  return (
    <div className="confetti-wrap">
      {pcs.map((c, i) => (
        <div
          key={i}
          className="confetti-pc"
          style={{
            left: c.left + "%",
            background: c.bg,
            animationDelay: c.delay + "s",
            animationDuration: c.dur + "s",
            transform: `rotate(${c.rot}deg)`,
            borderRadius: c.round ? "50%" : "2px",
          }}
        />
      ))}
    </div>
  );
}
