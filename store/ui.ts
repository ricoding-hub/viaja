"use client";
import { create } from "zustand";

type SheetKind = "create" | "invite" | "settings" | "profile" | null;

interface UIState {
  toast: string | null;
  confetti: boolean;
  sheet: SheetKind;

  showToast: (msg: string) => void;
  burst: () => void;
  openSheet: (k: Exclude<SheetKind, null>) => void;
  closeSheet: () => void;
}

let toastTimer: ReturnType<typeof setTimeout> | undefined;
let confettiTimer: ReturnType<typeof setTimeout> | undefined;

export const useUI = create<UIState>((set) => ({
  toast: null,
  confetti: false,
  sheet: null,

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
}));
