"use client";
import { isSupabaseConfigured } from "./supabase/env";

/**
 * Downscale + encode an image file to a WebP blob (max ~1200px), so uploads are
 * retina-sharp but small. Ported in spirit from the prototype image-slot.js.
 */
async function processImage(file: File, max = 1200, quality = 0.85): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas no disponible");
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close?.();
  return await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("encode falló"))), "image/webp", quality)
  );
}

export type UploadKind = "cover" | "option" | "avatar";

/**
 * Upload an image and return a URL. In demo mode (no Supabase) this returns an
 * ephemeral object URL so the UI works. In live mode (Phase 8) it uploads to
 * Supabase Storage and returns the public URL.
 */
export async function uploadImage(file: File, kind: UploadKind, id: string): Promise<string> {
  const blob = await processImage(file);
  if (!isSupabaseConfigured()) {
    return URL.createObjectURL(blob);
  }
  // Live mode: upload to Supabase Storage.
  const { getBrowserClient } = await import("./supabase/client");
  const supabase = getBrowserClient();
  const bucket = kind === "option" ? "option-photos" : "covers";
  const path = `${id}/${Date.now()}.webp`;
  const { error } = await supabase.storage.from(bucket).upload(path, blob, {
    contentType: "image/webp",
    upsert: true,
  });
  if (error) throw error;
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}
