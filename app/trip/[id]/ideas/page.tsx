"use client";
import { useState } from "react";
import { useParams } from "next/navigation";
import { EmptyState, Icon, Photo, SourceGlyph } from "@/components/ui";
import { AddResearchSheet } from "@/components/AddResearchSheet";
import { useActions, useReady, useTrip } from "@/lib/hooks";
import { catMeta } from "@/lib/catMeta";
import { CAT_ORDER } from "@/lib/constants";
import type { Cat, ResearchType } from "@/lib/types";

const TYPE_LABEL: Record<ResearchType, string> = { tiktok: "TikTok", flight: "Vuelo", link: "Link", note: "Nota" };
const CAT_TAG: Record<string, string> = { hospedaje: "tag-turq", transporte: "tag-grape", actividades: "tag-coral", comida: "tag-sun", general: "tag-turq" };

export default function IdeasPage() {
  const { id } = useParams<{ id: string }>();
  const tripId = String(id);
  const ready = useReady();
  const { research, isHost, me } = useTrip(tripId);
  const { addResearch, convertResearch } = useActions();
  const [filter, setFilter] = useState<"all" | Cat>("all");
  const [adding, setAdding] = useState(false);

  if (!ready) return null;

  const cats = CAT_ORDER.concat("general").filter((c) => research.some((r) => r.cat === c));
  const shown = filter === "all" ? research : research.filter((r) => r.cat === filter);

  return (
    <div className="scroll">
      <div className="safe-top" />
      <div className="pad col gap14">
        <div>
          <h1 style={{ fontSize: 26 }}>Ideas & links</h1>
          <p className="muted" style={{ fontSize: 13 }}>Todo en un solo lugar, no más notas regadas 📌</p>
        </div>

        <button type="button" onClick={() => setAdding(true)} className="row center gap10" style={{ justifyContent: "center", padding: 15, borderRadius: 16, border: "2px dashed var(--line)", background: "transparent", cursor: "pointer", color: "var(--ink-2)", fontFamily: "var(--font-d)", fontWeight: 700 }}>
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

            <div className="col gap10">
              {shown.map((r) => (
                <div key={r.id} className="card row gap12" style={{ padding: 10 }}>
                  <Photo tone={r.tone} h={84} r={12} style={{ width: 84, flex: "none" }} />
                  <div className="grow col gap4" style={{ minWidth: 0 }}>
                    <div className="row center gap8">
                      <SourceGlyph type={r.type} />
                      <div className="col" style={{ minWidth: 0 }}>
                        <span className="muted" style={{ fontSize: 11 }}>{TYPE_LABEL[r.type]} · guardó {r.saved}</span>
                        <b className="ellip" style={{ fontFamily: "var(--font-d)", fontSize: 14 }}>{r.title}</b>
                      </div>
                    </div>
                    <p className="muted ellip" style={{ fontSize: 12 }}>{r.note}</p>
                    <div className="row center between" style={{ marginTop: 2 }}>
                      <span className={`tag ${CAT_TAG[r.cat]}`}>{catMeta[r.cat].label}</span>
                      {r.converted ? (
                        <span className="tag tag-turq"><Icon name="check" size={12} color="var(--turq-deep)" /> Es opción</span>
                      ) : isHost && r.cat !== "general" ? (
                        <button className="btn btn-ghost btn-sm" onClick={() => convertResearch(r.id)}>→ Opción</button>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
        <div className="pb-nav" />
      </div>

      <AddResearchSheet open={adding} savedBy={me?.name || "Tú"} onClose={() => setAdding(false)} onAdd={(item) => addResearch(tripId, item)} />
    </div>
  );
}
