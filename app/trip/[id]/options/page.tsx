"use client";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { EmptyState, Icon } from "@/components/ui";
import { OptionCard } from "@/components/OptionCard";
import { CompareSheet } from "@/components/CompareSheet";
import { GuestBanner } from "@/components/GuestBanner";
import { useActions, useReady, useTrip } from "@/lib/hooks";
import { catMeta } from "@/lib/catMeta";
import { CAT_ORDER } from "@/lib/constants";
import type { Cat } from "@/lib/types";

export default function OptionsPage() {
  const { id } = useParams<{ id: string }>();
  const tripId = String(id);
  const ready = useReady();
  const router = useRouter();
  const { options, members, viewerId, isHost, me } = useTrip(tripId);
  const { rate, toggleWinner, setOptionCover } = useActions();
  const [filter, setFilter] = useState<"all" | Cat>("all");
  const [compare, setCompare] = useState<Cat | null>(null);

  if (!ready) return null;

  const cats = CAT_ORDER.filter((c) => options.some((o) => o.cat === c));
  const shown = filter === "all" ? cats : cats.filter((c) => c === filter);

  return (
    <div className="scroll">
      <div className="safe-top" />
      <div className="pad col gap14">
        <div>
          <h1 style={{ fontSize: 26 }}>Opciones</h1>
          <p className="muted" style={{ fontSize: 13 }}>Comparen y voten con estrellas ⭐</p>
        </div>

        {!isHost && <GuestBanner person={me} />}

        {options.length === 0 ? (
          <EmptyState emoji="🏖️" title="Aún no hay opciones" sub="Convierte tus ideas en opciones para que el grupo las vote." cta={isHost ? "Ir a Ideas 💡" : undefined} onCta={() => router.push(`/trip/${tripId}/ideas`)} />
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
                <div key={cat} className="col gap10">
                  <div className="row center between">
                    <div className="row center gap8">
                      <Icon name={catMeta[cat].icon} size={18} color={catMeta[cat].color} />
                      <h3 style={{ fontSize: 17 }}>{catMeta[cat].label}</h3>
                    </div>
                    {opts.length > 1 && (
                      <button className="btn btn-ghost btn-sm" onClick={() => setCompare(cat)}>Comparar {opts.length}</button>
                    )}
                  </div>
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
                    />
                  ))}
                </div>
              );
            })}
          </>
        )}
        <div className="pb-nav" />
      </div>

      <CompareSheet open={!!compare} cat={compare} options={compare ? options.filter((o) => o.cat === compare) : []} onClose={() => setCompare(null)} />
    </div>
  );
}
