"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Av, Icon } from "@/components/ui";
import { TABS } from "@/lib/constants";
import { useMe, useTrip, useTrips } from "@/lib/hooks";
import { useData } from "@/lib/store";
import { useUI } from "@/store/ui";

/**
 * Desktop-only left rail (hidden < 860px via CSS). Route-aware: shows the trip
 * navigation on /trip/[id], or the trip switcher on Home. One source of truth
 * for navigation; the mobile bottom TabBar covers small screens.
 */
export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const tripId = pathname.match(/^\/trip\/([^/]+)/)?.[1] ?? "";
  const me = useMe();
  const mode = useData((s) => s.mode);
  const openSheet = useUI((s) => s.openSheet);
  const { trip, myRole } = useTrip(tripId);
  const { trips } = useTrips();

  // No rail on auth/standalone routes.
  const hidden = /^\/(login|auth|join)/.test(pathname);

  async function logout() {
    try {
      const { getBrowserClient } = await import("@/lib/supabase/client");
      await getBrowserClient().auth.signOut();
    } catch {
      /* demo mode: no-op */
    }
    router.push("/login");
    router.refresh();
  }

  if (hidden) return null;

  return (
    <aside className="sidebar">
      <Link href="/" className="side-brand" aria-label="Inicio">
        <span className="side-logo">🌴</span>
        <span className="display" style={{ fontSize: 22 }}>Viaja</span>
      </Link>

      {tripId && trip ? (
        <>
          <Link href="/" className="side-link" style={{ color: "var(--ink-soft)", fontWeight: 600 }}>
            <Icon name="chevL" size={18} /> Mis viajes
          </Link>
          <div className="card card-p" style={{ margin: "8px 4px 6px", padding: 12 }}>
            <div className="row center gap8">
              <span style={{ fontSize: 22 }}>{trip.emoji}</span>
              <div className="grow" style={{ minWidth: 0 }}>
                <div className="h3 ellip">{trip.name}</div>
                <div className="muted ellip" style={{ fontSize: 12 }}>{trip.sub}</div>
              </div>
            </div>
          </div>
          <nav aria-label="Navegación del viaje" className="col" style={{ gap: 2 }}>
            {TABS.map((t) => {
              const href = t.seg ? `/trip/${tripId}/${t.seg}` : `/trip/${tripId}`;
              const on = t.seg ? pathname === href : pathname === `/trip/${tripId}`;
              return (
                <Link key={t.label} href={href} className={"side-link" + (on ? " on" : "")} aria-current={on ? "page" : undefined}>
                  <Icon name={t.ic} size={20} stroke={on ? 2.4 : 2} /> {t.label}
                </Link>
              );
            })}
            <Link href={`/trip/${tripId}/guests`} className={"side-link" + (pathname === `/trip/${tripId}/guests` ? " on" : "")}>
              <Icon name="users" size={20} /> Invitados
            </Link>
          </nav>
          <button className="side-link" onClick={() => openSheet("invite")} style={{ marginTop: 4 }}>
            <Icon name="share" size={20} /> Invitar
          </button>
        </>
      ) : (
        <>
          <div className="side-sec">Mis viajes</div>
          <nav aria-label="Tus viajes" className="col" style={{ gap: 2 }}>
            {trips.slice(0, 6).map((t) => (
              <Link key={t.id} href={`/trip/${t.id}`} className="side-link">
                <span style={{ fontSize: 18 }}>{t.emoji}</span>
                <span className="ellip">{t.name}</span>
              </Link>
            ))}
          </nav>
          <button className="side-link" onClick={() => openSheet("create")} style={{ color: "var(--turq-deep)" }}>
            <Icon name="plus" size={20} color="var(--turq-deep)" /> Nuevo viaje
          </button>
        </>
      )}

      <div className="side-foot col gap10">
        <div className="hairline" />
        <div className="row center between gap8">
          <button type="button" className="row center gap10 grow" style={{ border: 0, background: "none", cursor: "pointer", padding: 4, borderRadius: 12, minWidth: 0, textAlign: "left" }} onClick={() => openSheet("profile")} aria-label="Editar tu perfil">
            {me && <Av p={me} size={34} />}
            <div className="col" style={{ minWidth: 0 }}>
              <b className="ellip" style={{ fontFamily: "var(--font-d)", fontSize: 14 }}>{me?.name ?? "Invitado"}</b>
              <span className="muted" style={{ fontSize: 11.5 }}>
                {tripId && trip ? (myRole === "host" ? "Anfitrión" : "Invitado") : "Editar perfil"}
              </span>
            </div>
          </button>
          {mode === "live" && (
            <button className="icon-btn" onClick={logout} aria-label="Cerrar sesión" title="Cerrar sesión" style={{ width: 38, height: 38 }}>
              <Icon name="logout" size={18} />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
