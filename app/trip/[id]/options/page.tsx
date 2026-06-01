"use client";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { EmptyState, Icon, Skeleton } from "@/components/ui";
import { Screen } from "@/components/Screen";
import { AppHeader } from "@/components/AppHeader";
import { PageGrid } from "@/components/PageGrid";
import { OptionCard } from "@/components/OptionCard";
import { CompareSheet } from "@/components/CompareSheet";
import { AddEditOptionSheet } from "@/components/AddEditOptionSheet";
import { GuestBanner } from "@/components/GuestBanner";
import { useActions, useReady, useTrip } from "@/lib/hooks";
import { catMeta } from "@/lib/catMeta";
import { CAT_ORDER } from "@/lib/constants";
import type { Cat, OptionItem } from "@/lib/types";

export default function OptionsPage() {
  const { id } = useParams<{ id: string }>();
  const tripId = String(id);
  const ready = useReady();
  const router = useRouter();
  const { options, members, viewerId, isHost, me } = useTrip(tripId);
  const { rate, toggleWinner, setOptionCover, addOption, updateOption, deleteOption } = useActions();
  const [filter, setFilter] = useState<"all" | Cat>("all");
  const [compare, setCompare] = useState<Cat | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<OptionItem | null>(null);

  function openNew() {
    setEditing(null);
    setSheetOpen(true);
  }
  function openEdit(o: OptionItem) {
    setEditing(o);
    setSheetOpen(true);
  }

  const addBtn = isHost ? (
    <button className="btn btn-coral btn-sm" onClick={openNew}><Icon name="plus" size={16} color="#fff" /> Opción</button>
  ) : undefined;

  if (!ready) {
    return (
      <Screen width="wide" header={<AppHeader title="Opciones" subtitle="Comparen y voten con estrellas ⭐" />}>
        <PageGrid min={320} gap={12}><Skeleton h={300} r={18} /><Skeleton h={300} r={18} /></PageGrid>
      </Screen>
    );
  }

  const cats = CAT_ORDER.filter((c) => options.some((o) => o.cat === c));
  const shown = filter === "all" ? cats : cats.filter((c) => c === filter);

  return (
    <Screen width="wide" header={<AppHeader title="Opciones" subtitle="Comparen y voten con estrellas ⭐" back={() => router.push(`/trip/${tripId}`)} actions={addBtn} />}>
      <div className="col gap16">
        {!isHost && <GuestBanner person={me} />}

        {options.length === 0 ? (
          <EmptyState
            emoji="🏖️"
            title="Aún no hay opciones"
            sub={isHost ? "Crea opciones (o convierte tus ideas) para que el grupo las vote." : "Cuando el anfitrión agregue opciones, podrás votarlas aquí."}
            cta={isHost ? "Crear opción ⭐" : undefined}
            onCta={openNew}
          />
        ) : (
          <>
            <div className="chip-row">
              <button className={"chip" + (filter === "all" ? " on" : "")} onClick={() => setFilter("all")}>Todas</button>
              {cats.map((c) => (
                <button key={c} className={"chip" + (filter === c ? " on" : "")} onClick={() => setFilter(c)}>
                  <Icon name={catMeta[c].icon} size={14} color={filter === c ? "#fff" : catMeta[c].color} /> {catMeta[c].label}
                </button>
              ))}
            </div>

            {shown.map((cat) => {
              const opts = options.filter((o) => o.cat === cat);
              return (
                <section key={cat} className="col gap12">
                  <div className="row center between">
                    <div className="row center gap8">
                      <Icon name={catMeta[cat].icon} size={18} color={catMeta[cat].color} />
                      <h2 className="h3">{catMeta[cat].label}</h2>
                    </div>
                    {opts.length > 1 && (
                      <button className="btn btn-ghost btn-sm" onClick={() => setCompare(cat)}>Comparar {opts.length}</button>
                    )}
                  </div>
                  <PageGrid min={320} gap={12}>
                    {opts.map((o) => (
                      <OptionCard
                        key={o.id}
                        o={o}
                        members={members}
                        viewerId={viewerId}
                        canChoose={isHost}
                        onRate={(n) => rate(o.id, n)}
                        onChoose={() => toggleWinner(o.id)}
                        onCover={(url) => setOptionCover(o.id, url)}
                        onEdit={isHost ? () => openEdit(o) : undefined}
                        onDelete={isHost ? () => deleteOption(o.id) : undefined}
                      />
                    ))}
                  </PageGrid>
                </section>
              );
            })}

            {isHost && (
              <button type="button" onClick={openNew} className="row center gap10" style={{ justifyContent: "center", padding: 15, borderRadius: 16, border: "2px dashed var(--line)", background: "transparent", cursor: "pointer", color: "var(--ink-2)", fontFamily: "var(--font-d)", fontWeight: 700 }}>
                <Icon name="plus" size={18} color="var(--coral)" /> Agregar otra opción
              </button>
            )}
          </>
        )}
      </div>

      <CompareSheet open={!!compare} cat={compare} options={compare ? options.filter((o) => o.cat === compare) : []} onClose={() => setCompare(null)} />
      <AddEditOptionSheet
        open={sheetOpen}
        editing={editing}
        onClose={() => { setSheetOpen(false); setEditing(null); }}
        onAdd={(draft) => addOption(tripId, draft)}
        onSave={(oid, patch) => updateOption(oid, patch)}
      />
    </Screen>
  );
}
