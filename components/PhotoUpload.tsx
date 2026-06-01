"use client";
import { useRef, useState, type CSSProperties, type ReactNode } from "react";
import { Photo } from "@/components/ui";
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
  placeholder?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

/**
 * Editable cover/photo. Shows the uploaded image or a tropical gradient
 * placeholder; tapping (when editable) opens the file picker and uploads.
 * Replaces the prototype <image-slot> drag-to-fill component.
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
  placeholder = "Toca para subir una foto 📷",
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
      <Photo tone={tone} src={value || undefined} h="100%" r={r} label={!value && !editable ? placeholder : undefined}>
        {children}
      </Photo>
      {editable && (
        <button type="button" className="ph-upload" onClick={() => inputRef.current?.click()} aria-label="Subir foto">
          {!value && <span className="ph-label" style={{ pointerEvents: "none" }}>📷 {placeholder}</span>}
          <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={onFile} />
        </button>
      )}
      {busy && <div className="ph-busy">Subiendo…</div>}
    </div>
  );
}
