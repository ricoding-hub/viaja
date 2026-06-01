"use client";
import { useEffect, useRef, useState } from "react";

/** Animated count-up number (ported from prototype `Count`). */
export function Count({
  value,
  prefix = "",
  dur = 700,
  cls = "",
}: {
  value: number;
  prefix?: string;
  dur?: number;
  cls?: string;
}) {
  const [n, setN] = useState(value);
  const from = useRef(value);
  useEffect(() => {
    const start = performance.now();
    const a = from.current;
    const b = value;
    let raf: number;
    const tick = (t: number) => {
      const k = Math.min(1, (t - start) / dur);
      const e = 1 - Math.pow(1 - k, 3);
      setN(a + (b - a) * e);
      if (k < 1) raf = requestAnimationFrame(tick);
      else from.current = b;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
  return (
    <span className={cls + " tnum"}>
      {prefix}
      {Math.round(n).toLocaleString("es-MX")}
    </span>
  );
}
