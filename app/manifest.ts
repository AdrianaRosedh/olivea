import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "OLIVEA | La Experiencia",
    short_name: "OLIVEA",
    description: "Una experencia del huerto a mesa",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#e9e8e5",
    theme_color: "#65735b",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" }
    ],
  };
}