"use client";
import { useEffect, useState } from "react";
import { Sheet } from "@/components/ui";
import { PhotoUpload } from "@/components/PhotoUpload";
import { useActions, useMe } from "@/lib/hooks";
import { useUI } from "@/store/ui";
import { PALETTE } from "@/lib/constants";

export function ProfileSheet({ open }: { open: boolean }) {
  const me = useMe();
  const { updateProfile } = useActions();
  const closeSheet = useUI((s) => s.closeSheet);
  const [name, setName] = useState("");
  const [color, setColor] = useState(PALETTE[0]);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    if (open && me) {
      setName(me.name || "");
      setColor(me.color || PALETTE[0]);
      setAvatarUrl(me.avatarUrl ?? null);
    }
  }, [open, me]);

  function save() {
    const n = name.trim();
    if (!n) return;
    updateProfile({ name: n, color, avatarUrl });
    closeSheet();
  }

  return (
    <Sheet open={open} onClose={closeSheet}>
      <h2 className="h2">Tu perfil</h2>
      <p className="muted" style={{ fontSize: 13, margin: "4px 0 16px" }}>
        Tu nombre y foto se ven en todas las pantallas y en las votaciones.
      </p>

      <div className="col center gap8" style={{ marginBottom: 18 }}>
        <PhotoUpload
          id={`avatar-${me?.id ?? "me"}`}
          kind="avatar"
          shape="circle"
          value={avatarUrl}
          tone={avatarUrl ? "" : "palm"}
          editable
          onChange={(url) => setAvatarUrl(url)}
          h={104}
          editPosition="br"
          editVariant="icon"
          editLabel="Cambiar foto"
        />
        {avatarUrl ? (
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setAvatarUrl(null)}>Quitar foto</button>
        ) : (
          <span className="muted" style={{ fontSize: 12 }}>Toca la cámara para subir tu foto 📸</span>
        )}
      </div>

      <label className="col gap8" style={{ marginBottom: 16 }}>
        <span className="field-label">Tu nombre</span>
        <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="¿Cómo te llamas?" autoFocus maxLength={40} />
      </label>

      <span className="field-label">Color del avatar {avatarUrl ? "(sin foto)" : ""}</span>
      <div className="row wrap gap10" style={{ marginTop: 8 }}>
        {PALETTE.map((c) => (
          <button
            key={c}
            type="button"
            aria-label={`Color ${c}`}
            onClick={() => setColor(c)}
            style={{
              width: 34, height: 34, borderRadius: "50%", background: c, cursor: "pointer",
              border: color === c ? "3px solid var(--ink)" : "3px solid #fff", boxShadow: "var(--sh-sm)",
            }}
          />
        ))}
      </div>

      <button className="btn btn-turq btn-block" style={{ marginTop: 22 }} disabled={!name.trim()} onClick={save}>
        Guardar
      </button>
    </Sheet>
  );
}
