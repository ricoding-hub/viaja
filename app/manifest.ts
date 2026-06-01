import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Viaja — Planeador de viajes en grupo",
    short_name: "Viaja",
    description:
      "Organiza viajes en grupo: presupuesto en vivo, votación de opciones e ideas en un solo lugar.",
    start_url: "/",
    display: "standalone",
    background_color: "#FBF6EE",
    theme_color: "#11BFB2",
    orientation: "portrait",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
