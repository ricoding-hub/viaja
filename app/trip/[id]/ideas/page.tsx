"use client";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { EmptyState, Icon, Skeleton, fmt } from "@/components/ui";
import { Screen } from "@/components/Screen";
import { AppHeader } from "@/components/AppHeader";
import { PageGrid } from "@/components/PageGrid";
import { AddResearchSheet } from "@/components/AddResearchSheet";
import { useActions, useReady, useTrip } from "@/lib/hooks";
import { catMeta } from "@/lib/catMeta";
import { CAT_ORDER } from "@/lib/constants";
import type { Cat, ResearchItem, ResearchType } from "@/lib/types";

const TYPE_LABEL: Record<ResearchType, string> = { tiktok: "TikTok", flight: "Vuelo", link: "Link", note: "Nota" };
const CAT_TAG: Record<string, string> = { hospedaje: "tag-turq", transporte: "tag-grape", actividades: "tag-coral", comida: "tag-sun", general: "tag-turq" };

/** Pick a meaningful icon + color for an idea (keyword → type → category). */
function ideaGlyph(r: ResearchItem): { icon: string; color: string } {
  const t = `${r.title} ${r.source}`.toLowerCase();
  const C = catMeta;
  if (/airbnb|casa|cabañ|cabana|depa|departamento|\bhouse\b|bnb/.test(t)) return { icon: "home", color: C.hospedaje.color };
  if (/hotel|hostal|resort|suite|posada|lofts?/.test(t)) return { icon: "building", color: C.hospedaje.color };
  if (/alberca|piscina|pool|nadar|nado|jacuzzi/.test(t)) return { icon: "pool", color: "#1d8fd1" };
  if (/vuelo|flight|volaris|aerom|avi[oó]n|aeropuerto/.test(t) || r.type === "flight") return { icon: "plane", color: C.transporte.color };
  if (/taco|comida|restaurant|cena|desayuno|brunch|mariscos|mezcal|cerveza|coct/.test(t)) return { icon: "food", color: C.comida.color };
  if (/playa|tour|snorkel|surf|buceo|paseo|excursi|cenote|kayak/.test(t)) return { icon: "star", color: C.actividades.color };
  if (r.type === "tiktok") return { icon: "sparkle", color: "#FF6F5C" };
  if (r.type === "link") return { icon: "link", color: C.general.color };
  if (r.type === "note") return { icon: "note", color: "#FFB43E" };
  return { icon: C[r.cat].icon, color: C[r.cat].color };
}

