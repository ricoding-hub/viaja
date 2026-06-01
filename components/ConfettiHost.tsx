"use client";
import { Confetti } from "@/components/ui";
import { useUI } from "@/store/ui";

export function ConfettiHost() {
  const show = useUI((s) => s.confetti);
  return <Confetti show={show} />;
}
