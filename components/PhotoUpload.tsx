"use client";
import { useRef, useState, type CSSProperties, type ReactNode } from "react";
import { Icon, Photo } from "@/components/ui";
import { useUI } from "@/store/ui";
import { uploadImage, type UploadKind } from "@/lib/upload";
import type { Tone } from "@/lib/types";

export interface PhotoUploadProps {
  id: string;
  kind: UploadKind;
  tone?: Tone | string;
  value?: string | null;
  onChange?: (url: string) => void;
  editable?: boolean;
  h?: number | string;
  r?: number | string;
  /** corner for the edit button (default bottom-right) */
  editPosition?: "br" | "bl" | "tr" | "tl";
  /** labeled pill vs round camera icon */
  editVariant?: "label" | "icon";
  editLabel?: string;
  alt?: string;
  placeholder?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

/**
 * Editable cover/photo. The media is a non-interactive background; when
 * `editable`, a SMALL corner button opens the file picker — it never overlays
 * (and blocks) other controls. Replaces the prototype <image-slot>.
 */
export function PhotoUpload({
  id,
  kind,
  tone = "",
  value,
  onChange,
  editable = false,
  h = 150,
  r = 0,
  editPosition = "br",
  editVariant = "label",
  editLabel = "Cambiar portada",
  alt,
  placeholder,
  style,
  children,
}: PhotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const showToast = useUI((s) => s.showToast);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      setBusy(true);
      const url = await uploadImage(file, kind, id);
      onChange?.(url);
    } catch (err) {
      showToast("No se pudo subir la foto");
      console.error(err);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ position: "relative", height: h, borderRadius: r, overflow: "hidden", ...style }}>
      <Photo tone={tone} src={value || undefined} h="100%" r={r} alt={alt} label={!value && !editable ? placeholder : undefined} style={{ pointerEvents: "none" }}>
        {children}
      </Photo>
      {editable && (
        <button
          type="button"
          className={`ph-edit ph-edit-${editPosition}${editVariant === "icon" ? " ph-edit-icon" : ""}`}
          onClick={() => inputRef.current?.click()}
          aria-label={editLabel}
          title={editLabel}
        >
          <Icon name="camera" size={16} />
          {editVariant === "label" && <span>{value ? editLabel : placeholder || editLabel}</span>}
          <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={onFile} />
        </button>
      )}
      {busy && (
        <div className="ph-busy">
          <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Subiendo…
        </div>
      )}
    </div>
  );
}
