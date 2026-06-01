"use client";
import { useState } from "react";
import { Icon } from "./Icon";

export interface StarsProps {
  value?: number;
  onRate?: (n: number) => void;
  size?: number;
  readOnly?: boolean;
}

/** Interactive 5-star rating (ported from prototype `Stars`). */
export function Stars({ value = 0, onRate, size = 22, readOnly = false }: StarsProps) {
  const [pop, setPop] = useState(-1);
  return (
    <div className="stars">
      {[1, 2, 3, 4, 5].map((n) => {
        const on = n <= value;
        return (
          <button
            type="button"
            key={n}
            className={"star" + (pop === n ? " pop" : "")}
            onClick={
              readOnly
                ? undefined
                : (e) => {
                    e.stopPropagation();
                    setPop(n);
                    onRate?.(n);
                    setTimeout(() => setPop(-1), 420);
                  }
            }
            style={{ cursor: readOnly ? "default" : "pointer" }}
            aria-label={`${n} estrella${n > 1 ? "s" : ""}`}
          >
            <Icon name="star" size={size} stroke={1.5} color={on ? "#FFB43E" : "#E2D8C8"} fill={on ? "#FFB43E" : "#F2EADD"} />
          </button>
        );
      })}
    </div>
  );
}
