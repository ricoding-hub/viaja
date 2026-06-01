import type { ReactNode } from "react";

export interface IconProps {
  name: string;
  size?: number;
  stroke?: number;
  color?: string;
  fill?: string;
}

/** Inline-SVG icon set (ported verbatim from the prototype `Icon`). */
export function Icon({ name, size = 24, stroke = 2, color = "currentColor", fill = "none" }: IconProps) {
  const paths: Record<string, ReactNode> = {
    home: <path d="M3 11l9-8 9 8M5 10v10h5v-6h4v6h5V10" />,
    compass: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M16 8l-2 6-6 2 2-6 6-2z" />
      </>
    ),
    wallet: (
      <>
        <rect x="3" y="6" width="18" height="14" rx="3" />
        <path d="M3 10h18M17 14h.01" />
      </>
    ),
    layers: (
      <>
        <path d="M12 3l9 5-9 5-9-5 9-5z" />
        <path d="M3 13l9 5 9-5" />
      </>
    ),
    inbox: (
      <>
        <path d="M4 4h16v16H4z" />
        <path d="M4 13h4l2 3h4l2-3h4" />
      </>
    ),
    calendar: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="3" />
        <path d="M3 9h18M8 3v4M16 3v4" />
      </>
    ),
    users: (
      <>
        <circle cx="9" cy="8" r="3.2" />
        <path d="M3 20c0-3.3 2.7-5 6-5s6 1.7 6 5" />
        <path d="M16 5.2A3.2 3.2 0 0119 11M21 20c0-2.4-1.2-4-3-4.6" />
      </>
    ),
    plus: <path d="M12 5v14M5 12h14" />,
    bed: (
      <>
        <path d="M3 18v-6a2 2 0 012-2h9a3 3 0 013 3v5M3 14h18M3 18v2M21 16v4" />
        <circle cx="7.5" cy="11.5" r="1.6" />
      </>
    ),
    plane: <path d="M10.5 2.5L12 9l8 4-8 1.5L11 21l-2-5-5-2 5-1.5 1.5-9z" />,
    star: <path d="M12 2.5l2.9 6 6.6.8-4.9 4.5 1.3 6.5L12 17.2 6.1 20.3l1.3-6.5L2.5 9.3l6.6-.8L12 2.5z" />,
    food: (
      <>
        <path d="M5 3v8a2 2 0 002 2v8M7 3v6M9 3v6M9 3v8" />
        <path d="M16 3c-1.6 0-2.5 2-2.5 5s.9 4 2.5 4v8" />
      </>
    ),
    pin: (
      <>
        <path d="M12 21s-7-6-7-11a7 7 0 0114 0c0 5-7 11-7 11z" />
        <circle cx="12" cy="10" r="2.5" />
      </>
    ),
    link: <path d="M9 15l6-6M10 6l1-1a4 4 0 016 6l-1 1M14 18l-1 1a4 4 0 01-6-6l1-1" />,
    note: (
      <>
        <rect x="4" y="3" width="16" height="18" rx="3" />
        <path d="M8 8h8M8 12h8M8 16h5" />
      </>
    ),
    music: (
      <>
        <circle cx="6" cy="18" r="2.6" />
        <circle cx="17" cy="16" r="2.6" />
        <path d="M8.6 18V7l11-2v9" />
      </>
    ),
    heart: <path d="M12 20S4 14.5 4 9.2A4.2 4.2 0 0112 6a4.2 4.2 0 018 3.2C20 14.5 12 20 12 20z" />,
    check: <path d="M5 12l4.5 4.5L19 7" />,
    chevR: <path d="M9 6l6 6-6 6" />,
    chevL: <path d="M15 6l-6 6 6 6" />,
    chevD: <path d="M6 9l6 6 6-6" />,
    share: (
      <>
        <circle cx="6" cy="12" r="2.4" />
        <circle cx="17" cy="6" r="2.4" />
        <circle cx="17" cy="18" r="2.4" />
        <path d="M8.2 11L15 7M8.2 13L15 17" />
      </>
    ),
    sparkle: <path d="M12 3l1.6 5.4L19 10l-5.4 1.6L12 17l-1.6-5.4L5 10l5.4-1.6L12 3z" />,
    sun: (
      <>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M19 5l-1.5 1.5M6.5 17.5L5 19" />
      </>
    ),
    close: <path d="M6 6l12 12M18 6L6 18" />,
    edit: <path d="M4 20h4L19 9l-4-4L4 16v4zM14 6l4 4" />,
    bell: <path d="M6 16V10a6 6 0 0112 0v6l2 2H4l2-2zM10 21h4" />,
    trophy: (
      <>
        <path d="M7 4h10v4a5 5 0 01-10 0V4z" />
        <path d="M7 6H4v1a3 3 0 003 3M17 6h3v1a3 3 0 01-3 3M9 16h6M8 20h8M12 13v3" />
      </>
    ),
    flame: <path d="M12 3c1 3-2 4-2 7a2 2 0 004 0c0-1 0-1.5-.3-2 1.6 1 2.3 2.7 2.3 4.5A6 6 0 116 13c0-2 1-3 2-4 1.5 1 2 .5 2-1 0-2 1-4 2-5z" />,
    ticket: (
      <>
        <path d="M4 7a2 2 0 012-2h12a2 2 0 012 2v2a2 2 0 000 6v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2a2 2 0 000-6V7z" />
        <path d="M14 5v14" strokeDasharray="2 2" />
      </>
    ),
    mail: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="3" />
        <path d="M4 7l8 6 8-6" />
      </>
    ),
    logout: <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />,
    arrowL: <path d="M19 12H5M11 18l-6-6 6-6" />,
    copy: (
      <>
        <rect x="9" y="9" width="12" height="12" rx="2" />
        <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
      </>
    ),
    camera: (
      <>
        <path d="M4 8a2 2 0 012-2h2l1.5-2h5L16 6h2a2 2 0 012 2v9a2 2 0 01-2 2H6a2 2 0 01-2-2V8z" />
        <circle cx="12" cy="12.5" r="3.2" />
      </>
    ),
    settings: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 13.5a1.7 1.7 0 00.3 1.9l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-2.8 1.2V21a2 2 0 01-4 0v-.1a1.7 1.7 0 00-2.8-1.2l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00-1.2-2.8H3a2 2 0 010-4h.1A1.7 1.7 0 004.3 8a1.7 1.7 0 00-.3-1.9l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.9.3H9a1.7 1.7 0 001-1.5V2a2 2 0 014 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.9-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.9V9a1.7 1.7 0 001.5 1H22a2 2 0 010 4h-.1a1.7 1.7 0 00-1.5 1z" />
      </>
    ),
    trash: (
      <>
        <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M6 6l1 14a2 2 0 002 2h6a2 2 0 002-2l1-14M10 11v6M14 11v6" />
      </>
    ),
    crown: <path d="M3 7l4 4 5-7 5 7 4-4-1.6 12.5H4.6L3 7zM4.6 19.5h14.8" />,
  };
  const p = paths[name] || null;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={fill}
      stroke={color}
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="ic"
    >
      {p}
    </svg>
  );
}