export default function IdeasPage() {
  const { id } = useParams<{ id: string }>();
  const tripId = String(id);
  const ready = useReady();
  const router = useRouter();
  const { research, isHost, me, viewerId } = useTrip(tripId);
  const { addResearch, updateResearch, deleteResearch, convertResearch } = useActions();
  const [filter, setFilter] = useState<"all" | Cat>("all");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<ResearchItem | null>(null);
  const [confirmDel, setConfirmDel] = useState<string | null>(null);

  const header = <AppHeader title="Ideas & links" subtitle="Todo en un solo lugar, no más notas regadas 📌" back={() => router.push(`/trip/${tripId}`)} />;

  if (!ready) {
    return <Screen width="wide" header={header}><PageGrid min={320} gap={12}><Skeleton h={92} /><Skeleton h={92} /></PageGrid></Screen>;
  }

  const cats = [...CAT_ORDER, "general" as Cat].filter((c) => research.some((r) => r.cat === c));
  const shown = filter === "all" ? research : research.filter((r) => r.cat === filter);

  function openNew() {
    setEditing(null);
    setSheetOpen(true);
  }
  function openEdit(r: ResearchItem) {
    setEditing(r);
    setSheetOpen(true);
  }
  const canManage = (r: ResearchItem) => isHost || r.savedById === viewerId;

  return (
    <Screen width="wide" header={header}>
      <div className="col gap14">
        <button type="button" onClick={openNew} className="row center gap10" style={{ justifyContent: "center", padding: 15, borderRadius: 16, border: "2px dashed var(--line)", background: "transparent", cursor: "pointer", color: "var(--ink-2)", fontFamily: "var(--font-d)", fontWeight: 700 }}>
          <Icon name="plus" size={18} color="var(--coral)" /> Pegar link, TikTok o nota
        </button>

        {research.length === 0 ? (
          <EmptyState emoji="💭" title="Aún no hay ideas" sub="Pega tu primer link o nota — todo lo que encuentren vivirá aquí." />
        ) : (
          <>
            <div className="chip-row">
              <button className={"chip" + (filter === "all" ? " on" : "")} onClick={() => setFilter("all")}>Todo</button>
              {cats.map((c) => (
                <button key={c} className={"chip" + (filter === c ? " on" : "")} onClick={() => setFilter(c)}>
                  <Icon name={catMeta[c].icon} size={14} color={filter === c ? "#fff" : catMeta[c].color} /> {catMeta[c].label}
                </button>
              ))}
            </div>

            <PageGrid min={320} gap={12}>
              {shown.map((r) => {
                const g = ideaGlyph(r);
                return (
                  <article key={r.id} className="card row gap12" style={{ padding: 12, alignItems: "flex-start" }}>
                    <div style={{ width: 54, height: 54, borderRadius: 15, background: g.color + "1f", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
                      <Icon name={g.icon} size={25} color={g.color} stroke={2.1} />
                    </div>
                    <div className="grow col gap6" style={{ minWidth: 0 }}>
                      <div className="col" style={{ minWidth: 0 }}>
                        <span className="muted" style={{ fontSize: 11 }}>{TYPE_LABEL[r.type]} · guardó {r.saved}</span>
                        <b className="ellip" style={{ fontFamily: "var(--font-d)", fontSize: 14.5 }}>{r.title}</b>
                      </div>
                      <div className="row center gap6" style={{ flexWrap: "wrap" }}>
                        <span className={`tag ${CAT_TAG[r.cat]}`}>{catMeta[r.cat].label}</span>
                        {r.amount ? <span className="tag tag-sun tnum">{fmt(r.amount)}</span> : null}
                      </div>
                      <div className="row center between" style={{ marginTop: 2 }}>
                        <div className="row center gap6">
                          {r.converted ? (
                            <span className="tag tag-turq"><Icon name="check" size={12} color="var(--turq-deep)" /> Es opción</span>
                          ) : isHost && r.cat !== "general" ? (
                            <button className="btn btn-ghost btn-sm" onClick={() => convertResearch(r.id)}>→ Opción</button>
                          ) : null}
                        </div>
                        {canManage(r) && (
                          confirmDel === r.id ? (
                            <div className="row center gap6">
                              <span className="muted" style={{ fontSize: 12 }}>¿Borrar?</span>
                              <button className="chip-mini" onClick={() => { deleteResearch(r.id); setConfirmDel(null); }} style={{ color: "var(--coral-deep)" }}>Sí</button>
                              <button className="chip-mini" onClick={() => setConfirmDel(null)}>No</button>
                            </div>
                          ) : (
                            <div className="row center gap6">
                              {!r.converted && (
                                <button type="button" className="mini-btn" onClick={() => openEdit(r)} aria-label="Editar idea">
                                  <Icon name="edit" size={15} color="var(--ink-soft)" />
                                </button>
                              )}
                              <button type="button" className="mini-btn" onClick={() => setConfirmDel(r.id)} aria-label="Eliminar idea">
                                <Icon name="trash" size={15} color="var(--coral-deep)" />
                              </button>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </PageGrid>
          </>
        )}
      </div>

      <AddResearchSheet
        open={sheetOpen}
        savedBy={me?.name || "Tú"}
        savedById={viewerId}
        editing={editing}
        onClose={() => { setSheetOpen(false); setEditing(null); }}
        onAdd={(item) => addResearch(tripId, item)}
        onSave={(rid, patch) => updateResearch(rid, patch)}
      />
    </Screen>
  );
}
