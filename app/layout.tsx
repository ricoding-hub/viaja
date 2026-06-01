import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppProviders } from "./providers";
import { DeviceFrame } from "@/components/DeviceFrame";
import { Toast } from "@/components/Toast";
import { ConfettiHost } from "@/components/ConfettiHost";
import { GlobalSheets } from "@/components/GlobalSheets";

export const metadata: Metadata = {
  title: "Viaja — Planeador de viajes en grupo",
  description:
    "Organiza viajes en grupo: presupuesto en vivo, votación de opciones e ideas en un solo lugar.",
  applicationName: "Viaja",
  appleWebApp: { capable: true, title: "Viaja", statusBarStyle: "default" },
  icons: { icon: "/icon.svg", apple: "/icon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#11BFB2",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <AppProviders>
          <DeviceFrame>
            {children}
            <Toast />
            <ConfettiHost />
            <GlobalSheets />
          </DeviceFrame>
        </AppProviders>
      </body>
    </html>
  );
}
