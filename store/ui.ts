"use client";
import { create } from "zustand";

type SheetKind = "create" | "invite" | "viewer" | null;

interface UIState {
  toast: string | null;
  confetti: boolean;
  sheet: SheetKind;
  /** host-only "preview as guest" toggle (hides host controls, keeps identity) */
  previewAsGuest: boolean;

  showToast: (msg: string) => void;
  burst: () => void;
  openSheet: (k: Exclude<SheetKind, null>) => void;
  closeSheet: () => void;
  setPreviewAsGuest: (v: boolean) => void;
}

let toastTimer: ReturnType<typeof setTimeout> | undefined;
let confettiTimer: ReturnType<typeof setTimeout> | undefined;

export const useUI = create<UIState>((set) => ({
  toast: null,
  confetti: false,
  sheet: null,
  previewAsGuest: false,

  showToast: (msg) => {
    set({ toast: msg });
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => set({ toast: null }), 2200);
  },
  burst: () => {
    set({ confetti: true });
    clearTimeout(confettiTimer);
    confettiTimer = setTimeout(() => set({ confetti: false }), 1600);
  },
  openSheet: (k) => set({ sheet: k }),
  closeSheet: () => set({ sheet: null }),
  setPreviewAsGuest: (v) => set({ previewAsGuest: v }),
}));
