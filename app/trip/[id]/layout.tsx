"use client";
import { useParams } from "next/navigation";
import { TabBar } from "@/components/TabBar";
import { TripSheets } from "@/components/TripSheets";

export default function TripLayout({ children }: { children: React.ReactNode }) {
  const params = useParams<{ id: string }>();
  const id = String(params.id);
  return (
    <>
      {children}
      <TabBar tripId={id} />
      <TripSheets tripId={id} />
    </>
  );
}
