"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/ui";
import { TABS } from "@/lib/constants";

export function TabBar({ tripId }: { tripId: string }) {
  const pathname = usePathname();
  const base = `/trip/${tripId}`;
  return (
    <nav className="nav">
      {TABS.map((t) => {
        const href = t.seg ? `${base}/${t.seg}` : base;
        const on = t.seg ? pathname === href : pathname === base;
        return (
          <Link key={t.label} href={href} className={"nav-btn" + (on ? " on" : "")}>
            <Icon name={t.ic} size={24} color={on ? "var(--turq-deep)" : "var(--ink-soft)"} stroke={on ? 2.4 : 2} />
            <span>{t.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
